<?php

use App\Http\Controllers\ApiClientController;
use App\Http\Controllers\Api\ExtractionController;
use App\Http\Controllers\Api\GeolocationController;
use App\Http\Controllers\Api\TranslationController;
use App\Http\Controllers\Api\UsageController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\DocumentTypeController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\ReportConfigurationController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\StripePriceController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\SupportController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

// Geolocation proxy (public, cached)
Route::get('geolocation/detect', [GeolocationController::class, 'detect']);

// Locale routes (public)
Route::get('locale/current', [LocaleController::class, 'current']);
Route::post('locale/update', [LocaleController::class, 'update']);

// Translation routes (public, cached in Redis)
Route::get('translations/{locale}', [TranslationController::class, 'show']);

// Stripe prices (public)
Route::get('stripe/prices', [StripePriceController::class, 'index']);

// Public plans (for landing page)
Route::get('plans', [\App\Http\Controllers\PlanController::class, 'index']);

// Internal API routes (Prefixed with /api)
Route::prefix('api')->group(function () {
    // Protected API routes (using web session authentication)
    Route::middleware(['auth'])->group(function () {
        // Usage API
        Route::get('usage', [UsageController::class, 'index']);
        Route::get('usage/pages-detail', [UsageController::class, 'pagesDetail']);

        // Reports API
        Route::get('reports/{documentType}/data', [ReportController::class, 'getData']);
        Route::get('reports/{documentType}/export', [ReportController::class, 'export']);
        Route::get('reports/{documentType}/latest-analysis', [ReportController::class, 'getLatestAnalysis']);
        Route::post('reports/{documentType}/analyze-ai', [ReportController::class, 'analyzeWithAI'])->middleware(['usage.limit:reports']);

        // Report Configurations
        Route::get('reports/{documentType}/configurations', [ReportConfigurationController::class, 'index']);
        Route::post('reports/{documentType}/configurations', [ReportConfigurationController::class, 'store'])->middleware(['usage.limit:reports']);
        Route::get('reports/{documentType}/documents', [ReportConfigurationController::class, 'documents']);
        Route::post('reports/{documentType}/preview', [ReportConfigurationController::class, 'preview']);
        Route::put('reports/configurations/{configuration}', [ReportConfigurationController::class, 'update']);
        Route::delete('reports/configurations/{configuration}', [ReportConfigurationController::class, 'destroy']);
        Route::get('reports/configurations/{configuration}/generate', [ReportConfigurationController::class, 'generate'])->middleware(['usage.limit:reports']);

        // Documents API
        Route::post('documents/analyze', [ExtractionController::class, 'analyze']);
        Route::post('documents/extract', [ExtractionController::class, 'extract']);
        Route::match(['get', 'post'], 'documents/check-name', [DocumentController::class, 'checkName']);
        Route::post('documents/batch/{batch}/cancel', [DocumentController::class, 'batchCancel']);
    
        // Plan API routes (moved from web.php)
        Route::prefix('plans')->name('plans.')->group(function () {
            Route::get('/current', [\App\Http\Controllers\PlanController::class, 'current'])->name('current');
            Route::get('/upcoming-invoice', [\App\Http\Controllers\PlanController::class, 'upcomingInvoice'])->name('upcoming-invoice');
            Route::get('/invoices', [\App\Http\Controllers\PlanController::class, 'invoices'])->name('invoices');
            Route::post('/cancel-subscription', [SubscriptionController::class, 'cancelSubscription'])->name('cancel-subscription');
        });
        
        // Demo API routes (moved from web.php)
        Route::prefix('demo')->middleware(['throttle:3,60'])->group(function () {
            Route::post('extract', [\App\Http\Controllers\Api\DemoController::class, 'extract']);
            Route::get('check', [\App\Http\Controllers\Api\DemoController::class, 'checkAvailability']);
        });

        // Public Plans API (moved from web.php)
        Route::get('plans', [\App\Http\Controllers\PlanController::class, 'index'])->name('plans.index');
    });
});

