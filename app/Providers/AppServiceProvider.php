<?php

namespace App\Providers;

use App\Services\TranslationCacheService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(TranslationCacheService $translationCache): void
    {
        $translationCache->warm(config('app.available_locales', ['pt', 'en']));

        if (config('app.force_https')) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }
    }
}
