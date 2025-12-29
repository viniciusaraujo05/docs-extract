<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Smalot\PdfParser\Parser;
use RuntimeException;

/**
 * Service to validate PDF extractability before using expensive AI services.
 */
class PdfValidationService
{
    /**
     * Checks if PDF is likely to be extractable without AI.
     * 
     * @param UploadedFile $file The PDF file
     * @return array{valid: bool, reason: string, confidence: float}
     */
    public function validatePdfExtractability(UploadedFile $file): array
    {
        $path = $file->getRealPath();
        if ($path === false) {
            return [
                'valid' => false,
                'reason' => 'Cannot access file',
                'confidence' => 0.0,
            ];
        }

        try {
            $parser = new Parser();
            $pdf = $parser->parseFile($path);
            
            // Check if PDF has text content
            $text = $pdf->getText();
            $pages = $pdf->getPages();
            
            // Analyze text density
            $totalTextLength = mb_strlen(trim($text));
            $pageCount = count($pages);
            $avgTextPerPage = $pageCount > 0 ? $totalTextLength / $pageCount : 0;
            
            // Check for common issues
            $issues = [];
            
            // Very little text likely means image-based PDF
            if ($avgTextPerPage < 50) {
                $issues[] = 'Very little text detected (likely image-based)';
            }
            
            // Check for protected PDF
            try {
                $details = $pdf->getDetails();
                if (isset($details['Encrypted']) && $details['Encrypted']) {
                    $issues[] = 'PDF is encrypted/protected';
                }
            } catch (\Exception $e) {
                // If we can't get details, might be protected
                $issues[] = 'Cannot read PDF details (might be protected)';
            }
            
            // Calculate confidence score
            $confidence = $this->calculateConfidence($totalTextLength, $pageCount, $issues);
            
            // Determine if valid for direct extraction
            $isValid = $confidence > 0.6 && empty($issues);
            
            return [
                'valid' => $isValid,
                'reason' => $issues[0] ?? ($isValid ? 'PDF appears to have extractable text' : 'Low text content'),
                'confidence' => $confidence,
                'text_length' => $totalTextLength,
                'pages' => $pageCount,
                'issues' => $issues,
            ];
            
        } catch (\Exception $e) {
            return [
                'valid' => false,
                'reason' => 'Cannot parse PDF: ' . $e->getMessage(),
                'confidence' => 0.0,
            ];
        }
    }
    
    /**
     * Calculates confidence score for PDF extractability.
     */
    private function calculateConfidence(int $textLength, int $pageCount, array $issues): float
    {
        $score = 1.0;
        
        // Reduce score based on text density
        $avgTextPerPage = $pageCount > 0 ? $textLength / $pageCount : 0;
        if ($avgTextPerPage < 50) {
            $score -= 0.5;
        } elseif ($avgTextPerPage < 100) {
            $score -= 0.3;
        } elseif ($avgTextPerPage < 200) {
            $score -= 0.1;
        }
        
        // Reduce score for each issue
        $score -= count($issues) * 0.3;
        
        return max(0.0, min(1.0, $score));
    }
    
    /**
     * Quick check if PDF is definitely not extractable.
     */
    public function isPdfDefinitelyNotExtractable(UploadedFile $file): bool
    {
        $validation = $this->validatePdfExtractability($file);
        
        // If confidence is very low or has critical issues
        $issues = $validation['issues'] ?? [];
        
        return $validation['confidence'] < 0.2 || 
               in_array('PDF is encrypted/protected', $issues, true);
    }
}
