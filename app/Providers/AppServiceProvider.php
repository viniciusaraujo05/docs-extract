<?php

namespace App\Providers;

use App\Services\TranslationCacheService;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(TranslationCacheService $translationCache): void
    {
        // Só aquece o cache de traduções se não estiver rodando via CLI (evita erro no build)
        if (!$this->app->runningInConsole()) {
            $translationCache->warm(config('app.available_locales', ['pt', 'en']));
        }

        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }
    }
}
