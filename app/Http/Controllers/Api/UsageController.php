<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SubscriptionService;
use App\Services\UsageTrackingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UsageController extends Controller
{
    public function __construct(
        private UsageTrackingService $usageTrackingService,
        private SubscriptionService $subscriptionService
    ) {}

    /**
     * Get current usage statistics for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Get current usage and remaining quota
        $usage = $this->usageTrackingService->getCurrentUsage($user);
        $remaining = $this->usageTrackingService->getRemainingQuota($user);
        $limits = $this->subscriptionService->getUserPlanLimits($user);
        
        // Build usage data for each resource
        $usageData = [];
        foreach ($limits as $resource => $limit) {
            $used = $usage[$resource] ?? 0;
            $usageData[$resource] = [
                'used' => $used,
                'limit' => $limit,
                'remaining' => $remaining[$resource],
                'percentage' => $this->calculatePercentage($used, $limit),
                'is_approaching' => $this->isApproachingLimit($used, $limit),
                'is_reached' => $this->hasReachedLimit($used, $limit),
            ];
        }
        
        return response()->json([
            'success' => true,
            'usage' => $usageData,
            'period' => [
                'start' => $usage['period_start'],
                'end' => $usage['period_end'],
            ],
            'plan' => [
                'name' => $this->subscriptionService->getUserPlanName($user),
                'status' => $user->subscription('default')?->stripe_status ?? 'inactive',
            ],
        ]);
    }

    /**
     * Calculate usage percentage.
     */
    private function calculatePercentage(int $used, int $limit): float
    {
        if ($limit === -1) {
            return 0; // unlimited
        }
        
        return $limit > 0 ? min(100, ($used / $limit) * 100) : 0;
    }

    /**
     * Check if user is approaching limit (80% threshold).
     */
    private function isApproachingLimit(int $used, int $limit): bool
    {
        if ($limit === -1) {
            return false; // unlimited
        }
        
        return $used >= ($limit * 0.8);
    }

    /**
     * Check if user has reached limit.
     */
    private function hasReachedLimit(int $used, int $limit): bool
    {
        if ($limit === -1) {
            return false; // unlimited
        }
        
        return $used >= $limit;
    }
}
