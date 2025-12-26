<?php

declare(strict_types=1);

namespace App\Services\Logging;

use App\Contracts\ExtractionLoggerInterface;
use App\Models\Document;
use App\Models\ExtractionExecution;
use Illuminate\Support\Facades\Crypt;

/**
 * Extraction Logger Service
 *
 * Provides comprehensive logging and observability for extraction executions.
 * Tracks performance metrics, stores audit trails, and identifies issues.
 *
 * Features:
 * - Full execution tracking (time, tokens, cost)
 * - Encrypted prompt/response storage for security
 * - Low-confidence field identification
 * - Statistical analysis per document
 */
final class ExtractionLogger implements ExtractionLoggerInterface
{
    /**
     * {@inheritDoc}
     */
    public function startExecution(Document $document, string $modelUsed, string $prompt): ExtractionExecution
    {
        return ExtractionExecution::create([
            'document_id' => $document->id,
            'model_used' => $modelUsed,
            'prompt_sent' => $this->encryptSensitiveData($prompt),
            'status' => 'pending',
        ]);
    }

    /**
     * {@inheritDoc}
     */
    public function recordSuccess(
        ExtractionExecution $execution,
        array $extractedData,
        string $response,
        int $executionTimeMs,
        ?int $tokensConsumed = null,
        ?int $confidence = null,
        ?array $lowConfidenceFields = null
    ): void {
        $execution->update([
            'status' => 'success',
            'fields_extracted' => $extractedData,
            'response_received' => $this->encryptSensitiveData($response),
            'execution_time_ms' => $executionTimeMs,
            'tokens_consumed' => $tokensConsumed,
            'overall_confidence' => $confidence,
            'fields_with_low_confidence' => $lowConfidenceFields,
        ]);
    }

    /**
     * {@inheritDoc}
     */
    public function recordFailure(
        ExtractionExecution $execution,
        string $errorMessage,
        int $executionTimeMs
    ): void {
        $execution->update([
            'status' => 'failed',
            'error_message' => $errorMessage,
            'execution_time_ms' => $executionTimeMs,
        ]);
    }

    /**
     * {@inheritDoc}
     */
    public function getDocumentStats(Document $document): array
    {
        $executions = ExtractionExecution::where('document_id', $document->id)->get();

        if ($executions->isEmpty()) {
            return [
                'total_executions' => 0,
                'success_rate' => 0.0,
                'avg_confidence' => null,
                'avg_execution_time_ms' => null,
                'total_tokens' => 0,
                'estimated_cost' => 0.0,
            ];
        }

        $totalExecutions = $executions->count();
        $successfulExecutions = $executions->where('status', 'success')->count();
        $successRate = $totalExecutions > 0 ? ($successfulExecutions / $totalExecutions) * 100 : 0.0;

        $confidenceScores = $executions
            ->whereNotNull('overall_confidence')
            ->pluck('overall_confidence');

        $avgConfidence = $confidenceScores->isNotEmpty()
            ? $confidenceScores->average()
            : null;

        $executionTimes = $executions
            ->whereNotNull('execution_time_ms')
            ->pluck('execution_time_ms');

        $avgExecutionTime = $executionTimes->isNotEmpty()
            ? $executionTimes->average()
            : null;

        $totalTokens = $executions->sum('tokens_consumed') ?? 0;
        $estimatedCost = $executions->sum(fn ($exec) => $exec->getEstimatedCost());

        return [
            'total_executions' => $totalExecutions,
            'success_rate' => round($successRate, 2),
            'avg_confidence' => $avgConfidence !== null ? round($avgConfidence, 2) : null,
            'avg_execution_time_ms' => $avgExecutionTime !== null ? round($avgExecutionTime, 2) : null,
            'total_tokens' => $totalTokens,
            'estimated_cost' => round($estimatedCost, 4),
        ];
    }

    /**
     * Get the most recent successful execution for a document.
     *
     * @param  Document  $document  The document to query
     * @return ExtractionExecution|null The latest successful execution or null
     */
    public function getLatestSuccessfulExecution(Document $document): ?ExtractionExecution
    {
        return ExtractionExecution::where('document_id', $document->id)
            ->where('status', 'success')
            ->latest()
            ->first();
    }

    /**
     * Get fields that consistently have low confidence across executions.
     *
     * @param  Document  $document  The document to analyze
     * @return array<string> Field names with recurring low confidence
     */
    public function getProblematicFields(Document $document): array
    {
        $executions = ExtractionExecution::where('document_id', $document->id)
            ->where('status', 'success')
            ->whereNotNull('fields_with_low_confidence')
            ->get();

        if ($executions->isEmpty()) {
            return [];
        }

        $fieldCounts = [];

        foreach ($executions as $execution) {
            $lowConfidenceFields = $execution->fields_with_low_confidence ?? [];
            foreach ($lowConfidenceFields as $field) {
                $fieldName = is_array($field) ? ($field['name'] ?? '') : $field;
                if ($fieldName !== '') {
                    $fieldCounts[$fieldName] = ($fieldCounts[$fieldName] ?? 0) + 1;
                }
            }
        }

        // Return fields that appear in more than 50% of executions
        $threshold = $executions->count() / 2;

        return array_keys(array_filter($fieldCounts, fn ($count) => $count > $threshold));
    }

    /**
     * Encrypt sensitive data before storage.
     *
     * @param  string  $data  Data to encrypt
     * @return string Encrypted data
     */
    private function encryptSensitiveData(string $data): string
    {
        try {
            return Crypt::encryptString($data);
        } catch (\Exception $e) {
            // If encryption fails, store a placeholder
            return '[ENCRYPTION_FAILED]';
        }
    }

    /**
     * Decrypt sensitive data for retrieval.
     *
     * @param  string  $encryptedData  Encrypted data
     * @return string Decrypted data
     */
    public function decryptSensitiveData(string $encryptedData): string
    {
        try {
            return Crypt::decryptString($encryptedData);
        } catch (\Exception $e) {
            return '[DECRYPTION_FAILED]';
        }
    }
}
