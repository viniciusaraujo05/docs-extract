<?php

namespace App\Http\Middleware;

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
        
        // Only track if request was successful and user is authenticated
        if ($response->isSuccessful() && $user = $request->user()) {
            $this->usageTrackingService->trackUsage($user, $resource);
        }
        
        return $response;
    }
}
