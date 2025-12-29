<?php

namespace App\Repositories;

use App\Models\PlanUsage;
use App\Models\User;

class PlanUsageRepository
{
    /**
     * Get or create plan usage for user
     */
    public function getOrCreateForUser(User $user): PlanUsage
    {
        return PlanUsage::getOrCreateForUser($user);
    }

    /**
     * Increment usage counter
     */
    public function incrementUsage(User $user, string $resource, int $count = 1): bool
    {
        $planUsage = $this->getOrCreateForUser($user);
        return $planUsage->incrementUsage($resource, $count);
    }

    /**
     * Decrement usage counter
     */
    public function decrementUsage(User $user, string $resource, int $count = 1): bool
    {
        $planUsage = $this->getOrCreateForUser($user);
        return $planUsage->decrementUsage($resource, $count);
    }

    /**
     * Get current usage for a resource
     */
    public function getUsage(User $user, string $resource): int
    {
        $planUsage = $this->getOrCreateForUser($user);
        $column = "{$resource}_count";
        
        return $planUsage->$column ?? 0;
    }

    /**
     * Get remaining quota for a resource
     */
    public function getRemaining(User $user, string $resource, int $limit): int
    {
        $planUsage = $this->getOrCreateForUser($user);
        return $planUsage->getRemaining($resource, $limit);
    }
}
