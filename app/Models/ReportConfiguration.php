<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Configuração de relatório personalizado.
 *
 * Permite aos utilizadores criar relatórios customizados
 * com agregações, filtros e visualizações específicas.
 */
final class ReportConfiguration extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'document_type_id',
        'name',
        'description',
        'field_config',
        'calculated_fields',
        'selection_mode',
        'date_from',
        'date_to',
        'selected_document_ids',
        'date_grouping',
        'date_field',
        'is_default',
    ];

    protected $casts = [
        'field_config' => 'array',
        'calculated_fields' => 'array',
        'selected_document_ids' => 'array',
        'date_from' => 'date',
        'date_to' => 'date',
        'is_default' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function documentType(): BelongsTo
    {
        return $this->belongsTo(DocumentType::class);
    }

    public function scopeForUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForDocumentType(Builder $query, int $documentTypeId): Builder
    {
        return $query->where('document_type_id', $documentTypeId);
    }

    /**
     * Get documents based on selection mode.
     *
     * SECURITY: Filters by user_id to prevent cross-user data access
     */
    public function getDocumentsQuery(): Builder
    {
        $query = Document::query()
            ->where('document_type_id', $this->document_type_id)
            ->where('user_id', $this->user_id)
            ->where('status', 'completed')
            ->whereNotNull('extracted_data');

        switch ($this->selection_mode) {
            case 'filtered':
                if ($this->date_from) {
                    $query->whereDate('created_at', '>=', $this->date_from);
                }
                if ($this->date_to) {
                    $query->whereDate('created_at', '<=', $this->date_to);
                }
                break;

            case 'manual':
                if (! empty($this->selected_document_ids)) {
                    $query->whereIn('id', $this->selected_document_ids);
                }
                break;

            case 'all':
            default:
                // No additional filters
                break;
        }

        return $query;
    }
}
