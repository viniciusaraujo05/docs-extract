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
Route::middleware(['auth'])->prefix('{locale}')->where(['locale' => 'pt|en'])->group(function () {

    // Reports (was Dashboard)
    Route::get('dashboard', [ReportController::class, 'index'])->name('dashboard');

    // Documents
    Route::resource('documents', DocumentController::class)->except(['edit'])->names([
        'index' => 'documents.index',
        'create' => 'documents.create',
        'store' => 'documents.store',
        'show' => 'documents.show',
        'update' => 'documents.update',
        'destroy' => 'documents.destroy',
    ])->parameters(['documents' => 'document']);

    // Apply usage limit only to store route (creating new documents)
    Route::post('documents', [DocumentController::class, 'store'])
        ->name('documents.store')
        ->middleware(['usage.limit:documents']);

    Route::get('documents/{document}/preview', [DocumentController::class, 'preview'])->name('documents.preview');
    Route::put('documents/{document}/data', [DocumentController::class, 'updateData'])->name('documents.updateData');
    Route::post('documents/{document}/reprocess', [DocumentController::class, 'reprocess'])->name('documents.reprocess');

    Route::resource('document-types', DocumentTypeController::class)->names([
        'index' => 'document-types.index',
        'create' => 'document-types.create',
        'store' => 'document-types.store',
        'show' => 'document-types.show',
        'edit' => 'document-types.edit',
        'update' => 'document-types.update',
        'destroy' => 'document-types.destroy',
    ])->parameters(['document-types' => 'documentType']);

    // Apply usage limit only to store route
    Route::post('document-types', [DocumentTypeController::class, 'store'])
        ->name('document-types.store')
        ->middleware(['usage.limit:models']);

    // API Clients Management
    Route::middleware(['verified'])->group(function () {
        Route::get('api', [ApiClientController::class, 'index'])->name('api.index');
        Route::post('api/clients', [ApiClientController::class, 'store'])->name('api.clients.store');
        Route::post('api/clients/{apiClient}/regenerate', [ApiClientController::class, 'regenerate'])->name('api.clients.regenerate');
        Route::delete('api/clients/{apiClient}', [ApiClientController::class, 'destroy'])->name('api.clients.destroy');

        // Webhook Endpoints Management
        Route::post('api/webhooks', [\App\Http\Controllers\Api\WebhookEndpointController::class, 'store'])->name('api.webhooks.store');
        Route::delete('api/webhooks/{webhookEndpoint}', [\App\Http\Controllers\Api\WebhookEndpointController::class, 'destroy'])->name('api.webhooks.destroy');
        Route::post('api/webhooks/{webhookEndpoint}/regenerate', [\App\Http\Controllers\Api\WebhookEndpointController::class, 'regenerateSecret'])->name('api.webhooks.regenerate');
    });
});

// Settings Routes (auth only, no verified required for billing to allow subscription management)
Route::middleware(['auth'])->prefix('{locale}')->where(['locale' => 'pt|en'])->group(function () {
    Route::get('settings/billing', [PlanController::class, 'billing'])->name('settings.billing');
});

