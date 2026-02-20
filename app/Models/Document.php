<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

/**
 * Modelo para documentos extraídos.
 *
 * Armazena os dados extraídos de PDFs e imagens,
 * incluindo o schema usado e os dados para relatórios.
 */
class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'organization_id',
        'document_type_id',
        'batch_id',
        'name',
        'original_filename',
        'file_path',
        'mime_type',
        'file_size',
        'page_count',
        'type',
        'status',
        'raw_text',
        'extracted_data',
        'schema_used',
        'error_message',
        'credits_used',
        'processed_at',
        'storage_disk',
    ];

    protected static function booted(): void
    {
        static::deleted(function (self $document): void {
            $disk = $document->storage_disk ?? config('filesystems.default');
            if ($document->file_path) {
                Storage::disk($disk)->delete($document->file_path);
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Tipo de documento usado (template).
     */
    public function documentType(): BelongsTo
    {
        return $this->belongsTo(DocumentType::class);
    }

    /**
     * Get the batch this document belongs to.
     */
    public function batch(): BelongsTo
    {
        return $this->belongsTo(DocumentBatch::class);
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isProcessing(): bool
    {
        return $this->status === 'processing';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    public function canReprocess(): bool
    {
        return in_array($this->status, ['completed', 'failed']);
    }

    public function markAsProcessing(): void
    {
        $this->update(['status' => 'processing']);
    }

    public function markAsCompleted(array $extractedData): void
    {
        $this->update([
            'status' => 'completed',
            'extracted_data' => $extractedData,
            'processed_at' => now(),
            'error_message' => null,
        ]);
    }

    public function markAsFailed(string $errorMessage): void
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $errorMessage,
            'processed_at' => now(),
        ]);
    }

    protected function casts(): array
    {
        return [
            'extracted_data' => 'array',
            'schema_used' => 'array',
            'file_size' => 'integer',
            'credits_used' => 'integer',
            'processed_at' => 'datetime',
        ];
    }
}
