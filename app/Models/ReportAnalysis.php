<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportAnalysis extends Model
{
    protected $fillable = [
        'user_id',
        'document_type_id',
        'instructions',
        'analysis_data',
        'total_documents',
    ];

    protected $casts = [
        'analysis_data' => 'array',
        'total_documents' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function documentType(): BelongsTo
    {
        return $this->belongsTo(DocumentType::class);
    }
}
