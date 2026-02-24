<?php

use App\Http\Middleware\CheckUsageLimit;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\RedirectIfAuthenticated;
use App\Http\Middleware\RestrictApiDomain;
use App\Http\Middleware\SetLocale;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Middleware\HandleCors;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            $apiDomain = env('API_DOMAIN');

            // Web Routes
            Route::middleware('web')
                ->group(base_path('routes/web.php'));

            // Internal API Routes (Session-based)
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));

            // Public API v1 (JWT-based)
            if ($apiDomain) {
                Route::middleware(['api', RestrictApiDomain::class])
                    ->domain($apiDomain)
                    ->group(base_path('routes/api_v1.php'));
            } else {
                Route::middleware('api')
                    ->prefix('api/v1')
                    ->group(base_path('routes/api_v1.php'));
            }
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(at: '*');

        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            SetLocale::class,
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Add session middleware to API routes (except v1 which uses JWT)
        $middleware->api(prepend: [
            HandleCors::class,
            \Illuminate\Cookie\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
        ]);

        $middleware->validateCsrfTokens(except: [
            'stripe/webhook',
        ]);

        // Override default RedirectIfAuthenticated with locale-aware version
        $middleware->alias([
            'guest' => RedirectIfAuthenticated::class,
            'plan.limit' => \App\Http\Middleware\CheckPlanLimits::class,
            'track.usage' => \App\Http\Middleware\TrackUsage::class,
            'usage.limit' => CheckUsageLimit::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Force JSON responses for API v1 routes on authentication errors
        $exceptions->renderable(function (\Illuminate\Auth\AuthenticationException $e, \Illuminate\Http\Request $request) {
            if ($request->is('api/v1/*') || $request->is('v1/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated.',
                    'error' => $e->getMessage(),
                ], 401);
            }
        });
    })->create();
