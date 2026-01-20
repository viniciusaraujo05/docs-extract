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
            // Only process numeric limits
            if (is_int($limit)) {
                $used = $usage[$resource] ?? 0;
                $usageData[$resource] = [
                    'used' => $used,
                    'limit' => $limit,
                    'remaining' => $remaining[$resource],
                    'percentage' => $this->calculatePercentage($used, $limit),
                    'is_approaching' => $this->isApproachingLimit($used, $limit),
                    'is_reached' => $this->hasReachedLimit($used, $limit),
                ];
            } else {
                // For non-numeric limits (like exports array), just pass through
                $usageData[$resource] = [
                    'used' => $usage[$resource] ?? 0,
                    'limit' => $limit,
                    'remaining' => $limit,
                    'percentage' => 0,
                    'is_approaching' => false,
                    'is_reached' => false,
                ];
            }
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

    /**
     * Get detailed page usage breakdown by document.
     */
    public function pagesDetail(Request $request): JsonResponse
    {
        $user = $request->user();
        $limits = $this->subscriptionService->getUserPlanLimits($user);

        // Get all documents from current billing period
        $usage = $this->usageTrackingService->getCurrentUsage($user);
        $periodStart = $usage['period_start'] ?? now()->startOfMonth();
        $periodEnd = $usage['period_end'] ?? now()->endOfMonth();

        $documents = $user->documents()
            ->whereBetween('created_at', [$periodStart, $periodEnd])
            ->orderBy('created_at', 'desc')
            ->get(['id', 'name', 'page_count', 'created_at'])
            ->map(fn($doc) => [
                'id' => $doc->id,
                'name' => $doc->name,
                'pages' => $doc->page_count ?? 1,
                'created_at' => $doc->created_at->toDateString(),
            ]);

        $totalPages = $documents->sum('pages');

        return response()->json([
            'success' => true,
            'documents' => $documents,
            'total_pages' => $totalPages,
            'limit' => $limits['pages'] ?? 100,
        ]);
    }
}