// App Actions Routes (Moved from web.php)
// These routes handle Business Logic (POST/PUT/DELETE) but were previously mixed with views.
Route::prefix('{locale}')->where(['locale' => 'pt|en'])->group(function () {
    
    // Auth Actions
    Route::middleware('web')->group(function () {
        Route::post('login', [\Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::class, 'store'])
            ->middleware(['guest:web', 'throttle:login'])->name('locale.login.store');

        if (Features::enabled(Features::resetPasswords())) {
            Route::post('forgot-password', [\Laravel\Fortify\Http\Controllers\PasswordResetLinkController::class, 'store'])
                ->middleware(['guest', 'throttle:6,1'])
                ->name('locale.password.email');

            Route::post('reset-password', [\Laravel\Fortify\Http\Controllers\NewPasswordController::class, 'store'])
                ->middleware('guest')
                ->name('locale.password.update');
        }

        if (Features::enabled(Features::emailVerification())) {
            Route::post('email/verification-notification', [\Laravel\Fortify\Http\Controllers\EmailVerificationNotificationController::class, 'store'])
                ->middleware(['auth', 'throttle:6,1'])
                ->name('locale.verification.send');
        }

        Route::post('register', [\App\Http\Controllers\Auth\CustomRegisteredUserController::class, 'store'])
            ->middleware(['guest:web', 'throttle:register'])->name('locale.register.store');

        Route::post('register-checkout', [\App\Http\Controllers\Auth\CheckoutRegisterController::class, 'store'])
            ->middleware(['guest:web', 'throttle:register'])
            ->name('locale.register-checkout.store');

        Route::post('logout', [\Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::class, 'destroy'])
            ->middleware(['auth:web'])
            ->name('locale.logout');
    });

    // Authenticated Actions
    Route::middleware(['auth'])->group(function () {
        
        // Document Actions
        Route::post('documents', [DocumentController::class, 'store'])
            ->name('documents.store')
            ->middleware(['usage.limit:documents']);
            
        Route::put('documents/{document}', [DocumentController::class, 'update'])->name('documents.update');
        Route::delete('documents/{document}', [DocumentController::class, 'destroy'])->name('documents.destroy');
    
        Route::put('documents/{document}/data', [DocumentController::class, 'updateData'])->name('documents.updateData');
        Route::post('documents/{document}/reprocess', [DocumentController::class, 'reprocess'])->name('documents.reprocess');
    
        // Batch Document Actions
        Route::post('documents/batch', [DocumentController::class, 'batchStore'])
            ->name('documents.batch.store')
            ->middleware(['usage.limit:documents']);
            
        // Document Type Actions
        Route::post('document-types', [DocumentTypeController::class, 'store'])
            ->name('document-types.store')
            ->middleware(['usage.limit:models']);
            
        Route::put('document-types/{documentType}', [DocumentTypeController::class, 'update'])->name('document-types.update');
        Route::delete('document-types/{documentType}', [DocumentTypeController::class, 'destroy'])->name('document-types.destroy');
        
        // API Clients Actions
        Route::middleware(['verified'])->group(function () {
            Route::post('api/clients', [ApiClientController::class, 'store'])->name('api.clients.store');
            Route::post('api/clients/{apiClient}/regenerate', [ApiClientController::class, 'regenerate'])->name('api.clients.regenerate');
            Route::delete('api/clients/{apiClient}', [ApiClientController::class, 'destroy'])->name('api.clients.destroy');
    
            Route::post('api/webhooks', [\App\Http\Controllers\Api\WebhookEndpointController::class, 'store'])->name('api.webhooks.store');
            Route::delete('api/webhooks/{webhookEndpoint}', [\App\Http\Controllers\Api\WebhookEndpointController::class, 'destroy'])->name('api.webhooks.destroy');
            Route::post('api/webhooks/{webhookEndpoint}/regenerate', [\App\Http\Controllers\Api\WebhookEndpointController::class, 'regenerateSecret'])->name('api.webhooks.regenerate');
        });
        
        // Settings/Integrations Actions
        Route::post('integrations/{provider}/disconnect', [App\Http\Controllers\IntegrationController::class, 'disconnect'])->name('integrations.disconnect');
        Route::post('integrations/google/process-file', [App\Http\Controllers\IntegrationController::class, 'processPickedFile'])->name('integrations.process-file');
        Route::post('integrations/batch/{batch}/export', [App\Http\Controllers\IntegrationController::class, 'exportBatch'])->name('integrations.export');
        
        // Subscription Actions
        Route::middleware(['verified'])->prefix('subscription')->name('subscription.')->group(function () {
            Route::post('checkout', [SubscriptionController::class, 'checkout'])->name('checkout.process');
            Route::post('cancel-subscription', [SubscriptionController::class, 'cancelSubscription'])->name('cancel-subscription');
            Route::post('resume', [SubscriptionController::class, 'resumeSubscription'])->name('resume');
        });
        
        // Support Actions
        Route::post('support', [SupportController::class, 'store'])->name('support.store');
    });
});

// Non-localized Authenticated Actions
Route::middleware(['auth'])->group(function () {
    Route::post('integrations/google/export', [App\Http\Controllers\IntegrationController::class, 'exportRawData'])
        ->name('integrations.google.export');
});
