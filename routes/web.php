<?php

use App\Http\Controllers\Api\ExtractionController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\DocumentTypeController;
use App\Http\Controllers\ReportConfigurationController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Reports (was Dashboard)
    Route::get('dashboard', [ReportController::class, 'index'])->name('dashboard');
    Route::get('api/reports/{documentType}/data', [ReportController::class, 'getData'])->name('reports.data');
    Route::get('api/reports/{documentType}/export', [ReportController::class, 'export'])->name('reports.export');
    Route::post('api/reports/{documentType}/analyze-ai', [ReportController::class, 'analyzeWithAI'])->name('reports.analyze-ai');
    
    // Report Configurations
    Route::get('api/reports/{documentType}/configurations', [ReportConfigurationController::class, 'index']);
    Route::post('api/reports/{documentType}/configurations', [ReportConfigurationController::class, 'store']);
    Route::get('api/reports/{documentType}/documents', [ReportConfigurationController::class, 'documents']);
    Route::post('api/reports/{documentType}/preview', [ReportConfigurationController::class, 'preview']);
    Route::put('api/reports/configurations/{configuration}', [ReportConfigurationController::class, 'update']);
    Route::delete('api/reports/configurations/{configuration}', [ReportConfigurationController::class, 'destroy']);
    Route::get('api/reports/configurations/{configuration}/generate', [ReportConfigurationController::class, 'generate']);

    // Documents
    Route::resource('documents', DocumentController::class)->except(['edit']);
    Route::get('documents/{document}/preview', [DocumentController::class, 'preview'])->name('documents.preview');
    Route::put('documents/{document}/data', [DocumentController::class, 'updateData'])->name('documents.update-data');
    Route::post('documents/{document}/reprocess', [DocumentController::class, 'reprocess'])->name('documents.reprocess');

    // Document Types
    Route::resource('document-types', DocumentTypeController::class);

    // API for extraction
    Route::post('api/documents/analyze', [ExtractionController::class, 'analyze'])->name('api.documents.analyze');
    Route::post('api/documents/extract', [ExtractionController::class, 'extract'])->name('api.documents.extract');
    Route::get('api/documents/check-name', [DocumentController::class, 'checkName'])->name('api.documents.check-name');
});

require __DIR__.'/settings.php';
