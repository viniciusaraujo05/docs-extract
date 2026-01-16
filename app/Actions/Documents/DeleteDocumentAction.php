<?php

declare(strict_types=1);

namespace App\Actions\Documents;

use App\Models\Document;
use App\Repositories\DocumentRepository;
use Illuminate\Support\Facades\Storage;

/**
 * Action para deletar um documento.
 *
 * Encapsula a lógica de deleção incluindo remoção do arquivo físico.
 */
final readonly class DeleteDocumentAction
{
    public function __construct(
        private DocumentRepository $documentRepository,
    ) {}

    /**
     * Executa a ação de deletar documento.
     */
    public function execute(Document $document): bool
    {
        Storage::disk(config('filesystems.default'))->delete($document->file_path);

        return $this->documentRepository->delete($document);
    }
}
