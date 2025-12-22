<?php

use App\Http\Controllers\Api\ExtractionController;
use App\Http\Controllers\Api\GeolocationController;
use App\Http\Controllers\Api\TranslationController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\ReportConfigurationController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

// Geolocation proxy (public, cached)
Route::get('geolocation/detect', [GeolocationController::class, 'detect']);

// Locale routes (public)
Route::get('locale/current', [LocaleController::class, 'current']);
Route::post('locale/update', [LocaleController::class, 'update']);

// Translation routes (public, cached in Redis)
Route::get('translations/{locale}', [TranslationController::class, 'show']);

// Protected API routes (using web session authentication)
Route::middleware(['auth'])->group(function () {
    // Reports API
    Route::get('reports/{documentType}/data', [ReportController::class, 'getData']);
    Route::get('reports/{documentType}/export', [ReportController::class, 'export']);
    Route::get('reports/{documentType}/latest-analysis', [ReportController::class, 'getLatestAnalysis']);
    Route::post('reports/{documentType}/analyze-ai', [ReportController::class, 'analyzeWithAI']);

    // Report Configurations API
    Route::get('reports/{documentType}/configurations', [ReportConfigurationController::class, 'index']);
    Route::post('reports/{documentType}/configurations', [ReportConfigurationController::class, 'store']);
    Route::get('reports/{documentType}/documents', [ReportConfigurationController::class, 'documents']);
    Route::post('reports/{documentType}/preview', [ReportConfigurationController::class, 'preview']);
    Route::put('reports/configurations/{configuration}', [ReportConfigurationController::class, 'update']);
    Route::delete('reports/configurations/{configuration}', [ReportConfigurationController::class, 'destroy']);
    Route::get('reports/configurations/{configuration}/generate', [ReportConfigurationController::class, 'generate']);

    // Documents API
    Route::post('documents/analyze', [ExtractionController::class, 'analyze']);
    Route::post('documents/extract', [ExtractionController::class, 'extract']);
    Route::get('documents/check-name', [DocumentController::class, 'checkName']);
});
