<?php

namespace App\Services;

use App\Actions\Usage\DecrementUsageAction;
use App\Actions\Usage\IncrementUsageAction;
use App\Models\User;
use App\Repositories\PlanUsageRepository;
use App\Services\SubscriptionService;
use Illuminate\Http\JsonResponse;

class UsageLimitService
{
    public function __construct(
        private SubscriptionService $subscriptionService,
        private PlanUsageRepository $planUsageRepository,
        private IncrementUsageAction $incrementUsageAction,
        private DecrementUsageAction $decrementUsageAction
    ) {}

    /**
     * Check if user has reached the limit for a specific resource
     */
    public function hasReachedLimit(User $user, string $resource): bool
    {
        $limits = $this->subscriptionService->getUserPlanLimits($user);
        $limit = $limits[$resource] ?? 0;

        // If limit is -1, it means unlimited
        if ($limit === -1) {
            return false;
        }

        // If limit is an array (like exports), check if user has any access
        if (is_array($limit)) {
            return empty($limit);
        }

        // If limit is boolean (like webhooks), check if it's enabled
        if (is_bool($limit)) {
            return !$limit;
        }

        // For numeric limits, check current usage
        $usage = $this->planUsageRepository->getUsage($user, $resource);
        
        return $usage >= $limit;
    }

    /**
     * Get remaining count for a resource
     */
    public function getRemaining(User $user, string $resource): int
    {
        $limits = $this->subscriptionService->getUserPlanLimits($user);
        $limit = $limits[$resource] ?? 0;

        if ($limit === -1) {
            return PHP_INT_MAX;
        }

        if (!is_numeric($limit)) {
            return 0;
        }

        return $this->planUsageRepository->getRemaining($user, $resource, $limit);
    }

    /**
     * Check if user can create a resource and return appropriate response
     */
    public function checkLimitAndRespond(User $user, string $resource, ?string $customMessage = null): ?JsonResponse
    {
        if ($this->hasReachedLimit($user, $resource)) {
            $resourceNames = [
                'documents' => __('documents'),
                'models' => __('models'),
                'reports' => __('reports'),
                'api_keys' => __('API keys'),
                'api_requests' => __('API requests'),
            ];

            $message = $customMessage ?? __(":resource limit reached. You've used all :limit :resource included in your plan. Upgrade to continue.", [
                'resource' => $resourceNames[$resource] ?? $resource,
                'limit' => $this->subscriptionService->getUserPlanLimits($user)[$resource] ?? 0,
            ]);

            return response()->json([
                'error' => $message,
                'code' => 'LIMIT_REACHED',
                'resource' => $resource,
                'limit' => $this->subscriptionService->getUserPlanLimits($user)[$resource] ?? 0,
                'usage' => $this->planUsageRepository->getUsage($user, $resource),
            ], 422);
        }

        return null;
    }

    /**
     * Increment usage after successful creation
     */
    public function incrementUsage(User $user, string $resource): void
    {
        $this->incrementUsageAction->execute($user, $resource);
    }

    /**
     * Decrement usage when resource is deleted
     */
    public function decrementUsage(User $user, string $resource): void
    {
        $this->decrementUsageAction->execute($user, $resource);
    }
}
