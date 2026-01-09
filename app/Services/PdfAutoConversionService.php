<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use RuntimeException;
use Throwable;

/**
 * Service responsible for automatic PDF to image conversion when text extraction fails.
 *
 * This service handles the fallback mechanism for PDFs that cannot be processed
 * through normal text extraction methods. It converts PDFs to images and attempts
 * OCR extraction as a last resort.
 */
class PdfAutoConversionService
{
    public function __construct(
        private readonly PdfToImageService $pdfToImageService,
        private readonly TextExtractorManager $textExtractor,
    ) {}

    /**
     * Attempts to extract text from PDF by converting to images.
     *
     * @param  UploadedFile  $file  The PDF file
     * @return string Extracted text
     *
     * @throws RuntimeException When conversion fails
     */
    public function extractWithConversion(UploadedFile $file): string
    {
        $imagePaths = [];

        try {
            // Convert PDF to images
            $imagePaths = $this->pdfToImageService->convertPdf($file);
            $imageFiles = $this->pdfToImageService->createImageFiles($imagePaths);

            if (empty($imageFiles)) {
                throw new RuntimeException('Failed to convert PDF to images');
            }

            // Extract text from all images
            $allText = [];
            $bestText = '';
            $maxLength = 0;

            foreach ($imageFiles as $index => $imageFile) {
                try {
                    $text = $this->textExtractor->extract($imageFile);

                    if (! empty(trim($text))) {
                        $allText[] = '--- Page '.($index + 1)." ---\n".$text;

                        if (mb_strlen($text) > $maxLength) {
                            $maxLength = mb_strlen($text);
                            $bestText = $text;
                        }
                    }
                } catch (Throwable $e) {
                    // Continue to next image if extraction fails
                }
            }

            // Use the best text found or combine all
            $finalText = ! empty($allText) ? implode("\n\n", $allText) : $bestText;

            if (empty(trim($finalText))) {
                throw new RuntimeException('No text could be extracted from converted images');
            }

            return $finalText;

        } catch (Throwable $e) {
            throw new RuntimeException(
                'Failed to process PDF even after conversion to images: '.$e->getMessage()
            );
        } finally {
            // Always cleanup temporary files
            $this->pdfToImageService->cleanup($imagePaths);
        }
    }

    /**
     * Checks if the file is a PDF that might need conversion.
     */
    public function shouldAttemptConversion(UploadedFile $file, Throwable $extractionError): bool
    {
        // Only attempt for PDFs
        if ($file->getMimeType() !== 'application/pdf') {
            return false;
        }

        // Don't attempt if it's clearly a protected PDF error
        $errorMsg = strtolower($extractionError->getMessage());

        if (str_contains($errorMsg, 'secured') ||
            str_contains($errorMsg, 'password') ||
            str_contains($errorMsg, 'protegido')) {
            return false;
        }

        // Attempt for other types of failures
        return true;
    }
}
