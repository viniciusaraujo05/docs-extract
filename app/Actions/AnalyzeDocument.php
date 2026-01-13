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

            // If it's an image, skip text extraction and use Vision
            if (str_starts_with($mime, 'image/')) {
                $base64 = base64_encode(file_get_contents($file->getRealPath()));
                $fields = $this->fieldDetector->detectFromImage($base64);
                
                return [
                    'fields' => $fields,
                    'text' => '', // No text extracted for images in analysis phase
                    'message' => 'Image analyzed using AI Vision',
                ];
            }

            $text = $this->textExtractor->extract($file);

            if ($text === '') {
                throw new \RuntimeException('No text extracted');
            }

            // If we got text, detect fields
            $fields = $this->fieldDetector->detect($text);

            return [
                'fields' => $fields,
                'text' => mb_substr($text, 0, 1000),
                'message' => null,
            ];

        } catch (\Throwable $e) {
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
     * Handles PDF conversion when normal extraction fails.
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
            /** @var \App\Services\PdfToImageService $pdfService */
            $pdfService = app(\App\Services\PdfToImageService::class);
            
            // Convert first page only for analysis
            $imagePaths = $pdfService->convertPdf($file);
            
            if (empty($imagePaths)) {
                throw new \RuntimeException('Failed to convert PDF to image');
            }
            
            // Use first page for detection
            $firstPage = $imagePaths[0];
            $base64 = base64_encode(file_get_contents($firstPage));
            
            // Clean up
            $pdfService->cleanup($imagePaths);
            
            // Detect from image
            $fields = $this->fieldDetector->detectFromImage($base64);

            return [
                'fields' => $fields,
                'text' => '', // No text text for image analysis
                'message' => 'PDF analyzed using AI Vision (converted to image)',
            ];
            
        } catch (\Throwable $e) {
            // Fallback
             return [
                'fields' => $this->fieldDetector->getDefaultFields(),
                'text' => '',
                'message' => 'Could not analyze PDF: ' . $e->getMessage(),
            ];
        }
    }
}
