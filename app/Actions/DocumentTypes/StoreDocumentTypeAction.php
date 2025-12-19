<?php

declare(strict_types=1);

namespace App\Actions\DocumentTypes;

use App\Models\DocumentType;
use App\Repositories\DocumentTypeRepository;

/**
 * Action para criar um novo tipo de documento.
 * 
 * Encapsula a validação e criação de tipo de documento.
 */
final readonly class StoreDocumentTypeAction
{
    public function __construct(
        private DocumentTypeRepository $documentTypeRepository,
    ) {}

    /**
     * Executa a ação de criar tipo de documento.
     * 
     * @throws \InvalidArgumentException Se os campos forem inválidos
     */
    public function execute(int $userId, string $name, ?string $description, array $fields): DocumentType
    {
        if (empty($fields)) {
            throw new \InvalidArgumentException('Adicione pelo menos um campo.');
        }

        return $this->documentTypeRepository->create([
            'user_id' => $userId,
            'name' => $name,
            'description' => $description,
            'fields' => $fields,
        ]);
    }
}
