<?php

declare(strict_types=1);

namespace App\Services;

use App\Contracts\ExtractionLoggerInterface;
use App\Contracts\FieldValidatorInterface;
use App\Models\Document;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use JsonException;
use RuntimeException;

/**
 * Enhanced Extraction Service
 *
 * Improved extraction service with:
 * - Full observability and logging
 * - Post-extraction validation
 * - Field-level confidence tracking
 * - Modular prompt building
 * - Performance metrics
 *
 * This service orchestrates the entire extraction pipeline:
 * 1. Start execution tracking
 * 2. Build optimized prompt
 * 3. Call AI model
 * 4. Validate and normalize results
 * 5. Record metrics and outcomes
 */
final class EnhancedExtractionService
{
    private const API_URL = 'https://api.openai.com/v1/chat/completions';

    private const TEMPERATURE = 0.1;

    private const TIMEOUT = 120;

    private const CONFIDENCE_THRESHOLD = 70;

    public function __construct(
        private readonly ExtractionLoggerInterface $logger,
        private readonly FieldValidatorInterface $validator
    ) {}

    /**
     * Extract structured data from document text.
     *
     * @param  Document  $document  The document being processed
     * @param  string  $text  Raw text extracted from document
     * @param  array{fields: array<array{name: string, type: string, label?: string, required?: bool, pattern?: string, min?: mixed, max?: mixed}>}  $schema  Field schema
     * @return array{data: array<string, mixed>, confidence: int|null, validation_errors: array<string, array<string>>, low_confidence_fields: array<string>}
     *
     * @throws RuntimeException If extraction fails
     */
    public function extract(Document $document, string $text, array $schema): array
    {
        $startTime = microtime(true);
        $apiKey = $this->getApiKey();
        $model = config('services.openai.model', 'gpt-4o-mini');

        // Build optimized prompt
        $prompt = $this->buildPrompt($text, $schema);

        // Start execution tracking
        $execution = $this->logger->startExecution($document, $model, $prompt);

        try {
            // Call OpenAI API
            $response = $this->callOpenAI($apiKey, $model, $prompt);

            // Parse response
            $parsed = $this->parseResponse($response->json('choices.0.message.content'));

            // Validate and normalize extracted data
            $validated = $this->validateAndNormalize($parsed['data'], $schema);

            // Identify low confidence fields
            $lowConfidenceFields = $this->identifyLowConfidenceFields(
                $validated['normalized_data'],
                $parsed['confidence']
            );

            // Calculate execution time and tokens
            $executionTimeMs = (int) ((microtime(true) - $startTime) * 1000);
            $tokensConsumed = $response->json('usage.total_tokens');

            // Record successful execution
            $this->logger->recordSuccess(
                $execution,
                $validated['normalized_data'],
                $response->body(),
                $executionTimeMs,
                $tokensConsumed,
                $parsed['confidence'],
                $lowConfidenceFields
            );

            Log::info('Extraction completed successfully', [
                'document_id' => $document->id,
                'execution_time_ms' => $executionTimeMs,
                'tokens_consumed' => $tokensConsumed,
                'confidence' => $parsed['confidence'],
                'low_confidence_fields_count' => count($lowConfidenceFields),
            ]);

            return [
                'data' => $validated['normalized_data'],
                'confidence' => $parsed['confidence'],
                'validation_errors' => $validated['validation_errors'],
                'low_confidence_fields' => $lowConfidenceFields,
            ];

        } catch (\Exception $e) {
            $executionTimeMs = (int) ((microtime(true) - $startTime) * 1000);

            $this->logger->recordFailure($execution, $e->getMessage(), $executionTimeMs);

            Log::error('Extraction failed', [
                'document_id' => $document->id,
                'error' => $e->getMessage(),
                'execution_time_ms' => $executionTimeMs,
            ]);

            throw $e;
        }
    }

    /**
     * Call OpenAI API with retry logic.
     *
     * @param  string  $apiKey  API key
     * @param  string  $model  Model identifier
     * @param  string  $prompt  User prompt
     *
     * @throws RuntimeException If API call fails
     */
    private function callOpenAI(string $apiKey, string $model, string $prompt): \Illuminate\Http\Client\Response
    {
        $response = Http::withToken($apiKey)
            ->timeout(self::TIMEOUT)
            ->withoutVerifying()
            ->retry(3, 1000, function ($exception, $request) {
                // Retry on timeout or rate limit
                return $exception instanceof \Illuminate\Http\Client\ConnectionException
                    || ($exception instanceof \Illuminate\Http\Client\RequestException
                        && $exception->response->status() === 429);
            })
            ->post(self::API_URL, [
                'model' => $model,
                'messages' => [
                    ['role' => 'system', 'content' => $this->getSystemPrompt()],
                    ['role' => 'user', 'content' => $prompt],
                ],
                'temperature' => self::TEMPERATURE,
                'response_format' => ['type' => 'json_object'],
            ]);

        if (! $response->successful()) {
            $errorBody = $response->json() ?? [];
            $errorMessage = $errorBody['error']['message'] ?? $response->body();

            Log::error('OpenAI API error', [
                'status' => $response->status(),
                'error' => $errorMessage,
            ]);

            throw new RuntimeException("OpenAI API failed: {$errorMessage}");
        }

        return $response;
    }

