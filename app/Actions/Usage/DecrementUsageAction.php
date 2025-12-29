<?php

namespace App\Actions\Usage;

use App\Models\User;
use App\Repositories\PlanUsageRepository;

final class DecrementUsageAction
{
    public function __construct(
        private readonly PlanUsageRepository $planUsageRepository
    ) {}

    /**
     * Execute the action
     */
    public function execute(User $user, string $resource, int $count = 1): bool
    {
        return $this->planUsageRepository->decrementUsage($user, $resource, $count);
    }
}
