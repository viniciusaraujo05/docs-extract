<?php

use App\Http\Controllers\ApiClientController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\DocumentTypeController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\StripeWebhookController;
use App\Http\Controllers\SubscriptionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
        'locale' => 'pt',
        'auth' => [
            'user' => auth()->user(),
        ],
    ]);
})->name('home');

// Landing page with locale
Route::get('/{locale}', function ($locale) {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
        'locale' => $locale,
        'auth' => [
            'user' => auth()->user(),
        ],
    ]);
})->where(['locale' => 'pt|en'])->name('home.locale');

// Pages with locale prefix
Route::middleware(['auth', 'verified'])->prefix('{locale}')->where(['locale' => 'pt|en'])->group(function () {
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
    Route::get('documents/{document}/preview', [DocumentController::class, 'preview'])->name('documents.preview');
    Route::put('documents/{document}/data', [DocumentController::class, 'updateData'])->name('documents.updateData');
    Route::post('documents/{document}/reprocess', [DocumentController::class, 'reprocess'])->name('documents.reprocess');

    // Document Types
    Route::resource('document-types', DocumentTypeController::class)->names([
        'index' => 'document-types.index',
        'create' => 'document-types.create',
        'store' => 'document-types.store',
        'show' => 'document-types.show',
        'edit' => 'document-types.edit',
        'update' => 'document-types.update',
        'destroy' => 'document-types.destroy',
    ])->parameters(['document-types' => 'documentType']);

    // API Clients Management
    Route::get('api', [ApiClientController::class, 'index'])->name('api.index');
    Route::post('api/clients', [ApiClientController::class, 'store'])->name('api.clients.store');
    Route::post('api/clients/{apiClient}/regenerate', [ApiClientController::class, 'regenerate'])->name('api.clients.regenerate');
    Route::delete('api/clients/{apiClient}', [ApiClientController::class, 'destroy'])->name('api.clients.destroy');
});

// Auth routes with locale (must be BEFORE authenticated routes to avoid conflicts)
Route::prefix('{locale}')->where(['locale' => 'pt|en'])->middleware('web')->group(function () {
    // Login routes
    Route::get('login', function ($locale) {
        return Inertia::render('auth/login', [
            'canRegister' => Features::enabled(Features::registration()),
            'canResetPassword' => true,
            'locale' => $locale,
        ]);
    })->middleware('guest')->name('locale.login');

    Route::post('login', [\Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::class, 'store'])
        ->middleware(['guest:web', 'throttle:login'])->name('locale.login.store');

    // Register routes
    Route::get('register', function ($locale) {
        return Inertia::render('auth/register', [
            'canRegister' => Features::enabled(Features::registration()),
            'locale' => $locale,
        ]);
    })->middleware('guest')->name('locale.register');

    Route::post('register', [\Laravel\Fortify\Http\Controllers\RegisteredUserController::class, 'store'])
        ->middleware(['guest:web', 'throttle:register'])->name('locale.register.store');

    // Logout
    Route::post('logout', [\Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::class, 'destroy'])
        ->middleware(['auth:web'])
        ->name('locale.logout');

    // Subscription routes (authenticated)
    Route::middleware(['auth'])->prefix('subscription')->name('subscription.')->group(function () {
        Route::get('/', [SubscriptionController::class, 'index'])->name('index');
        Route::get('checkout', [SubscriptionController::class, 'showCheckout'])->name('checkout');
        Route::post('checkout', [SubscriptionController::class, 'checkout'])->name('checkout.process');
        Route::get('success', [SubscriptionController::class, 'success'])->name('success');
        Route::get('cancel', [SubscriptionController::class, 'cancel'])->name('cancel');
        Route::get('portal', [SubscriptionController::class, 'portal'])->name('portal');
        Route::post('cancel-subscription', [SubscriptionController::class, 'cancelSubscription'])->name('cancel-subscription');
        Route::post('resume', [SubscriptionController::class, 'resumeSubscription'])->name('resume');
    });
});

// Demo API routes (public, rate limited: 3 requests per hour)
Route::prefix('api/demo')->middleware(['throttle:3,60'])->group(function () {
    Route::post('extract', [\App\Http\Controllers\Api\DemoController::class, 'extract']);
    Route::get('check', [\App\Http\Controllers\Api\DemoController::class, 'checkAvailability']);
});

// Stripe Webhook (must be outside auth middleware and CSRF protection)
Route::post('stripe/webhook', [StripeWebhookController::class, 'handleWebhook'])->name('cashier.webhook');

require __DIR__.'/settings.php';
