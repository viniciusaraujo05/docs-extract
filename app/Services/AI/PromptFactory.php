<?php

declare(strict_types=1);

namespace App\Services\AI;

class PromptFactory
{
    public function getSystemPrompt(): string
    {
        return 'You are an expert data extraction assistant with advanced OCR capabilities. You can read text in images even if it is small, blurry, or low resolution. Extract structured data from the provided document text or image. Return ONLY valid JSON.';
    }

    public function createExtractionPrompt(string $context, array $schema): string
    {
        $fields = collect($schema['fields'] ?? [])->map(function($f) {
            if (is_string($f)) {
                return "- {$f} (string)";
            }
            return "- {$f['name']} ({$f['type']})";
        })->implode("\n");

        return <<<PROMPT
Extract the following fields from the document.
Strictly adhere to the provided schema.

FIELDS TO EXTRACT:
{$fields}

DOCUMENT CONTEXT:
{$context}

INSTRUCTIONS:
1. Return a VALID JSON object.
2. Based on the document image/text, find the value for each field above.
3. If a field is not found, use null.
4. Do not invent fields.
5. Format dates as YYYY-MM-DD.
6. Return raw values for numbers (e.g. 10.00 not $10.00).

Output JSON format:
{
    "extracted_data": {
        "field_name": "extracted_value"
    },
    "confidence": 85
}
PROMPT;
    }
}
