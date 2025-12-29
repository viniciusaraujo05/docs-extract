<?php

namespace App\Http\Middleware;

use App\Models\ApiClient;
use App\Models\User;
use App\Services\UsageTrackingService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackUsage
{
    public function __construct(
        private UsageTrackingService $usageTrackingService
    ) {}

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $resource): Response
    {
        // Get response first
        $response = $next($request);
        
        // Only track if request was successful and authenticated user exists
        if ($response->isSuccessful() && $user = $request->user()) {
            // Track for web users (User model)
            if ($user instanceof User) {
                $this->usageTrackingService->trackUsage($user, $resource);
            }
            // Track for API clients (ApiClient model with User relationship)
            elseif ($user instanceof ApiClient && $user->user) {
                $this->usageTrackingService->trackUsage($user->user, $resource);
            }
        }
        
        return $response;
    }
}
