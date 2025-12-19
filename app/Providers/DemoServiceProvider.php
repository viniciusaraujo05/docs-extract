<?php

declare(strict_types=1);

namespace App\Providers;

use App\Services\Demo\DemoRateLimiter;
use App\Services\Demo\SchemaInferenceService;
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

        $this->app->singleton(SchemaInferenceService::class, function () {
            $apiKey = config('services.openai.api_key', '');

            if ($apiKey === '') {
                throw new \RuntimeException('OpenAI API key não configurada. Configure OPENAI_API_KEY no .env');
            }

            return new SchemaInferenceService(
                apiKey: $apiKey,
                model: config('services.openai.model', 'gpt-4o-mini')
            );
        });
    }
}