    /**
     * Get system prompt for extraction.
     *
     * @return string System prompt
     */
    private function getSystemPrompt(): string
    {
        return 'You are a specialized assistant for extracting structured data from documents. '.
            'Always respond with valid JSON, without markdown or additional text. '.
            'Extract exact values from the document. '.
            'For each field, provide a confidence score (0-100) indicating how certain you are about the extracted value.';
    }

    /**
     * Build optimized prompt for extraction.
     *
     * Includes field-specific instructions and examples.
     *
     * @param  string  $text  Document text
     * @param  array  $schema  Field schema
     * @return string Complete prompt
     */
    private function buildPrompt(string $text, array $schema): string
    {
        $fields = $schema['fields'] ?? [];

        // Build field descriptions with enhanced metadata
        $fieldsDescription = collect($fields)
            ->map(function (array $field): string {
                if ($field['type'] === 'array') {
                    return $this->buildArrayFieldDescription($field);
                }

                return $this->buildSimpleFieldDescription($field);
            })
            ->implode("\n");

        // Truncate text if too long (keep first and last parts)
        $maxTextLength = 8000;
        if (mb_strlen($text) > $maxTextLength) {
            $halfLength = (int) ($maxTextLength / 2);
            $text = mb_substr($text, 0, $halfLength)."\n\n[... middle section truncated ...]\n\n".mb_substr($text, -$halfLength);
        }

        return <<<PROMPT
Extract the following fields from the document:

FIELDS TO EXTRACT:
{$fieldsDescription}

DOCUMENT TEXT:
{$text}

CRITICAL INSTRUCTIONS:
1. Return ONLY a valid JSON object
2. Use null for fields not found in the document
3. Format dates as YYYY-MM-DD
4. Format numbers without currency symbols (e.g., 1234.56)
5. Extract EXACT values from the document
6. For each field, include a confidence score (0-100)
7. Include an overall confidence score
8. **IMPORTANT**: For array fields (tables/lists), extract ALL rows as an array of objects
9. **CRITICAL**: Use EXACT field names as specified above - DO NOT abbreviate, rename, or "fix" fields
   - If schema has "qty", return "qty". Do NOT change it to "quantity".
   - If schema has "quantity", return "quantity". Do NOT abbreviate to "qty".
   - RESPECT the provided field names completely.

RESPONSE FORMAT:
{
  "extracted_data": {
    "field_name": "value",
    "array_field": [
      {"column1": "value1", "column2": "value2"},
      {"column1": "value3", "column2": "value4"}
    ]
  },
  "field_confidence": {
    "field_name": 95,
    "array_field": 90
  },
  "confidence": 85
}

EXAMPLE for invoice with line items:
{
  "extracted_data": {
    "invoice_number": "INV-2024-001",
    "line_items": [
      {"description": "Product A", "quantity": 2, "unit_price": 50.00, "vat": 23, "line_total": 115.00},
      {"description": "Product B", "quantity": 1, "unit_price": 100.00, "vat": 23, "line_total": 123.00}
    ],
    "total": 238.00
  },
  "field_confidence": {
    "invoice_number": 100,
    "line_items": 95,
    "total": 100
  },
  "confidence": 98
}
PROMPT;
    }

    /**
     * Build description for simple (non-array) field.
     *
     * @param  array{name: string, type: string, label?: string, pattern?: string, required?: bool}  $field  Field schema
     * @return string Field description
     */
    private function buildSimpleFieldDescription(array $field): string
    {
        $description = "- {$field['name']} ({$field['type']})";

        if (isset($field['label'])) {
            $description .= ": {$field['label']}";
        }

        if (isset($field['pattern'])) {
            $description .= " [Pattern: {$field['pattern']}]";
        }

        if (isset($field['required']) && $field['required']) {
            $description .= ' [REQUIRED]';
        }

        return $description;
    }

    /**
     * Build description for array field.
     *
     * @param  array{name: string, type: string, label?: string, items?: array<array{name: string, type: string, label?: string}>}  $field  Field schema
     * @return string Field description
     */
    private function buildArrayFieldDescription(array $field): string
    {
        $itemsSchema = $field['items'] ?? [];

        if (empty($itemsSchema)) {
            return "- {$field['name']} (array): ".($field['label'] ?? 'List of items');
        }

        $itemFields = collect($itemsSchema)
            ->map(fn ($item) => "{$item['name']} ({$item['type']})")
            ->implode(', ');

        $description = "- {$field['name']} (array of objects): [{$itemFields}]";

        if (isset($field['label'])) {
            $description .= " - {$field['label']}";
        }

        $description .= ' [EXTRACT_ALL_ROWS_FROM_TABLE]';

        return $description;
    }

