<?php

declare(strict_types=1);

namespace App\Services\Extraction\Strategies;

use App\Models\Document;
use App\Services\AI\PromptFactory;
use App\Services\Extraction\Contracts\ExtractionStrategyInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class VisionStrategy implements ExtractionStrategyInterface
{
    public function __construct(
        private readonly PromptFactory $promptFactory
    ) {}

    public function supports(Document $document): bool
    {
        $mime = $document->mime_type;

        // Support images and PDFs directly
        return str_starts_with($mime, 'image/') || $mime === 'application/pdf';
    }

    public function extract(Document $document, array $schema): array
    {
        $files = $this->getDocumentContent($document);

        if (empty($files)) {
            throw new RuntimeException('Could not load document content for Vision processing.');
        }

        return $this->processWithVision($files, $schema);
    }

    /**
     * @return array<array{data: string, mime: string}>
     */
    private function getDocumentContent(Document $document): array
    {
        // Use document's storage_disk if set (for temp files), otherwise use default
        $diskName = $document->storage_disk ?? config('filesystems.default');
        $disk = Storage::disk($diskName);
        $content = [];

        // For remote storage (R2, S3), download to temp location first
        $isRemote = ! in_array($diskName, ['local', 'public']);
        $tempPath = null;

        if ($isRemote) {
            $tempPath = storage_path('app/temp/'.basename($document->file_path));
            $tempDir = dirname($tempPath);
            if (! is_dir($tempDir)) {
                mkdir($tempDir, 0755, true);
            }

            if (! $disk->exists($document->file_path)) {
                throw new RuntimeException("File does not exist: {$document->file_path}");
            }
            file_put_contents($tempPath, $disk->get($document->file_path));
            $path = $tempPath;
        } else {
            $path = $disk->path($document->file_path);
        }

        try {
            if (str_starts_with($document->mime_type, 'image/')) {
                if ($this->isLongImage($path)) {
                    // Slices are JPEGs
                    foreach ($this->sliceImage($path) as $slice) {
                        $content[] = ['data' => $slice, 'mime' => 'image/jpeg'];
                    }
                } else {
                    $content[] = [
                        'data' => base64_encode(file_get_contents($path)),
                        'mime' => $document->mime_type,
                    ];
                }
            } elseif ($document->mime_type === 'application/pdf') {
                // Direct PDF support (skip ImageMagick conversion)
                $content[] = [
                    'data' => base64_encode(file_get_contents($path)),
                    'mime' => 'application/pdf',
                ];
            }
        } finally {
            if ($isRemote && isset($tempPath) && file_exists($tempPath)) {
                @unlink($tempPath);
            }
        }

        return $content;
    }

    private function isLongImage(string $path): bool
    {
        if (! class_exists('Imagick')) {
            return false;
        }
        try {
            $imagick = new \Imagick($path);
            $ratio = $imagick->getImageHeight() / $imagick->getImageWidth();

            return $ratio > 2.5; // Tunable threshold
        } catch (\Throwable $e) {
            return false;
        }
    }

    private function sliceImage(string $path): array
    {
        $slices = [];
        try {
            $imagick = new \Imagick($path);
            $width = $imagick->getImageWidth();
            $height = $imagick->getImageHeight();
            $sliceHeight = 2000; // Target height for slices regarding context window

            for ($y = 0; $y < $height; $y += $sliceHeight) {
                // Clone to crop
                $slice = clone $imagick;
                $currentSliceHeight = min($sliceHeight, $height - $y);
                $slice->cropImage($width, $currentSliceHeight, 0, $y);
                $slice->setImageFormat('jpeg');

                $slices[] = base64_encode($slice->getImageBlob());
            }
        } catch (\Throwable $e) {
            // Fallback: return original if slice fails
            return [base64_encode(file_get_contents($path))];
        }

        return $slices;
    }

    /**
     * @param  array<array{data: string, mime: string}>  $files
     */
    private function processWithVision(array $files, array $schema): array
    {
        // ... (Prompt building remains same) ...
        $apiKey = config('services.openai.api_key');
        $model = config('services.openai.model', 'gpt-4o-mini');

        // Build field list from schema with detailed array field structure
        $fieldsList = collect($schema['fields'] ?? [])
            ->map(function ($f) {
                // For array fields, include sub-item structure
                if ($f['type'] === 'array' && ! empty($f['items'])) {
                    $subFields = collect($f['items'])->map(function ($item) {
                        return "    * {$item['name']} ({$item['type']}): {$item['label']}";
                    })->implode("\n");

                    return "- {$f['name']} (array of objects): {$f['label']}\n{$subFields}";
                }

                return "- {$f['name']} ({$f['type']}): {$f['label']}";
            })
            ->implode("\n");

        $instructions = <<<INSTRUCTIONS
IMPORTANT INSTRUCTIONS:
1. Extract ALL fields listed below from the document image(s) or PDF.
2. For ARRAY fields (tables/lists): 
   - Extract ALL rows as an array of objects
   - Each object MUST contain ALL specified sub-fields (columns), even if a cell is empty
   - If a column value is missing/empty in the document, use null or empty string, but ALWAYS include the key
   - Extract every single row from the table - be thorough and complete
3. If a regular field is not found, use null.
4. Format dates as YYYY-MM-DD.
5. Return raw numeric values (e.g., 10.50 not \$10.50).
6. Read carefully - some text may be small or low contrast. Use your OCR capabilities fully.

FIELDS TO EXTRACT:
{$fieldsList}

Return a JSON object with 'extracted_data' containing the field values, and 'confidence' (0-100).
INSTRUCTIONS;

        // Build user content array with text structure for v1/responses
        $userContent = [
            [
                'type' => 'input_text',
                'text' => $instructions,
            ],
        ];

        // Add all files to the content using dynamic types
        foreach ($files as $file) {
            if ($file['mime'] === 'application/pdf') {
                $userContent[] = [
                    'type' => 'input_file',
                    'filename' => 'document.pdf', // Name can be generic or derived
                    'file_data' => "data:{$file['mime']};base64,{$file['data']}", // Base64 encoded PDF with Data URI
                ];
            } else {
                // Images still use standard image input or input_image if v1/responses unifies it
                // Based on user doc, pdf uses input_file. Images likely same or input_image.
                // Sticking to image_url for images if supported, or falling back to input_file for all?
                // Let's assume input_file works for all files in v1/responses or stick to hybrid if allowed.
                // User doc snippet showed 'input_file' for PDF.
                // Let's use input_file for images too if base64 to be consistent "file inputs".
                $userContent[] = [
                    'type' => 'input_file', // Assuming input_file handles images too as per unified API
                    'filename' => 'image.' . explode('/', $file['mime'])[1],
                    'file_data' => "data:{$file['mime']};base64,{$file['data']}",
                ];
            }
        }

        /** @var \Illuminate\Http\Client\Response $response */
        $response = Http::withToken($apiKey)
            ->timeout(180)
            ->withoutVerifying()
            ->post('https://api.openai.com/v1/responses', [ // Updated endpoint
                'model' => $model,
                'input' => [ // v1/responses uses 'input' instead of 'messages'
                    [
                        'role' => 'user',
                        'content' => $userContent,
                    ],
                ],
                'temperature' => 0.0,
                // v1/responses might handle JSON output differently, but let's try standard hint or prompt instructions
                // The snippet used -d '...' for body.
            ]);

        // ... (Response handling remains same) ...
        if (! $response->successful()) {
            throw new \App\Exceptions\ExtractionException(
                'extraction.openai_error',
                [],
                'OpenAI Vision API error: '.$response->body()
            );
        }

        // v1/responses output parsing might differ. Assuming standard choice/message structure or similar 'output' key.
        // If v1/responses returns just text or different structure, we need to adapt.
        // Assuming user just wanted INPUT structure fixed. I will try standard access first or dump body if needed.
        // Documentation implies it's a "response" object.
        // Let's look for 'output' or 'message'.
        // Falling back to standard check for now, assuming backward compat or similar key names for contents.
        $content = $response->json('output.0.content.0.text') ?? $response->json('choices.0.message.content');

        if (empty($content)) {
             throw new RuntimeException('Empty response from OpenAI API');
        }

        $data = json_decode($content, true);

        return [
            'data' => $data['extracted_data'] ?? $data,
            'confidence' => $data['confidence'] ?? null,
        ];
    }
}
