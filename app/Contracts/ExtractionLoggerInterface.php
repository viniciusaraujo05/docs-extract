<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Models\Document;
use App\Models\ExtractionExecution;

/**
 * Extraction Logger Interface
 *
 * Defines contract for logging and tracking extraction executions
 * with full observability and audit trail.
 *
 * Implementations should:
 * - Record all extraction attempts
 * - Track performance metrics (time, tokens)
 * - Store prompts and responses for debugging
 * - Identify low-confidence fields
 */
interface ExtractionLoggerInterface
{
    /**
     * Start tracking a new extraction execution.
     *
     * @param  Document  $document  The document being processed
     * @param  string  $modelUsed  AI model identifier
     * @param  string  $prompt  The prompt sent to the AI
     * @return ExtractionExecution The created execution record
     */
    public function startExecution(Document $document, string $modelUsed, string $prompt): ExtractionExecution;

    /**
     * Record successful extraction completion.
     *
     * @param  ExtractionExecution  $execution  The execution to update
     * @param  array  $extractedData  The extracted field values
     * @param  string  $response  Raw AI response
     * @param  int  $executionTimeMs  Execution time in milliseconds
     * @param  int|null  $tokensConsumed  Tokens used
     * @param  int|null  $confidence  Overall confidence score (0-100)
     * @param  array|null  $lowConfidenceFields  Fields below threshold
     */
    public function recordSuccess(
        ExtractionExecution $execution,
        array $extractedData,
        string $response,
        int $executionTimeMs,
        ?int $tokensConsumed = null,
        ?int $confidence = null,
        ?array $lowConfidenceFields = null
    ): void;

    /**
     * Record extraction failure.
     *
     * @param  ExtractionExecution  $execution  The execution to update
     * @param  string  $errorMessage  Error description
     * @param  int  $executionTimeMs  Execution time in milliseconds
     */
    public function recordFailure(
        ExtractionExecution $execution,
        string $errorMessage,
        int $executionTimeMs
    ): void;

    /**
     * Get execution statistics for a document.
     *
     * @param  Document  $document  The document to analyze
     * @return array{
     *   total_executions: int,
     *   success_rate: float,
     *   avg_confidence: float|null,
     *   avg_execution_time_ms: float|null,
     *   total_tokens: int,
     *   estimated_cost: float
     * }
     */
    public function getDocumentStats(Document $document): array;
}
