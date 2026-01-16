<?php

declare(strict_types=1);

namespace App\Services\Extraction\Strategies;

use App\Models\Document;
use App\Services\Extraction\Contracts\ExtractionStrategyInterface;
use App\Services\AI\PromptFactory;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use RuntimeException;

final class VisionStrategy implements ExtractionStrategyInterface
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
        $path = Storage::disk(config('filesystems.default'))->path($document->file_path);
        $images = [];
        
        Log::info("VisionStrategy: Processing document", [
            'mime_type' => $document->mime_type,
            'path' => $path,
            'exists' => file_exists($path)
        ]);

        if (str_starts_with($document->mime_type, 'image/')) {
            // Check dimensions and slice if necessary
            if ($this->isLongImage($path)) {
                Log::info("VisionStrategy: Image is long, slicing");
                $images = $this->sliceImage($path);
            } else {
                Log::info("VisionStrategy: Loading image normally");
                $images[] = base64_encode(file_get_contents($path));
            }
            Log::info("VisionStrategy: Prepared " . count($images) . " image slice(s)");
        } elseif ($document->mime_type === 'application/pdf') {
            try {
                // Use centralized PDF to Image service
                $fullPath = Storage::disk(config('filesystems.default'))->path($document->file_path);
                
                /** @var \App\Services\PdfToImageService $pdfService */
                $pdfService = app(\App\Services\PdfToImageService::class);
                
                $imagePaths = $pdfService->convertPdf($fullPath);
                
                foreach ($imagePaths as $imagePath) {
                    $images[] = base64_encode(file_get_contents($imagePath));
                }
                
                // Cleanup temp images immediately after reading
                $pdfService->cleanup($imagePaths);
                
            } catch (\Exception $e) {
                Log::warning("PDF to Image conversion failed: " . $e->getMessage());
                return []; 
            }
        }

        return $images;
    }

    private function isLongImage(string $path): bool
    {
        if (!file_exists($path)) {
            return false;
        }

        // Simple check using getimagesize
        $size = getimagesize($path);
        if (!$size) return false;

        // Arbitrary threshold: height > 2000px
        return $size[1] > 2000;
    }

    private function sliceImage(string $path): array
    {
        if (!extension_loaded('gd')) {
            Log::warning("GD extension not loaded, cannot slice long image. Sending as is.");
            return [base64_encode(file_get_contents($path))];
        }

        $info = getimagesize($path);
        if (!$info) return [base64_encode(file_get_contents($path))];

        $width = $info[0];
        $height = $info[1];
        $mime = $info['mime'];

        $source = match ($mime) {
            'image/jpeg' => imagecreatefromjpeg($path),
            'image/png' => imagecreatefrompng($path),
            'image/webp' => imagecreatefromwebp($path),
            default => null,
        };

        if (!$source) {
            return [base64_encode(file_get_contents($path))];
        }

        $sliceHeight = 2000;
        $overlap = 200;
        $slices = [];
        $y = 0;

        while ($y < $height) {
            $currentHeight = min($sliceHeight, $height - $y);
            
            $dest = imagecreatetruecolor($width, $currentHeight);
            imagecopy($dest, $source, 0, 0, 0, $y, $width, $currentHeight);

            ob_start();
            imagejpeg($dest, null, 90);
            $slices[] = base64_encode(ob_get_clean());

            imagedestroy($dest);

            if ($y + $currentHeight >= $height) {
                break;
            }

            $y += ($sliceHeight - $overlap);
        }

        imagedestroy($source);

        return $slices;
    }

    private function processWithVision(array $base64Images, array $schema): array
    {
        $apiKey = config('services.openai.api_key');
        $model = config('services.openai.model', 'gpt-4o-mini');
        
        // Build field list from schema with detailed array field structure
        $fieldsList = collect($schema['fields'] ?? [])
            ->map(function($f) {
                // For array fields, include sub-item structure
                if ($f['type'] === 'array' && !empty($f['items'])) {
                    $subFields = collect($f['items'])->map(function($item) {
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

Example for array fields (note ALL columns present even if some values are null):
{
  "extracted_data": {
    "items": [
      {"product": "Item 1", "quantity": 2, "price": 10.50, "notes": ""},
      {"product": "Item 2", "quantity": null, "price": 25.00, "notes": "Urgent"}
    ]
  },
  "confidence": 90
}
INSTRUCTIONS;

        // Build user content array with text first, then images
        $userContent = [
            [
                'type' => 'text',
                'text' => $instructions,
            ]
        ];

        // Add all images to the content
        foreach ($base64Images as $img) {
            $userContent[] = [
                'type' => 'image_url',
                'image_url' => [
                    'url' => "data:image/jpeg;base64,{$img}",
                ]
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

        if (!$response->successful()) {
            throw new RuntimeException('OpenAI Vision API error: ' . $response->body());
        }

        $content = $response->json('choices.0.message.content');
        Log::info('Vision API Response: ' . $content);
        
        $data = json_decode($content, true);

        return [
            'data' => $data['extracted_data'] ?? $data,
            'confidence' => $data['confidence'] ?? null,
        ];
    }
}
