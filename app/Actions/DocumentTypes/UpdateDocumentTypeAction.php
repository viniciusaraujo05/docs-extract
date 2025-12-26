<?php

declare(strict_types=1);

namespace App\Actions\DocumentTypes;

use App\Models\DocumentType;
use App\Repositories\DocumentTypeRepository;

/**
 * Action para atualizar um tipo de documento.
 */
final readonly class UpdateDocumentTypeAction
{
    public function __construct(
        private DocumentTypeRepository $documentTypeRepository,
    ) {}

    /**
     * Executa a ação de atualizar tipo de documento.
     *
     * @throws \InvalidArgumentException Se os campos forem inválidos
     */
    public function execute(
        DocumentType $documentType,
        string $name,
        ?string $description,
        array $fields,
        bool $isActive = true
    ): bool {
        if (empty($fields)) {
            throw new \InvalidArgumentException('Adicione pelo menos um campo.');
        }

        return $this->documentTypeRepository->update($documentType, [
            'name' => $name,
            'description' => $description,
            'fields' => $fields,
            'is_active' => $isActive,
        ]);
    }
}
