<?php

namespace App\Providers;

use App\Services\TranslationCacheService;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\File;
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
        File::ensureDirectoryExists(storage_path('framework/views'));
        File::ensureDirectoryExists(storage_path('framework/cache'));
        File::ensureDirectoryExists(storage_path('framework/sessions'));

        // Só aquece o cache de traduções se não estiver rodando via CLI (evita erro no build)
        if (!$this->app->runningInConsole()) {
            $translationCache->warm(config('app.available_locales', ['pt', 'en']));
        }

        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }
    }
}
