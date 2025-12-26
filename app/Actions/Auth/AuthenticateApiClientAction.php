<?php

declare(strict_types=1);

namespace App\Actions\Auth;

use App\Models\ApiClient;
use App\Repositories\ApiClientRepository;
use Illuminate\Support\Facades\Hash;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

/**
 * Action para autenticar cliente de API e gerar JWT.
 */
final readonly class AuthenticateApiClientAction
{
    public function __construct(
        private ApiClientRepository $repository,
    ) {}

    /**
     * Executa a autenticação e retorna o token JWT.
     *
     * @return array{token: string, client: ApiClient}|null
     */
    public function execute(string $clientId, string $clientSecret, string $requestIp): ?array
    {
        $client = $this->repository->findByClientId($clientId);

        if (! $client) {
            return null;
        }

        if ($client->status !== 'active') {
            return null;
        }

        if (! Hash::check($clientSecret, $client->client_secret)) {
            return null;
        }

        if (is_array($client->allowed_ips) && $client->allowed_ips !== [] && ! in_array($requestIp, $client->allowed_ips, true)) {
            return null;
        }

        $token = JWTAuth::claims([
            'client_public_id' => $client->public_id,
            'client_name' => $client->name,
        ])->fromUser($client);

        $this->repository->updateLastUsed($client);

        return [
            'token' => $token,
            'client' => $client,
        ];
    }
}
