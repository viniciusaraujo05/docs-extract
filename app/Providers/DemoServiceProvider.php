<?php

declare(strict_types=1);

namespace App\Providers;

use App\Services\Demo\DemoRateLimiter;
use Illuminate\Support\ServiceProvider;

final class DemoServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(DemoRateLimiter::class, function () {
            return new DemoRateLimiter(
                maxRequests: (int) config('demo.max_requests_per_window', 1),
                windowSeconds: (int) config('demo.window_seconds', 86400)
            );
        });
    }
}
