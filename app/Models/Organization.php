<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Organization extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'credits',
        'settings',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    public function extractionSchemas(): HasMany
    {
        return $this->hasMany(ExtractionSchema::class);
    }

    public function hasCredits(int $amount = 1): bool
    {
        return $this->credits >= $amount;
    }

    public function deductCredits(int $amount = 1): bool
    {
        if (! $this->hasCredits($amount)) {
            return false;
        }

        $this->decrement('credits', $amount);

        return true;
    }

    protected function casts(): array
    {
        return [
            'settings' => 'array',
            'credits' => 'integer',
        ];
    }
}
