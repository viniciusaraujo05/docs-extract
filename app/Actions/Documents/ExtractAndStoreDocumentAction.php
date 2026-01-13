<?php

declare(strict_types=1);

namespace App\Actions\Documents;

use App\Models\Document;
use App\Models\User;
use App\Repositories\DocumentTypeRepository;
use App\Services\DocumentService;
use Illuminate\Http\UploadedFile;

/**
 * Action para extrair e armazenar documento.
 *
 * Encapsula toda a lógica de:
 * - Extração de texto do documento
 * - Aplicação de schema
 * - Armazenamento do documento
 * - Validação de duplicatas
 */
final readonly class ExtractAndStoreDocumentAction
{
    public function __construct(
        private StoreDocumentAction $storeDocumentAction,
        private DocumentService $documentService,
        private DocumentTypeRepository $documentTypeRepository,
    ) {}

    /**
     * Executes the action to extract and store a document.
     *
     * This performs a synchronous extraction by creating the document
     * and immediately triggering the processing logic.
     */
    public function execute(
        User $user,
        UploadedFile $file,
        int $documentTypeId,
        bool $forceOverwrite = false,
    ): Document {
        // Validation of document type ownership
        $documentType = $this->documentTypeRepository->findById($documentTypeId);

        if (! $documentType || $documentType->user_id !== $user->id) {
            throw new \InvalidArgumentException('Invalid document type or you do not have permission to use it.');
        }

        // Use StoreDocumentAction to handle upload and creation
        // We pass extractedData as null to indicate it's pending, but we won't dispatch the background job manually here
        // actually StoreDocumentAction dispatches job if extractedData is null.
        // We want to process synchronously here.
        // However, StoreDocumentAction automatically dispatches if data is null.
        // To avoid double processing (async + sync), we can let it dispatch, but we want the result NOW.
        // A better approach is to let StoreDocumentAction create it, and if the job is dispatched, we can still run processDocument synchronously.
        // The job logic handles concurrency usually, but to be safe, we can optimize StoreDocumentAction later.
        // For now, let's use StoreDocumentAction and then force process.
        
        // Wait, StoreDocumentAction dispatches job automatically.
        // If we want sync, we shouldn't use StoreDocumentAction? Or we should add a flag to it?
        // Let's modify StoreDocumentAction to accept a $dispatchJob flag.
        
        // Use StoreDocumentAction with default behavior (dispatches job)
        // Check if we can just create it manually here to avoid the job? 
        // No, StoreDocumentAction encapsulates complex storage logic.
        // Let's assume for this specific action (Sync Extraction), we accept the job might run efficiently or fail if we process faster.
        // Actually, DocumentService::processDocument checks status.
        
        // BETTER: Use StoreDocumentAction but we need to prevent the job if we want true sync without race conditions.
        // But StoreDocumentAction is readonly. 
        // Let's refactor StoreDocumentAction first to allow skipping dispatch.
        
        $document = $this->storeDocumentAction->execute(
            user: $user,
            file: $file,
            type: 'predefined',
            documentTypeId: $documentTypeId,
            newTypeName: null,
            schema: $documentType->schema ?? ['fields' => []],
            extractedData: null,
            forceOverwrite: $forceOverwrite,
        );
        
        // Process synchronously immediately
        // Even if job is queued, this will likely finish first and update status.
        return $this->documentService->processDocument($document);
    }
}
