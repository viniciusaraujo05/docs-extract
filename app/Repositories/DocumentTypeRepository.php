<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\DocumentType;
use Illuminate\Database\Eloquent\Collection;

/**
 * Repository para operações de acesso a dados de DocumentType.
 */
final readonly class DocumentTypeRepository
{
    /**
     * Busca todos os tipos de documento do usuário.
     */
    public function getAllForUser(int $userId): Collection
    {
        return DocumentType::query()
            ->forUser($userId)
            ->orderBy('name')
            ->get();
    }

    /**
     * Busca tipos de documento ativos do usuário.
     */
    public function getActiveForUser(int $userId): Collection
    {
        return DocumentType::query()
            ->forUser($userId)
            ->active()
            ->orderBy('name')
            ->get();
    }

    /**
     * Busca tipos de documento ativos com contagem de documentos.
     */
    public function getActiveWithDocumentCount(int $userId): Collection
    {
        return DocumentType::query()
            ->forUser($userId)
            ->active()
            ->withCount('documents')
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'fields']);
    }

    /**
     * Busca tipos de documento ativos para criação de documento.
     */
    public function getActiveForCreation(int $userId): Collection
    {
        return DocumentType::query()
            ->forUser($userId)
            ->active()
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'description', 'fields']);
    }

    /**
     * Busca tipo de documento por ID.
     */
    public function findById(int $id): ?DocumentType
    {
        return DocumentType::find($id);
    }

    /**
     * Cria um novo tipo de documento.
     */
    public function create(array $data): DocumentType
    {
        return DocumentType::create($data);
    }

    /**
     * Atualiza um tipo de documento.
     */
    public function update(DocumentType $documentType, array $data): bool
    {
        return $documentType->update($data);
    }

    /**
     * Deleta um tipo de documento.
     */
    public function delete(DocumentType $documentType): bool
    {
        return $documentType->delete();
    }
}
