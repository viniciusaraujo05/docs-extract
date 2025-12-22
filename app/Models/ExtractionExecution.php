<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Extraction Execution Model
 *
 * Tracks every extraction attempt with full observability:
 * - Prompt and response for audit
 * - Token consumption and execution time
 * - Field-level confidence scores
 * - Error tracking
 *
 * @property int $id
 * @property int $document_id
 * @property string $model_used
 * @property int|null $tokens_consumed
 * @property int|null $execution_time_ms
 * @property string|null $prompt_sent
 * @property string|null $response_received
 * @property array|null $fields_extracted
 * @property array|null $fields_with_low_confidence
 * @property int|null $overall_confidence
 * @property string $status
 * @property string|null $error_message
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 * @property-read Document $document
 */
final class ExtractionExecution extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_id',
        'model_used',
        'tokens_consumed',
        'execution_time_ms',
        'prompt_sent',
        'response_received',
        'fields_extracted',
        'fields_with_low_confidence',
        'overall_confidence',
        'status',
        'error_message',
    ];

    protected $casts = [
        'fields_extracted' => 'array',
        'fields_with_low_confidence' => 'array',
        'tokens_consumed' => 'integer',
        'execution_time_ms' => 'integer',
        'overall_confidence' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the document that owns this execution.
     */
    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    /**
     * Mark execution as successful.
     */
    public function markAsSuccess(
        array $extractedData,
        ?int $confidence = null,
        ?array $lowConfidenceFields = null
    ): void {
        $this->update([
            'status' => 'success',
            'fields_extracted' => $extractedData,
            'overall_confidence' => $confidence,
            'fields_with_low_confidence' => $lowConfidenceFields,
        ]);
    }

    /**
     * Mark execution as failed.
     */
    public function markAsFailed(string $errorMessage): void
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $errorMessage,
        ]);
    }

    /**
     * Check if execution was successful.
     */
    public function isSuccessful(): bool
    {
        return $this->status === 'success';
    }

    /**
     * Check if execution failed.
     */
    public function hasFailed(): bool
    {
        return $this->status === 'failed';
    }

    /**
     * Get fields that have low confidence.
     */
    public function getLowConfidenceFields(): array
    {
        return $this->fields_with_low_confidence ?? [];
    }

    /**
     * Calculate cost estimate based on tokens (approximate).
     */
    public function getEstimatedCost(): float
    {
        if ($this->tokens_consumed === null) {
            return 0.0;
        }

        // Approximate cost for gpt-4o-mini: $0.15 per 1M input tokens, $0.60 per 1M output tokens
        // Assuming 70% input, 30% output
        $inputTokens = (int) ($this->tokens_consumed * 0.7);
        $outputTokens = (int) ($this->tokens_consumed * 0.3);

        $inputCost = ($inputTokens / 1_000_000) * 0.15;
        $outputCost = ($outputTokens / 1_000_000) * 0.60;

        return $inputCost + $outputCost;
    }
}
