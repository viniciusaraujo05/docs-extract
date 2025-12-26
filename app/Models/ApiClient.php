<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class ApiClient extends Authenticatable implements JWTSubject
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'public_id',
        'name',
        'contact_email',
        'client_id',
        'client_secret',
        'status',
        'rate_limit_per_minute',
        'allowed_ips',
        'metadata',
        'last_used_at',
    ];

    /**
     * @var list<string>
     */
    protected $hidden = [
        'client_secret',
        'remember_token',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $client): void {
            if ($client->public_id === null) {
                $client->public_id = (string) Str::uuid();
            }

            if ($client->client_id === null) {
                $client->client_id = strtoupper(Str::random(32));
            }

            if ($client->client_secret !== null && ! Str::startsWith($client->client_secret, '$2y$')) {
                $client->client_secret = Hash::make($client->client_secret);
            }
        });

        static::updating(function (self $client): void {
            if ($client->isDirty('client_secret') && $client->client_secret !== null && ! Str::startsWith($client->client_secret, '$2y$')) {
                $client->client_secret = Hash::make($client->client_secret);
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    /**
     * @return array<string, mixed>
     */
    public function getJWTCustomClaims(): array
    {
        return [
            'client_id' => $this->client_id,
            'client_public_id' => $this->public_id,
        ];
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'allowed_ips' => 'array',
            'metadata' => 'array',
            'rate_limit_per_minute' => 'integer',
            'last_used_at' => 'datetime',
        ];
    }

    public function getAuthPassword(): string
    {
        return $this->client_secret;
    }
}
