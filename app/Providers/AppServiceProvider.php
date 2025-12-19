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
        $translationCache->warm(config('app.available_locales', ['pt', 'en']));

        if ($this->app->environment('production')) {
            URL::forceScheme('https');

            // Ensure asset() helpers also generate HTTPS URLs when ASSET_URL is not set.
            if (blank(config('app.asset_url'))) {
                Config::set('app.asset_url', config('app.url'));
            }
        }
    }
}
