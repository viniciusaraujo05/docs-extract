<?php

namespace App\Services;

use App\Models\PlanUsage;
use App\Models\User;

class UsageTrackingService
{
    /**
     * Track resource usage for a user
     */
    public function trackUsage(User $user, string $resource, int $count = 1): bool
    {
        $usage = PlanUsage::getOrCreateForUser($user);
        return $usage->incrementUsage($resource, $count);
    }

    /**
     * Get current usage for a user
     */
    public function getCurrentUsage(User $user): array
    {
        $usage = PlanUsage::getOrCreateForUser($user);
        
        return [
            'documents' => $usage->documents_count,
            'models' => $usage->models_count,
            'api_requests' => $usage->api_requests_count,
            'reports' => $usage->reports_count,
            'period_start' => $usage->period_start,
            'period_end' => $usage->period_end,
        ];
    }

    /**
     * Get remaining quota for each resource
     */
    public function getRemainingQuota(User $user): array
    {
        $usage = PlanUsage::getOrCreateForUser($user);
        $limits = app(SubscriptionService::class)->getUserPlanLimits($user);
        
        $remaining = [];
        foreach ($limits as $resource => $limit) {
            $remaining[$resource] = $usage->getRemaining($resource, $limit);
        }
        
        return $remaining;
    }

    /**
     * Check if user can perform action
     */
    public function canPerformAction(User $user, string $resource, int $count = 1): bool
    {
        $usage = PlanUsage::getOrCreateForUser($user);
        $limits = app(SubscriptionService::class)->getUserPlanLimits($user);
        $limit = $limits[$resource] ?? 0;
        
        if ($limit === -1) {
            return true; // unlimited
        }
        
        return $usage->getRemaining($resource, $limit) >= $count;
    }

    /**
     * Reset usage for users whose billing period has ended
     * This should be run daily via scheduler
     */
    public function resetExpiredPeriods(): int
    {
        $resetCount = 0;
        
        // Get all usage records where period_end is in the past
        $expiredUsages = PlanUsage::where('period_end', '<', now())
            ->where('billing_period', '!=', now()->format('Y-m'))
            ->get();
        
        foreach ($expiredUsages as $usage) {
            $user = $usage->user;
            $newUsage = PlanUsage::getOrCreateForUser($user);
            
            // Only reset if we created a new period
            if ($newUsage->id !== $usage->id) {
                $resetCount++;
            }
        }
        
        return $resetCount;
    }
}
