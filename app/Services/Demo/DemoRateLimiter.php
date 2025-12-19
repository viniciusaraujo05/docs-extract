<?php

declare(strict_types=1);

namespace App\Services\Demo;

use Illuminate\Support\Facades\Cache;

/**
 * Rate limiter para demo (1 uso por IP por dia).
 */
final class DemoRateLimiter
{
    private const KEY_PREFIX = 'demo:usage:';

    public function __construct(
        private readonly int $maxRequests = 1,
        private readonly int $windowSeconds = 86400
    ) {}

    public function hasExceeded(string $ip): bool
    {
        return $this->currentUsage($ip) >= $this->maxRequests;
    }

    public function increment(string $ip): void
    {
        $key = $this->buildKey($ip);
        
        // Se não existe, cria com valor 1 e TTL
        if (! Cache::has($key)) {
            Cache::put($key, 1, $this->windowSeconds);
            return;
        }
        
        // Se já existe, incrementa
        Cache::increment($key);
    }

    public function remaining(string $ip): int
    {
        return max(0, $this->maxRequests - $this->currentUsage($ip));
    }

    public function secondsUntilReset(string $ip): ?int
    {
        $key = $this->buildKey($ip);
        $expiresAt = Cache::get($key.':expires_at');

        if (is_int($expiresAt)) {
            return max(0, $expiresAt - time());
        }

        return null;
    }

    private function currentUsage(string $ip): int
    {
        return (int) Cache::get($this->buildKey($ip), 0);
    }

    private function buildKey(string $ip): string
    {
        return self::KEY_PREFIX.$ip;
    }
}
