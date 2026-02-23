<?php

namespace App\Providers;

use App\Contracts\BlogRepositoryInterface;
use App\Models\Document;
use App\Models\DocumentType;
use App\Models\ReportAnalysis;
use App\Models\User;
use App\Observers\DocumentObserver;
use App\Observers\DocumentTypeObserver;
use App\Observers\ReportAnalysisObserver;
use App\Observers\UserObserver;
use App\Repositories\EloquentBlogRepository;
use App\Services\TranslationCacheService;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Laravel\Passport\Contracts\AuthorizationViewResponse;
use Laravel\Passport\Contracts\DeviceAuthorizationViewResponse;
use Laravel\Passport\Http\Responses\SimpleViewResponse;
use Laravel\Passport\Passport;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(AuthorizationViewResponse::class, function () {
            return new SimpleViewResponse('auth.authorize'); // This won't be used but satisfies DI
        });

        $this->app->singleton(DeviceAuthorizationViewResponse::class, function () {
            return new SimpleViewResponse('auth.authorize');
        });

        $this->app->bind(BlogRepositoryInterface::class, EloquentBlogRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(TranslationCacheService $translationCache): void
    {
        // Write Passport keys to storage if provided via environment variables
        // This is necessary for ephemeral environments (Railway, Heroku, etc.)
        if (env('PASSPORT_PRIVATE_KEY')) {
            $privateKeyPath = storage_path('oauth-private.key');
            $privateKeyContent = base64_decode(env('PASSPORT_PRIVATE_KEY'));
            file_put_contents($privateKeyPath, $privateKeyContent);
            @chmod($privateKeyPath, 0600);
        }

        if (env('PASSPORT_PUBLIC_KEY')) {
            $publicKeyPath = storage_path('oauth-public.key');
            $publicKeyContent = base64_decode(env('PASSPORT_PUBLIC_KEY'));
            file_put_contents($publicKeyPath, $publicKeyContent);
            @chmod($publicKeyPath, 0600);
        }

        Passport::tokensExpireIn(now()->addDays(15));
        Passport::refreshTokensExpireIn(now()->addDays(30));
        Passport::personalAccessTokensExpireIn(now()->addMonths(6));

        Passport::enablePasswordGrant(); // Optional, but helps if needed later
        File::ensureDirectoryExists(storage_path('framework/views'));
        File::ensureDirectoryExists(storage_path('framework/cache'));
        File::ensureDirectoryExists(storage_path('framework/sessions'));

        // Register observers
        User::observe(UserObserver::class);
        Document::observe(DocumentObserver::class);
        DocumentType::observe(DocumentTypeObserver::class);
        ReportAnalysis::observe(ReportAnalysisObserver::class);

        // Note: Event listeners are auto-discovered from app/Listeners/
        // No need to manually register TriggerDocumentWebhooks

        if (! $this->app->runningInConsole()) {
            $translationCache->warm(config('app.available_locales', ['pt', 'en']));
        }

        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }
    }
}
