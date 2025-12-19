<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Document;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * Repository para operações de acesso a dados de Document.
 * 
 * Segue o padrão Repository para separar a lógica de acesso a dados
 * da lógica de negócio, facilitando testes e manutenção.
 */
final readonly class DocumentRepository
{
    /**
     * Busca documentos paginados do usuário com relacionamentos.
     * 
     * @return array{paginator: LengthAwarePaginator, collection: Collection}
     */
    public function getPaginatedForUser(User $user, int $perPage = 20): array
    {
        $paginator = Document::query()
            ->with('documentType:id,name,description')
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return [
            'paginator' => $paginator,
            'collection' => $paginator->getCollection(),
        ];
    }

    /**
     * Busca documento pelo ID.
     * 
     * @param string $id ID do documento a ser buscado
     * @return Document|null O documento encontrado ou null se não existir
     */
    public function findById(string $id): ?Document
    {
        return Document::where('id', $id)->first();
    }

    /**
     * Busca documentos completos por tipo de documento.
     */
    public function getCompletedByDocumentType(int $documentTypeId): Collection
    {
        return Document::query()
            ->where('document_type_id', $documentTypeId)
            ->where('status', 'completed')
            ->whereNotNull('extracted_data')
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * Busca documentos completos por tipo para seleção manual.
     */
    public function getForManualSelection(int $documentTypeId): Collection
    {
        return Document::query()
            ->where('document_type_id', $documentTypeId)
            ->where('status', 'completed')
            ->whereNotNull('extracted_data')
            ->orderByDesc('created_at')
            ->get(['id', 'name', 'original_filename', 'created_at']);
    }

    /**
     * Verifica se existe documento com o mesmo nome para o usuário.
     */
    public function existsByNameForUser(string $name, int $userId): bool
    {
        return Document::query()
            ->where('user_id', $userId)
            ->where('name', $name)
            ->exists();
    }

    /**
     * Busca documento por ID com relacionamentos.
     */
    public function findWithRelations(int $id): ?Document
    {
        return Document::query()
            ->with('user', 'documentType')
            ->find($id);
    }

    /**
     * Cria um novo documento.
     */
    public function create(array $data): Document
    {
        return Document::create($data);
    }

    /**
     * Atualiza um documento.
     */
    public function update(Document $document, array $data): bool
    {
        return $document->update($data);
    }

    /**
     * Deleta um documento.
     */
    public function delete(Document $document): bool
    {
        return $document->delete();
    }
}
