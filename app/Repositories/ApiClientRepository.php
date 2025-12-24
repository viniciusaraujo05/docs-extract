<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\ApiClient;

/**
 * Repository para operações de acesso a dados de ApiClient.
 */
final readonly class ApiClientRepository
{
    /**
     * Busca cliente por client_id.
     */
    public function findByClientId(string $clientId): ?ApiClient
    {
        return ApiClient::query()
            ->where('client_id', $clientId)
            ->first();
    }

    /**
     * Busca cliente por ID.
     */
    public function findById(int $id): ?ApiClient
    {
        return ApiClient::find($id);
    }

    /**
     * Atualiza o timestamp de último uso.
     */
    public function updateLastUsed(ApiClient $client): bool
    {
        return $client->forceFill(['last_used_at' => now()])->save();
    }

    /**
     * Cria um novo cliente de API.
     */
    public function create(array $data): ApiClient
    {
        return ApiClient::create($data);
    }

    /**
     * Atualiza um cliente de API.
     */
    public function update(ApiClient $client, array $data): bool
    {
        return $client->update($data);
    }

    /**
     * Deleta um cliente de API.
     */
    public function delete(ApiClient $client): bool
    {
        return $client->delete();
    }
}
