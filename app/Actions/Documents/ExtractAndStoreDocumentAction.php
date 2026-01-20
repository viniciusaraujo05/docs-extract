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

    public function execute(
        User $user,
        UploadedFile $file,
        int $documentTypeId,
        bool $forceOverwrite = false,
    ): Document {
        $documentType = $this->documentTypeRepository->findById($documentTypeId);

        if (! $documentType || $documentType->user_id !== $user->id) {
            throw new \InvalidArgumentException('Invalid document type or you do not have permission to use it.');
        }

        $document = $this->storeDocumentAction->execute(
            user: $user,
            file: $file,
            type: 'predefined',
            documentTypeId: $documentTypeId,
            newTypeName: null,
            schema: ['fields' => $documentType->fields ?? []],
            extractedData: null,
            forceOverwrite: $forceOverwrite,
            dispatchJob: false,
        );

        return $this->documentService->processDocument($document);
    }
}
