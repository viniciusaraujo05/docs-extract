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
     * @param  string  $id  ID do documento a ser buscado
     * @return Document|null O documento encontrado ou null se não existir
     */
    public function findById(string $id): ?Document
    {
        return Document::where('id', $id)->first();
    }

    /**
     * Busca documentos completos por tipo de documento.
     *
     * SECURITY: Filters by user_id to prevent cross-user data access
     */
    public function getCompletedByDocumentType(int $documentTypeId, int $userId): Collection
    {
        return Document::query()
            ->where('document_type_id', $documentTypeId)
            ->where('user_id', $userId)
            ->where('status', 'completed')
            ->whereNotNull('extracted_data')
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * Busca documentos completos por tipo para seleção manual.
     *
     * SECURITY: Filters by user_id to prevent cross-user data access
     */
    public function getForManualSelection(int $documentTypeId, int $userId): Collection
    {
        return Document::query()
            ->where('document_type_id', $documentTypeId)
            ->where('user_id', $userId)
            ->where('status', 'completed')
            ->whereNotNull('extracted_data')
            ->orderByDesc('created_at')
            ->get(['id', 'name', 'original_filename', 'created_at']);
    }

    /**
     * Verifica se existe documento com o mesmo nome/ficheiro para o usuário.
     *
     * Aceita tanto o nome exibido (sem extensão) quanto o nome original do ficheiro.
     */
    public function existsByNameForUser(string $filenameOrName, int $userId, ?string $displayName = null): bool
    {
        if ($filenameOrName === '' && ($displayName === null || $displayName === '')) {
            return false;
        }

        $originalFilename = mb_strtolower($filenameOrName);
        $baseName = mb_strtolower(pathinfo($filenameOrName, PATHINFO_FILENAME));
        $providedName = $displayName !== null ? mb_strtolower($displayName) : null;

        return Document::query()
            ->where('user_id', $userId)
            ->where(function ($query) use ($originalFilename, $baseName, $providedName) {
                // Anchora inicial para permitir apenas orWhere subsequentes
                $query->whereRaw('1 = 0');

                if ($originalFilename !== '') {
                    $query->orWhereRaw('LOWER(original_filename) = ?', [$originalFilename]);
                }

                if ($baseName !== '') {
                    $query->orWhereRaw('LOWER(name) = ?', [$baseName]);
                }

                if ($providedName !== null && $providedName !== '' && $providedName !== $baseName) {
                    $query->orWhereRaw('LOWER(name) = ?', [$providedName]);
                }
            })
            ->exists();
    }

    /**
     * Busca documento por nome de arquivo original para o usuário.
     */
    public function findByFilenameForUser(string $originalFilename, int $userId): ?Document
    {
        return Document::query()
            ->where('user_id', $userId)
            ->where('original_filename', $originalFilename)
            ->first();
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

    /**
     * Busca documentos por nome (busca parcial).
     */
    public function findByName(User $user, string $name)
    {
        return Document::query()
            ->where('user_id', $user->id)
            ->where('name', 'LIKE', "%{$name}%")
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Busca documentos por intervalo de datas com paginação.
     *
     * @return array{collection: \Illuminate\Support\Collection, paginator: \Illuminate\Contracts\Pagination\LengthAwarePaginator}
     */
    public function findByDateRange(User $user, string $startDate, string $endDate, int $perPage = 20): array
    {
        $paginator = Document::query()
            ->where('user_id', $user->id)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return [
            'collection' => $paginator->getCollection(),
            'paginator' => $paginator,
        ];
    }

    /**
     * Verifica quais nomes de uma lista já existem para o usuário.
     * Retorna array com os nomes que já existem (conflitam).
     *
     * @param  string[]  $filenames  Nomes originais dos arquivos
     * @return string[] Nomes da lista de entrada que possuem duplicatas
     */
    public function findExistingNames(array $filenames, int $userId): array
    {
        if (empty($filenames)) {
            return [];
        }

        // Normaliza entradas para comparação
        $normalizedMap = []; // 'normalized_name' => 'original_input_name'
        $normalizedBaseMap = []; // 'normalized_base_name' => 'original_input_name'

        foreach ($filenames as $name) {
            $lower = mb_strtolower($name);
            $normalizedMap[$lower] = $name;

            $base = mb_strtolower(pathinfo($name, PATHINFO_FILENAME));
            $normalizedBaseMap[$base] = $name;
        }

        $searchNames = array_keys($normalizedMap);
        $searchBaseNames = array_keys($normalizedBaseMap);

        $query = Document::query()
            ->select(['original_filename', 'name'])
            ->where('user_id', $userId)
            ->where(function ($q) use ($searchNames, $searchBaseNames) {
                $q->whereIn(\Illuminate\Support\Facades\DB::raw('LOWER(original_filename)'), $searchNames)
                    ->orWhereIn(\Illuminate\Support\Facades\DB::raw('LOWER(name)'), $searchBaseNames);
            });

        $existing = $query->get();

        $duplicates = [];

        foreach ($existing as $doc) {
            // Verifica match com original_filename
            $docOriginalLower = mb_strtolower($doc->original_filename ?? '');
            if (isset($normalizedMap[$docOriginalLower])) {
                $duplicates[] = $normalizedMap[$docOriginalLower];

                continue; // Encontrou match para este input, vai para próximo doc
            }

            // Verifica match com name
            $docNameLower = mb_strtolower($doc->name);
            if (isset($normalizedBaseMap[$docNameLower])) {
                $duplicates[] = $normalizedBaseMap[$docNameLower];
            }
        }

        return array_values(array_unique($duplicates));
    }
}