    /**
     * Parse OpenAI response.
     *
     * @param  string|null  $content  JSON content
     * @return array{data: array<string, mixed>, confidence: int|null, field_confidence: array<string, int>}
     *
     * @throws RuntimeException If JSON is invalid
     */
    private function parseResponse(?string $content): array
    {
        if ($content === null || $content === '') {
            throw new RuntimeException('Empty response from OpenAI');
        }

        try {
            $data = json_decode($content, true, 512, JSON_THROW_ON_ERROR);

            $extractedData = $data['extracted_data'] ?? $data;

            // Normalize all field names to lowercase to avoid case-sensitivity issues
            $normalizedData = $this->normalizeFieldNames($extractedData);

            return [
                'data' => $normalizedData,
                'confidence' => $data['confidence'] ?? null,
                'field_confidence' => $data['field_confidence'] ?? [],
            ];
        } catch (JsonException $e) {
            Log::error('Invalid JSON from OpenAI', [
                'content' => substr($content, 0, 500),
                'error' => $e->getMessage(),
            ]);

            throw new RuntimeException('Invalid JSON response from OpenAI: '.$e->getMessage());
        }
    }

    /**
     * Normalize all field names to lowercase recursively.
     * This prevents case-sensitivity issues like "Qty" vs "qty".
     */
    private function normalizeFieldNames(array $data): array
    {
        $normalized = [];

        foreach ($data as $key => $value) {
            $lowercaseKey = strtolower($key);

            if (is_array($value)) {
                // Check if it's an associative array (object) or indexed array (list)
                if (array_keys($value) === range(0, count($value) - 1)) {
                    // It's an indexed array (list of items), normalize each item
                    $normalized[$lowercaseKey] = array_map(
                        fn ($item) => is_array($item) ? $this->normalizeFieldNames($item) : $item,
                        $value
                    );
                } else {
                    // It's an associative array (object), normalize recursively
                    $normalized[$lowercaseKey] = $this->normalizeFieldNames($value);
                }
            } else {
                $normalized[$lowercaseKey] = $value;
            }
        }

        return $normalized;
    }

    /**
     * Validate and normalize extracted data.
     *
     * @param  array  $extractedData  Raw extracted data
     * @param  array  $schema  Field schema
     * @return array{normalized_data: array<string, mixed>, validation_errors: array<string, array<string>>}
     */
    private function validateAndNormalize(array $extractedData, array $schema): array
    {
        $normalizedData = [];
        $validationErrors = [];

        foreach ($schema['fields'] ?? [] as $fieldSchema) {
            $fieldName = $fieldSchema['name'];
            $value = $extractedData[$fieldName] ?? null;

            // Handle array fields with specialized validator
            if ($fieldSchema['type'] === 'array') {
                $arrayValidator = app(\App\Services\Validation\ArrayFieldValidator::class);
                $validationResult = $arrayValidator->validate($value, $fieldSchema);
            } else {
                $validationResult = $this->validator->validate($value, $fieldSchema);
            }

            if (! $validationResult['valid']) {
                $validationErrors[$fieldName] = $validationResult['errors'];
                Log::warning('Field validation failed', [
                    'field' => $fieldName,
                    'errors' => $validationResult['errors'],
                ]);
            }

            // Use normalized value
            $normalizedData[$fieldName] = $validationResult['normalized_value'];
        }

        return [
            'normalized_data' => $normalizedData,
            'validation_errors' => $validationErrors,
        ];
    }

    /**
     * Identify fields with low confidence.
     *
     * @param  array  $data  Extracted data
     * @param  int|null  $overallConfidence  Overall confidence score
     * @return array<string> Field names with low confidence
     */
    private function identifyLowConfidenceFields(array $data, ?int $overallConfidence): array
    {
        $lowConfidenceFields = [];

        // If overall confidence is low, mark all non-null fields
        if ($overallConfidence !== null && $overallConfidence < self::CONFIDENCE_THRESHOLD) {
            foreach ($data as $fieldName => $value) {
                if ($value !== null && $value !== '') {
                    $lowConfidenceFields[] = $fieldName;
                }
            }
        }

        return $lowConfidenceFields;
    }

    /**
     * Get OpenAI API key.
     *
     * @return string API key
     *
     * @throws RuntimeException If API key is not configured
     */
    private function getApiKey(): string
    {
        $apiKey = config('services.openai.api_key', '');

        if ($apiKey === '') {
            throw new RuntimeException(
                'OpenAI API key not configured. Set OPENAI_API_KEY in .env'
            );
        }

        return $apiKey;
    }
}
