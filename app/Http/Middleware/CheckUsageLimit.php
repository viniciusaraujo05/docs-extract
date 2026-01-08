<?php

namespace App\Http\Middleware;

use App\Models\ApiClient;
use App\Services\UsageLimitService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CheckUsageLimit
{
    public function __construct(
        private UsageLimitService $usageLimitService
    ) {}

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $resource)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Get the actual user for API clients
        $actualUser = null;
        if ($user instanceof \App\Models\User) {
            $actualUser = $user;
        } elseif ($user instanceof ApiClient && $user->user) {
            $actualUser = $user->user;
        }

        if (!$actualUser) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Check if user has reached the limit
        if ($this->usageLimitService->hasReachedLimit($actualUser, $resource)) {
            $limits = app(\App\Services\SubscriptionService::class)->getUserPlanLimits($actualUser);
            $limit = $limits[$resource] ?? 0;
            
            $resourceNames = [
                'documents' => __('documents'),
                'models' => __('models'),
                'reports' => __('reports'),
                'api_requests' => __('API requests'),
            ];
            
            $message = __(":resource limit reached. You've used all :limit :resource included in your plan. Upgrade to continue.", [
                'resource' => $resourceNames[$resource] ?? $resource,
                'limit' => $limit,
            ]);
            
            // If this is an Inertia request, redirect back with error
            if ($request->header('X-Inertia')) {
                return redirect()->back()->with('error', $message);
            }
            
            // Otherwise return JSON for API requests
            return response()->json([
                'error' => $message,
                'code' => 'LIMIT_REACHED',
                'resource' => $resource,
                'limit' => $limit,
                'usage' => app(\App\Repositories\PlanUsageRepository::class)->getUsage($actualUser, $resource),
            ], 422);
        }

        // Continue with the request
        $response = $next($request);

        // If the request was successful (status 2xx), increment usage
        if ($response->getStatusCode() >= 200 && $response->getStatusCode() < 300) {
            $this->usageLimitService->incrementUsage($actualUser, $resource);
        }

        return $response;
    }
}
