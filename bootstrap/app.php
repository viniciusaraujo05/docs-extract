<?php

use App\Http\Middleware\CheckUsageLimit;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\RedirectIfAuthenticated;
use App\Http\Middleware\SetLocale;
use App\Http\Middleware\TrustProxies;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
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
            if ($request->is('api/v1/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated.',
                    'error' => $e->getMessage(),
                ], 401);
            }
        });
    })->create();
