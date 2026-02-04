<?php

use App\Http\Controllers\Api\V1\AuthTokenController;
use App\Http\Controllers\Api\V1\DocumentControllerApi;
use Illuminate\Support\Facades\Route;

// API v1 routes (JWT-based, JSON-only)
Route::prefix('v1')->name('api.v1.')->middleware([\App\Http\Middleware\ApiV1JsonResponse::class])->group(function () {
    // Public auth routes
    Route::post('auth/token', [AuthTokenController::class, 'store'])->name('auth.token');

    // Protected routes (require JWT)
    Route::middleware(['auth:api', 'throttle:60,1'])->group(function () {
        Route::post('auth/refresh', [AuthTokenController::class, 'refresh'])->name('auth.refresh');
        Route::post('auth/logout', [AuthTokenController::class, 'destroy'])->name('auth.logout');

        // Document Type endpoints (must come before document endpoints to avoid conflicts)
        Route::get('document-types', [\App\Http\Controllers\Api\V1\DocumentTypeControllerApi::class, 'index'])->name('document-types.index')->middleware('track.usage:api_requests');
        Route::post('document-types', [\App\Http\Controllers\Api\V1\DocumentTypeControllerApi::class, 'store'])->name('document-types.store')->middleware(['track.usage:api_requests', 'usage.limit:models']);
        Route::get('document-types/{id}', [\App\Http\Controllers\Api\V1\DocumentTypeControllerApi::class, 'show'])->name('document-types.show')->middleware('track.usage:api_requests');
        Route::put('document-types/{id}', [\App\Http\Controllers\Api\V1\DocumentTypeControllerApi::class, 'update'])->name('document-types.update')->middleware('track.usage:api_requests');
        Route::delete('document-types/{id}', [\App\Http\Controllers\Api\V1\DocumentTypeControllerApi::class, 'destroy'])->name('document-types.destroy')->middleware('track.usage:api_requests');

        // Document endpoints
        Route::get('documents', [DocumentControllerApi::class, 'index'])->name('documents.index')->middleware('track.usage:api_requests');
        Route::post('documents', [DocumentControllerApi::class, 'store'])->name('documents.store')->middleware(['track.usage:api_requests', 'usage.limit:documents']);
        Route::get('documents/filter', [DocumentControllerApi::class, 'filter'])->name('documents.filter')->middleware('track.usage:api_requests');
        Route::get('documents/search/name', [DocumentControllerApi::class, 'searchByName'])->name('documents.search.name')->middleware('track.usage:api_requests');
        Route::post('documents/search/date', [DocumentControllerApi::class, 'searchByDate'])->name('documents.search.date')->middleware('track.usage:api_requests');
        Route::post('documents/extract', [DocumentControllerApi::class, 'extract'])->name('documents.extract')->middleware(['track.usage:api_requests', 'usage.limit:documents']);
        Route::get('documents/{id}', [DocumentControllerApi::class, 'show'])->name('documents.show')->middleware('track.usage:api_requests');
    });

});
    
// Separate Zapier Routes (using api/v1 prefix to match Zapier expectation)
Route::prefix('api/v1')->name('api.v1.')->middleware([\App\Http\Middleware\ApiV1JsonResponse::class])->group(function () {
    Route::middleware(['auth:passport', 'throttle:60,1'])->group(function () {
        Route::get('zapier/me', [\App\Http\Controllers\Api\V1\ZapierController::class, 'me'])->name('zapier.me');
    });
});
