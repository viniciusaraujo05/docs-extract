<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\ReportConfiguration;
use Illuminate\Database\Eloquent\Collection;

/**
 * Repository para operações de acesso a dados de ReportConfiguration.
 */
final readonly class ReportConfigurationRepository
{
    /**
     * Busca todas as configurações do usuário para um tipo de documento.
     */
    public function getAllForUserAndDocumentType(int $userId, int $documentTypeId): Collection
    {
        return ReportConfiguration::query()
            ->forUser($userId)
            ->forDocumentType($documentTypeId)
            ->orderBy('name')
            ->get();
    }

    /**
     * Busca configuração por ID.
     */
    public function findById(int $id): ?ReportConfiguration
    {
        return ReportConfiguration::find($id);
    }

    /**
     * Cria uma nova configuração.
     */
    public function create(array $data): ReportConfiguration
    {
        return ReportConfiguration::create($data);
    }

    /**
     * Atualiza uma configuração.
     */
    public function update(ReportConfiguration $configuration, array $data): bool
    {
        return $configuration->update($data);
    }

    /**
     * Deleta uma configuração.
     */
    public function delete(ReportConfiguration $configuration): bool
    {
        return $configuration->delete();
    }
}
