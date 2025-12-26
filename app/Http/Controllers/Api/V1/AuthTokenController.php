<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Actions\Auth\AuthenticateApiClientAction;
use App\Enums\HttpResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\AuthenticateApiClientRequest;
use App\Models\ApiClient;
use App\Repositories\ApiClientRepository;
use Illuminate\Http\JsonResponse;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use PHPOpenSourceSaver\JWTAuth\JWTGuard;

class AuthTokenController extends Controller
{
    public function __construct(
        private readonly AuthenticateApiClientAction $authenticateAction,
        private readonly ApiClientRepository $repository,
    ) {}

    public function store(AuthenticateApiClientRequest $request): JsonResponse
    {
        $credentials = $request->validated();

        $result = $this->authenticateAction->execute(
            $credentials['client_id'],
            $credentials['client_secret'],
            $request->ip()
        );

        if ($result === null) {
            return response()->json(
                HttpResponse::UNAUTHORIZED->json(
                    message: 'Invalid credentials, client disabled, or IP not allowed.'
                ),
                HttpResponse::UNAUTHORIZED->value
            );
        }

        return $this->tokenResponse($result['token'], $result['client']);
    }

    public function refresh(): JsonResponse
    {
        /** @var JWTGuard $guard */
        $guard = auth('api');

        $token = $guard->refresh(true, true);

        /** @var ApiClient $client */
        $client = $guard->user();

        $this->repository->updateLastUsed($client);

        return $this->tokenResponse($token, $client);
    }

    public function destroy(): JsonResponse
    {
        JWTAuth::invalidate(JWTAuth::getToken());

        return response()->json(
            HttpResponse::OK->json(
                message: 'Token revoked successfully.'
            ),
            HttpResponse::OK->value
        );
    }

    protected function tokenResponse(string $token, ApiClient $client): JsonResponse
    {
        /** @var JWTGuard $guard */
        $guard = auth('api');

        $ttl = $guard->factory()->getTTL() * 60;

        return response()->json([
            'token_type' => 'Bearer',
            'access_token' => $token,
            'expires_in' => $ttl,
            'client' => [
                'id' => $client->public_id,
                'name' => $client->name,
                'status' => $client->status,
                'rate_limit_per_minute' => $client->rate_limit_per_minute,
            ],
        ]);
    }
}
