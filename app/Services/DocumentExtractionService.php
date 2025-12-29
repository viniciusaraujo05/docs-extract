<?php

namespace App\Services;

use App\Actions\ExtractDocumentData;
use App\Actions\FormatErrorMessage;
use App\Services\PdfAutoConversionService;
use App\Services\PdfValidationService;
use App\Services\TextExtractorManager;
use Illuminate\Http\UploadedFile;
use RuntimeException;

/**
 * Service to handle document extraction with automatic fallbacks.
 */
class DocumentExtractionService
{
    public function __construct(
        private readonly TextExtractorManager $textExtractor,
        private readonly PdfValidationService $pdfValidationService,
        private readonly PdfAutoConversionService $pdfConversionService,
        private readonly ExtractDocumentData $extractDataAction,
        private readonly FormatErrorMessage $formatErrorAction,
    ) {}

    /**
     * Extracts data from document with smart fallbacks.
     * 
     * @param UploadedFile $file The document file
     * @param array $fields Fields to extract
     * @return array{success: bool, data?: array, confidence?: int|null, error?: string}
     */
    public function extract(UploadedFile $file, array $fields): array
    {
        // For PDFs, check extractability first to save OpenAI credits
        if ($file->getMimeType() === 'application/pdf') {
            $validation = $this->pdfValidationService->validatePdfExtractability($file);
            
            // If PDF is definitely not extractable, skip straight to conversion
            if ($this->pdfValidationService->isPdfDefinitelyNotExtractable($file)) {
                return $this->extractFromConvertedPdf($file, $fields);
            }
        }
        
        // Try normal extraction first
        try {
            $text = $this->textExtractor->extract($file);
            $text = $this->ensureTextExists($text, $file);
            
            // Extract structured data
            $result = $this->extractDataAction->execute($text, $fields);
            
            return [
                'success' => true,
                'data' => $result['data'],
                'confidence' => $result['confidence'],
            ];
            
        } catch (\Throwable $e) {
            // If it's a PDF, try conversion as fallback
            if ($file->getMimeType() === 'application/pdf') {
                return $this->extractFromConvertedPdf($file, $fields, $e);
            }
            
            // Format and return error
            $errorResponse = $this->formatErrorAction->execute($e, false);
            
            return [
                'success' => false,
                'error' => $errorResponse['error'],
                'error_type' => $errorResponse['error_type'],
                'suggestions' => $errorResponse['suggestions'],
            ];
        }
    }

    /**
     * Extracts data from PDF converted to images.
     */
    private function extractFromConvertedPdf(UploadedFile $file, array $fields, ?\Throwable $originalError = null): array
    {
        try {
            // Check file size - if too large, suggest manual conversion
            if ($file->getSize() > 5 * 1024 * 1024) { // 5MB
                return [
                    'success' => false,
                    'error' => 'PDF is too large for automatic conversion. Please convert to images manually.',
                    'error_type' => 'processing_error',
                    'suggestions' => [
                        'Convert PDF to images using an online tool',
                        'Split PDF into smaller files',
                        'Use a PDF compression tool first',
                    ],
                ];
            }
            
            $text = $this->pdfConversionService->extractWithConversion($file);
            $result = $this->extractDataAction->execute($text, $fields);

            return [
                'success' => true,
                'data' => $result['data'],
                'confidence' => $result['confidence'],
                'conversion_note' => 'PDF was automatically converted to image for text extraction',
            ];

        } catch (\Throwable $e) {
            return [
                'success' => false,
                'error' => 'Failed to process PDF even after conversion. Please convert to JPG/PNG manually.',
                'error_type' => 'processing_error',
                'suggestions' => [
                    'Convert PDF to image (JPG/PNG) manually',
                    'Check if PDF is not corrupted',
                    'Try a different PDF',
                    'Use an online PDF to image converter',
                ],
            ];
        }
    }

    /**
     * Ensures text exists, using filename as fallback.
     */
    private function ensureTextExists(string $text, UploadedFile $file): string
    {
        return $text === '' ? "Document: {$file->getClientOriginalName()}" : $text;
    }
}
