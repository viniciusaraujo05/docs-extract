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
            
            // For array fields, include sub-item structure
            if ($f['type'] === 'array' && !empty($f['items'])) {
                $subFields = collect($f['items'])->map(function($item) {
                    return "    * {$item['name']} ({$item['type']}): {$item['label']}";
                })->implode("\n");
                
                return "- {$f['name']} (array of objects): {$f['label']}\n{$subFields}";
            }
            
            return "- {$f['name']} ({$f['type']}): " . ($f['label'] ?? $f['name']);
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
7. For ARRAY fields (tables/lists): 
   - Extract ALL rows as an array of objects
   - Each object MUST contain ALL specified sub-fields (columns), even if empty
   - If a column value is missing/empty, use null or empty string, but include the key
   - Extract every row from the table, not just the first few
   - Example:
     "items": [
       {"product": "Item 1", "quantity": 2, "price": 10.50},
       {"product": "Item 2", "quantity": null, "price": 25.00}
     ]
8. Be thorough and extract complete data.

Output JSON format:
{
    "extracted_data": {
        "field_name": "extracted_value",
        "array_field_name": [
            {"sub_field1": "value1", "sub_field2": "value2"},
            {"sub_field1": "value3", "sub_field2": "value4"}
        ]
    },
    "confidence": 85
}
PROMPT;
    }
}
