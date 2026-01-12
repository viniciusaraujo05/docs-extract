<?php

declare(strict_types=1);

namespace App\Actions\Api;

use App\Models\ApiClient;
use App\Repositories\ApiClientRepository;
use Illuminate\Support\Str;

final readonly class RegenerateApiClientSecretAction
{
    public function __construct(
        private ApiClientRepository $repository,
    ) {}

    /**
     * @return string The new plain text secret
     */
    public function execute(ApiClient $apiClient): string
    {
        $plainSecret = Str::random(40);

        $this->repository->update($apiClient, [
            'client_secret' => $plainSecret,
        ]);

        return $plainSecret;
    }
}
