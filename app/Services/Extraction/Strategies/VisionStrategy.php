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

        // Always support images (they don't need PDF conversion)
        if (str_starts_with($mime, 'image/')) {
            return true;
        }

        // Support PDFs only if we can convert them to images
        if ($mime === 'application/pdf' && class_exists('Imagick')) {
            return true;
        }

        return false;
    }

    public function extract(Document $document, array $schema): array
    {
        $images = $this->getImagesFromDocument($document);

        if (empty($images)) {
            throw new RuntimeException('Could not convert document to images for Vision processing.');
        }

        // For now, we only process the first image/page or merge them?
        // To keep it simple for MVP/Improvement, let's take the first 3 pages/images maximum (to handle long docs partially)
        // ideally we stitch them or send multiple images in payload.
        // GPT-4o supports multiple images.

        return $this->processWithVision($images, $schema);
    }

    /**
     * @return array<string> Array of base64 encoded images
     */
    /**
     * @return array<string> Array of base64 encoded images
     */
    private function getImagesFromDocument(Document $document): array
    {
        // Use document's storage_disk if set (for temp files), otherwise use default
        $diskName = $document->storage_disk ?? config('filesystems.default');
        $disk = Storage::disk($diskName);
        $images = [];

        // ... (remote storage handling logic remains same, implicit via context) ...
        // For brevity in replacement, re-implementing the core logic

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
                        $images[] = ['data' => $slice, 'mime' => 'image/jpeg'];
                    }
                } else {
                    $images[] = [
                        'data' => base64_encode(file_get_contents($path)),
                        'mime' => $document->mime_type,
                    ];
                }
            } elseif ($document->mime_type === 'application/pdf') {
                try {
                    /** @var \App\Services\PdfToImageService $pdfService */
                    $pdfService = app(\App\Services\PdfToImageService::class);

                    $imagePaths = $pdfService->convertPdf($path);

                    foreach ($imagePaths as $imagePath) {
                        // PdfToImageService now returns PNGs
                        $images[] = [
                            'data' => base64_encode(file_get_contents($imagePath)),
                            'mime' => 'image/png',
                        ];
                    }

                    $pdfService->cleanup($imagePaths);

                } catch (\Exception $e) {
                    // PDF conversion failed
                    \Illuminate\Support\Facades\Log::error('VisionStrategy: PDF conversion failed', [
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                }
            }
        } finally {
            if ($isRemote && isset($tempPath) && file_exists($tempPath)) {
                @unlink($tempPath);
            }
        }

        return $images;
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
     * @param  array<array{data: string, mime: string}>  $images
     */
    private function processWithVision(array $images, array $schema): array
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
1. Extract ALL fields listed below from the document image(s).
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

        // Build user content array with text first, then images
        $userContent = [
            [
                'type' => 'text',
                'text' => $instructions,
            ],
        ];

        // Add all images to the content using dynamic MIME type
        foreach ($images as $img) {
            $userContent[] = [
                'type' => 'image_url',
                'image_url' => [
                    'url' => "data:{$img['mime']};base64,{$img['data']}",
                ],
            ];
        }

        /** @var \Illuminate\Http\Client\Response $response */
        $response = Http::withToken($apiKey)
            ->timeout(180)
            ->withoutVerifying()
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => $model,
                'messages' => [
                    ['role' => 'system', 'content' => 'You are an expert at extracting structured data from document images. Return only valid JSON.'],
                    ['role' => 'user', 'content' => $userContent],
                ],
                'temperature' => 0.0,
                'response_format' => ['type' => 'json_object'],
            ]);

        // ... (Response handling remains same) ...
        if (! $response->successful()) {
            throw new \App\Exceptions\ExtractionException(
                'extraction.openai_error',
                [],
                'OpenAI Vision API error: '.$response->body()
            );
        }

        $content = $response->json('choices.0.message.content');

        $data = json_decode($content, true);

        return [
            'data' => $data['extracted_data'] ?? $data,
            'confidence' => $data['confidence'] ?? null,
        ];
    }
}
