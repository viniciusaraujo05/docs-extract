<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

/**
 * Modelo para tipos de documentos pré-definidos.
 * 
 * Permite aos utilizadores criar templates de extração
 * com campos pré-configurados para reutilização.
 *
 * @property int $id
 * @property int $user_id
 * @property string $name
 * @property string $slug
 * @property string|null $description
 * @property array $fields
 * @property bool $is_active
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
final class DocumentType extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'description',
        'fields',
        'is_active',
    ];

    protected $casts = [
        'fields' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Boot do modelo - gera slug automaticamente.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (DocumentType $documentType) {
            if (empty($documentType->slug)) {
                $documentType->slug = Str::slug($documentType->name) . '-' . Str::random(6);
            }
        });
    }

    /**
     * Utilizador dono deste tipo de documento.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Documentos que usam este tipo.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    /**
     * Scope para tipos ativos.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope para tipos do utilizador.
     */
    public function scopeForUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }
}
