<?php

namespace App\Actions;

use App\Services\FieldDetectorService;
use App\Services\PdfValidationService;
use App\Services\TextExtractorManager;
use Illuminate\Http\UploadedFile;

/**
 * Action to analyze document and detect fields.
 */
class AnalyzeDocument
{
    public function __construct(
        private readonly TextExtractorManager $textExtractor,
        private readonly FieldDetectorService $fieldDetector,
        private readonly PdfValidationService $pdfValidationService,
    ) {}

    /**
     * Analyzes a document and returns detected fields.
     *
     * @param  UploadedFile  $file  The document file
     * @return array{fields: array, text: string, message: string|null}
     */
    public function execute(UploadedFile $file): array
    {
        // Try normal extraction first
        try {
            $mime = $file->getMimeType();
            \Illuminate\Support\Facades\Log::info("AnalyzeDocument: Starting for file {$file->getClientOriginalName()}", ['mime' => $mime]);

            // If it's an image, skip text extraction and use Vision
            if (str_starts_with($mime, 'image/')) {
                // ...
                $base64 = base64_encode(file_get_contents($file->getRealPath()));
                $fields = $this->fieldDetector->detectFromImage($base64);

                return [
                    'fields' => $fields,
                    'text' => '', // No text extracted for images in analysis phase
                    'message' => 'Image analyzed using AI Vision',
                ];
            }

            \Illuminate\Support\Facades\Log::info("AnalyzeDocument: Attempting text extraction for {$mime}");
            $text = $this->textExtractor->extract($file);
            \Illuminate\Support\Facades\Log::info('AnalyzeDocument: Text extraction result', ['length' => strlen($text)]);

            if ($text === '') {
                \Illuminate\Support\Facades\Log::warning('AnalyzeDocument: Text extraction returned empty string');
                throw new \RuntimeException('No text extracted');
            }

            // Heuristic for scanned PDFs: If text is very short/sparse for a PDF, it's likely noise/watermark
            // 250 chars is a conservative threshold. A real invoice usually has >500-1000 chars.
            if (mb_strlen(trim($text)) < 300) {
                 \Illuminate\Support\Facades\Log::warning('AnalyzeDocument: Text extracted is too short/sparse, assuming scanned PDF. Triggering fallback.', ['length' => mb_strlen($text)]);
                 throw new \RuntimeException('Scanned PDF detected (sparse text)');
            }

            // If we got valid text, detect fields
            $fields = $this->fieldDetector->detect($text);

            return [
                'fields' => $fields,
                'text' => mb_substr($text, 0, 1000),
                'message' => null,
            ];

        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('AnalyzeDocument: Extraction failed, attempting fallback', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            // If extraction failed and it's a PDF, try conversion
            if ($file->getMimeType() === 'application/pdf') {
                return $this->handlePdfConversion($file);
            }

            // For non-PDF files or if conversion fails, return error
            throw $e;
        }
    }

    /**
     * Handles PDF conversion when normal extraction fails.
     */
    /**
     * Handles PDF conversion/analysis when normal extraction fails.
     */
    private function handlePdfConversion(UploadedFile $file): array
    {
        // Check file size first
        if ($file->getSize() > 10 * 1024 * 1024) { // 10MB limit
            return [
                'fields' => $this->fieldDetector->getDefaultFields(),
                'text' => '',
                'message' => 'PDF is too large for automatic analysis.',
            ];
        }

        try {
            // Updated Logic: Send PDF base64 directly to Vision (bypassing ImageMagick/PdfToImageService)
            // This aligns with the VisionStrategy implementation.

            $payload = [
                'data' => base64_encode(file_get_contents($file->getRealPath())),
                'mime' => 'application/pdf',
            ];

            // Detect from PDF payload (FieldDetectorService supports this structure via image_url)
            // WRAP IN ARRAY: detectFromImage expects a list of images or a single string.
            // If we pass an associative array directly, it iterates keys/values as separate "images".
            $fields = $this->fieldDetector->detectFromImage([$payload]);

            return [
                'fields' => $fields,
                'text' => '', // No text text for image/vision analysis
                'message' => 'PDF analyzed using AI Vision (Direct Input)',
            ];

        } catch (\Throwable $e) {
            // Fallback
            return [
                'fields' => $this->fieldDetector->getDefaultFields(),
                'text' => '',
                'message' => 'Could not analyze PDF: '.$e->getMessage(),
            ];
        }
    }
}
