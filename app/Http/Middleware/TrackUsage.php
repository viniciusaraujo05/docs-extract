<?php

namespace App\Http\Middleware;

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
            // Track for both web users and API clients
            if ($user instanceof User) {
                $this->usageTrackingService->trackUsage($user, $resource);
            } elseif (property_exists($user, 'user') && $user->user instanceof User) {
                // For API clients, track usage for the associated user
                $this->usageTrackingService->trackUsage($user->user, $resource);
            }
        }
        
        return $response;
    }
}
