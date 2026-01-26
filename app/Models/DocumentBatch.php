<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DocumentBatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'document_type_id',
        'new_type_name',
        'schema_used',
        'total_documents',
        'processed_documents',
        'successful_documents',
        'failed_documents',
        'status',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'schema_used' => 'array',
        'total_documents' => 'integer',
        'processed_documents' => 'integer',
        'successful_documents' => 'integer',
        'failed_documents' => 'integer',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /**
     * Get the user that owns the batch.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the document type for this batch.
     */
    public function documentType(): BelongsTo
    {
        return $this->belongsTo(DocumentType::class);
    }

    /**
     * Get all documents in this batch.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(Document::class, 'batch_id');
    }

    /**
     * Scope a query to only include batches for a specific user.
     */
    public function scopeForUser($query, User $user)
    {
        return $query->where('user_id', $user->id);
    }

    /**
     * Scope a query to only include recent batches.
     */
    public function scopeRecent($query, int $limit = 10)
    {
        return $query->orderBy('created_at', 'desc')->limit($limit);
    }

    /**
     * Scope a query to only include batches in progress.
     */
    public function scopeInProgress($query)
    {
        return $query->whereIn('status', ['pending', 'processing']);
    }

    /**
     * Mark the batch as processing.
     */
    public function markAsProcessing(): void
    {
        $this->update([
            'status' => 'processing',
            'started_at' => now(),
        ]);
    }

    /**
     * Mark the batch as completed.
     */
    public function markAsCompleted(): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }

    /**
     * Mark the batch as failed.
     */
    public function markAsFailed(): void
    {
        $this->update([
            'status' => 'failed',
            'completed_at' => now(),
        ]);
    }

    /**
     * Increment the processed documents counter.
     */
    public function incrementProcessed(bool $success): void
    {
        $this->increment('processed_documents');
        
        if ($success) {
            $this->increment('successful_documents');
        } else {
            $this->increment('failed_documents');
        }

        // Check if batch is complete
        if ($this->processed_documents >= $this->total_documents) {
            $this->markAsCompleted();
        }
    }

    /**
     * Get the progress information for this batch.
     */
    public function getProgress(): array
    {
        $percentage = $this->total_documents > 0
            ? round(($this->processed_documents / $this->total_documents) * 100, 2)
            : 0;

        return [
            'total' => $this->total_documents,
            'processed' => $this->processed_documents,
            'successful' => $this->successful_documents,
            'failed' => $this->failed_documents,
            'remaining' => $this->total_documents - $this->processed_documents,
            'percentage' => $percentage,
            'status' => $this->status,
            'is_complete' => $this->status === 'completed',
            'is_processing' => $this->status === 'processing',
        ];
    }

    /**
     * Get the template name for this batch.
     */
    public function getTemplateNameAttribute(): string
    {
        if ($this->documentType) {
            return $this->documentType->name;
        }

        return $this->new_type_name ?? 'Unknown';
    }
}