// Auth routes with locale (must be BEFORE authenticated routes to avoid conflicts)
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

    Route::post('login', [\Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::class, 'store'])
        ->middleware(['guest:web', 'throttle:login'])->name('locale.login.store');

    // Password Reset routes
    if (Features::enabled(Features::resetPasswords())) {
        Route::get('forgot-password', function ($locale) {
            return Inertia::render('auth/forgot-password', [
                'status' => session('status'),
                'locale' => $locale,
            ]);
        })->middleware('guest')->name('locale.password.request');

        Route::post('forgot-password', [\Laravel\Fortify\Http\Controllers\PasswordResetLinkController::class, 'store'])
            ->middleware(['guest', 'throttle:6,1'])
            ->name('locale.password.email');

        Route::get('reset-password/{token}', function ($locale, $token) {
            return Inertia::render('auth/reset-password', [
                'token' => $token,
                'email' => request('email'),
                'locale' => $locale,
            ]);
        })->middleware('guest')->name('locale.password.reset');

        Route::post('reset-password', [\Laravel\Fortify\Http\Controllers\NewPasswordController::class, 'store'])
            ->middleware('guest')
            ->name('locale.password.update');
    }

    // Email Verification routes
    if (Features::enabled(Features::emailVerification())) {
        Route::get('email/verify', function ($locale) {
            return Inertia::render('auth/verify-email', [
                'status' => session('status'),
                'locale' => $locale,
            ]);
        })->middleware('auth')->name('locale.verification.notice');

        Route::get('email/verify/{id}/{hash}', [\Laravel\Fortify\Http\Controllers\VerifyEmailController::class, '__invoke'])
            ->middleware(['auth', 'signed', 'throttle:6,1'])
            ->name('locale.verification.verify');

        Route::post('email/verification-notification', [\Laravel\Fortify\Http\Controllers\EmailVerificationNotificationController::class, 'store'])
            ->middleware(['auth', 'throttle:6,1'])
            ->name('locale.verification.send');
    }

    // Register routes
    Route::get('register', function ($locale) {
        return Inertia::render('auth/register', [
            'canRegister' => Features::enabled(Features::registration()),
            'locale' => $locale,
        ]);
    })->middleware('guest')->name('locale.register');

    Route::post('register', [\App\Http\Controllers\Auth\CustomRegisteredUserController::class, 'store'])
        ->middleware(['guest:web', 'throttle:register'])->name('locale.register.store');

    // Checkout Registration (Flow B - Direct Purchase, POST only)
    Route::post('register-checkout', [\App\Http\Controllers\Auth\CheckoutRegisterController::class, 'store'])
        ->middleware(['guest:web', 'throttle:register'])
        ->name('locale.register-checkout.store');

    // Logout
    Route::post('logout', [\Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::class, 'destroy'])
        ->middleware(['auth:web'])
        ->name('locale.logout');

    // Subscription routes (authenticated)
    Route::middleware(['auth'])->prefix('subscription')->name('subscription.')->group(function () {
        // Checkout flow (no verification needed)
        Route::get('checkout', [SubscriptionController::class, 'showCheckout'])->name('checkout');
        Route::post('checkout', [SubscriptionController::class, 'checkout'])->name('checkout.process');
        Route::get('success', [SubscriptionController::class, 'success'])->name('success');

        // Management (requires verification)
        Route::middleware(['verified'])->group(function () {
            Route::get('cancel', [SubscriptionController::class, 'cancel'])->name('cancel');
            Route::get('portal', [SubscriptionController::class, 'portal'])->name('portal');
            Route::post('cancel-subscription', [SubscriptionController::class, 'cancelSubscription'])->name('cancel-subscription');
            Route::post('resume', [SubscriptionController::class, 'resumeSubscription'])->name('resume');
        });
    });

    // Plan API routes (protected)
    Route::middleware(['auth'])->prefix('api/plans')->name('api.plans.')->group(function () {
        Route::get('/current', [PlanController::class, 'current'])->name('current');
        Route::get('/upcoming-invoice', [PlanController::class, 'upcomingInvoice'])->name('upcoming-invoice');
        Route::get('/invoices', [PlanController::class, 'invoices'])->name('invoices');
        Route::post('/cancel-subscription', [SubscriptionController::class, 'cancelSubscription'])->name('cancel-subscription');
    });

    // Usage API route
    Route::middleware(['auth'])->get('api/usage', [\App\Http\Controllers\Api\UsageController::class, 'index'])->name('api.usage');

    // Support
    Route::get('support', [SupportController::class, 'create'])->name('support.create');
    Route::post('support', [SupportController::class, 'store'])->name('support.store');
});

// Demo API routes (public, rate limited: 3 requests per hour)
Route::prefix('api/demo')->middleware(['throttle:3,60'])->group(function () {
    Route::post('extract', [\App\Http\Controllers\Api\DemoController::class, 'extract']);
    Route::get('check', [\App\Http\Controllers\Api\DemoController::class, 'checkAvailability']);
});

// Public Plans API
Route::get('api/plans', [PlanController::class, 'index'])->name('api.plans.index');

// Stripe Webhook (must be outside auth middleware and CSRF protection)
Route::post('stripe/webhook', [StripeWebhookController::class, 'handleWebhook'])->name('cashier.webhook');

require __DIR__.'/settings.php';
