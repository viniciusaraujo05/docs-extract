<?php

namespace App\Actions;

use App\Services\ExtractionService;

/**
 * Action to extract structured data from text using AI.
 */
class ExtractDocumentData
{
    public function __construct(
        private readonly ExtractionService $extractionService,
    ) {}

    /**
     * Extracts structured data from text based on provided fields.
     *
     * @param  string  $text  The text to extract data from
     * @param  array  $fields  The fields to extract
     * @return array Extracted data with confidence
     */
    public function execute(string $text, array $fields): array
    {
        try {
            $result = $this->extractionService->extract($text, ['fields' => $fields]);

            return [
                'success' => true,
                'data' => $result['data'] ?? $result,
                'confidence' => $result['confidence'] ?? null,
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
}
