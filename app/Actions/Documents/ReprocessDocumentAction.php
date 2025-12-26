<?php

declare(strict_types=1);

namespace App\Actions\Documents;

use App\Jobs\ProcessDocumentJob;
use App\Models\Document;
use App\Models\Organization;
use App\Repositories\DocumentRepository;

/**
 * Action para reprocessar um documento.
 *
 * Encapsula a lógica de reprocessamento incluindo verificação de créditos.
 */
final readonly class ReprocessDocumentAction
{
    public function __construct(
        private DocumentRepository $documentRepository,
    ) {}

    /**
     * Executa a ação de reprocessar documento.
     *
     * @throws \RuntimeException Se o documento não pode ser reprocessado
     * @throws \RuntimeException Se não há créditos suficientes
     */
    public function execute(Document $document, ?Organization $organization): void
    {
        if (! $document->canReprocess()) {
            throw new \RuntimeException('Este documento não pode ser reprocessado no momento.');
        }

        if ($organization?->hasCredits() === false) {
            throw new \RuntimeException('Créditos insuficientes para reprocessar.');
        }

        $this->documentRepository->update($document, ['status' => 'pending']);
        ProcessDocumentJob::dispatch($document);
        $organization?->deductCredits();
    }
}
