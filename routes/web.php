<?php

use App\Http\Controllers\ApiClientController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\DocumentTypeController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\StripeWebhookController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\SupportController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

// SEO Routes
Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');

// Social Login Callback (Global/Non-localized to match OAuth App settings)
Route::get('auth/{provider}/callback', [\App\Http\Controllers\Auth\SocialLoginController::class, 'handleProviderCallback'])
    ->middleware(['web', 'guest'])
    ->where(['provider' => 'google|github'])
    ->name('social.callback');

Route::get('/', function () {
    $planService = app(\App\Services\StripePlanService::class);
    // Get plans as array list (not object/associative array) to avoid .map() errors on frontend
    $plans = array_values($planService->getAllPlans('en'));

    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
        'locale' => 'en',
        'plans' => $plans,
        'auth' => [
            'user' => \Illuminate\Support\Facades\Auth::check() ? \Illuminate\Support\Facades\Auth::user() : null,
        ],
    ]);
})->name('home');

// Landing page with locale
Route::get('/{locale}', function ($locale) {
    $planService = app(\App\Services\StripePlanService::class);
    // Get plans as array list (not object/associative array) to avoid .map() errors on frontend
    $plans = array_values($planService->getAllPlans($locale === 'pt' ? 'pt-BR' : $locale));

    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
        'locale' => $locale,
        'plans' => $plans,
        'auth' => [
            'user' => \Illuminate\Support\Facades\Auth::check() ? \Illuminate\Support\Facades\Auth::user() : null,
        ],
    ]);
})->where(['locale' => 'pt|en'])->name('home.locale');

// Privacy and Terms pages with locale
Route::get('/{locale}/privacy', function ($locale) {
    return Inertia::render('privacy', [
        'locale' => $locale,
    ]);
})->where(['locale' => 'pt|en'])->name('privacy');

Route::get('/{locale}/terms', function ($locale) {
    return Inertia::render('terms', [
        'locale' => $locale,
    ]);
})->where(['locale' => 'pt|en'])->name('terms');

// Pages with locale prefix (auth required for dashboard access)
// ONLY GET ROUTES (VIEWS) HERE. ACTIONS ARE IN API.PHP
Route::middleware(['auth'])->prefix('{locale}')->where(['locale' => 'pt|en'])->group(function () {

    // Reports (was Dashboard)
    Route::get('dashboard', [ReportController::class, 'index'])->name('dashboard');

    // Documents (Views only)
    Route::resource('documents', DocumentController::class)->only(['index', 'create', 'show'])->names([
        'index' => 'documents.index',
        'create' => 'documents.create',
        'show' => 'documents.show',
    ])->parameters(['documents' => 'document']);

    Route::get('documents/{document}/preview', [DocumentController::class, 'preview'])->name('documents.preview');

    // Batch document routes (Views only)
    Route::get('documents/batch/{batch}', [DocumentController::class, 'batchShow'])->name('documents.batch.show');
    Route::get('documents/batch/{batch}/progress', [DocumentController::class, 'batchProgress'])->name('documents.batch.progress');

    // Document Types (Views only)
    Route::resource('document-types', DocumentTypeController::class)->only(['index', 'create', 'show', 'edit'])->names([
        'index' => 'document-types.index',
        'create' => 'document-types.create',
        'show' => 'document-types.show',
        'edit' => 'document-types.edit',
    ])->parameters(['document-types' => 'documentType']);

    // API Clients Management (View)
    Route::middleware(['verified'])->group(function () {
        Route::get('api', [ApiClientController::class, 'index'])->name('api.index');
    });

    // Settings (Views)
    Route::get('settings/billing', [PlanController::class, 'billing'])->name('settings.billing');
    Route::get('settings/integrations', [App\Http\Controllers\IntegrationController::class, 'index'])->name('settings.integrations');
    Route::get('integrations/{provider}/connect', [App\Http\Controllers\IntegrationController::class, 'connect'])->name('integrations.connect');
});

