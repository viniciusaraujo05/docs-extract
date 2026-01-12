<?php

declare(strict_types=1);

namespace App\Actions\Api;

use App\Models\ApiClient;
use App\Models\User;
use App\Repositories\ApiClientRepository;
use Illuminate\Support\Str;

final readonly class CreateApiClientAction
{
    public function __construct(
        private ApiClientRepository $repository,
    ) {}

    /**
     * @return array{client: ApiClient, plainTextSecret: string}
     */
    public function execute(User $user, ?string $name, ?string $contactEmail, ?string $userAgent): array
    {
        if ($name === null || trim($name) === '') {
            $name = 'API Client - '.$user->name;
        }

        $contactEmail = $contactEmail ?? $user->email;
        $plainSecret = Str::random(40);

        $client = $this->repository->create([
            'user_id' => $user->id,
            'name' => $name,
            'contact_email' => $contactEmail,
            'client_id' => 'client_'.Str::random(32),
            'client_secret' => $plainSecret,
            'status' => 'active',
            'rate_limit_per_minute' => 60,
            'metadata' => [
                'created_via' => 'web',
                'user_agent' => $userAgent,
            ],
        ]);

        return [
            'client' => $client,
            'plainTextSecret' => $plainSecret,
        ];
    }
}