// Non-localized authenticated routes
Route::middleware(['auth'])->group(function () {
    Route::get('integrations/{provider}/callback', [App\Http\Controllers\IntegrationController::class, 'callback'])->name('integrations.callback');

    // Google Picker API
    Route::get('api/integrations/google/token', [App\Http\Controllers\IntegrationController::class, 'getOAuthToken'])
        ->name('integrations.google.token');
});

// Auth routes with locale (must be BEFORE authenticated routes to avoid conflicts)
// ONLY GET ROUTES (VIEWS) HERE. ACTIONS ARE IN API.PHP
Route::prefix('{locale}')->where(['locale' => 'pt|en'])->middleware('web')->group(function () {
    // Login routes
    Route::get('login', function ($locale) {
        return Inertia::render('auth/login', [
            'canRegister' => Features::enabled(Features::registration()),
            'canResetPassword' => Features::enabled(Features::resetPasswords()),
            'locale' => $locale,
            'status' => session('status'),
        ]);
    })->middleware('guest')->name('locale.login');

    // Password Reset routes
    if (Features::enabled(Features::resetPasswords())) {
        Route::get('forgot-password', function ($locale) {
            return Inertia::render('auth/forgot-password', [
                'status' => session('status'),
                'locale' => $locale,
            ]);
        })->middleware('guest')->name('locale.password.request');

        Route::get('reset-password/{token}', function ($locale, $token) {
            return Inertia::render('auth/reset-password', [
                'token' => $token,
                'email' => request('email'),
                'locale' => $locale,
            ]);
        })->middleware('guest')->name('locale.password.reset');
    }

    // Email Verification routes
    if (Features::enabled(Features::emailVerification())) {
        Route::get('email/verify', function ($locale) {
            if (auth()->user()->hasVerifiedEmail()) {
                return redirect()->route('dashboard');
            }

            return Inertia::render('auth/verify-email', [
                'status' => session('status'),
                'locale' => $locale,
            ]);
        })->middleware('auth')->name('locale.verification.notice');

        Route::get('email/verify/{id}/{hash}', [\Laravel\Fortify\Http\Controllers\VerifyEmailController::class, '__invoke'])
            ->middleware(['auth', 'signed', 'throttle:6,1'])
            ->name('locale.verification.verify');
    }

    // Register routes
    Route::get('register', function ($locale) {
        return Inertia::render('auth/register', [
            'canRegister' => Features::enabled(Features::registration()),
            'locale' => $locale,
        ]);
    })->middleware('guest')->name('locale.register');

    // Social Login Redirect (Localized to preserve language)
    Route::get('auth/{provider}', [\App\Http\Controllers\Auth\SocialLoginController::class, 'redirectToProvider'])
        ->middleware('guest')
        ->where(['provider' => 'google|github'])
        ->name('social.redirect');

    Route::get('auth/{provider}/callback', [\App\Http\Controllers\Auth\SocialLoginController::class, 'handleLocalizedProviderCallback'])
        ->middleware('guest')
        ->where(['provider' => 'google|github'])
        ->name('social.callback.locale');

    // Subscription routes (authenticated)
    Route::middleware(['auth'])->prefix('subscription')->name('subscription.')->group(function () {
        // Checkout flow (no verification needed)
        Route::get('checkout', [SubscriptionController::class, 'showCheckout'])->name('checkout');
        Route::get('success', [SubscriptionController::class, 'success'])->name('success');

        // Management (requires verification)
        Route::middleware(['verified'])->group(function () {
            Route::get('cancel', [SubscriptionController::class, 'cancel'])->name('cancel');
            Route::get('portal', [SubscriptionController::class, 'portal'])->name('portal');
        });
    });

    // Support
    Route::get('support', [SupportController::class, 'create'])->name('support.create');
});

// Stripe Webhook
Route::post('stripe/webhook', [StripeWebhookController::class, 'handleWebhook'])->name('cashier.webhook');

require __DIR__.'/settings.php';
