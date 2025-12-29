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
        $response = $this->usageLimitService->checkLimitAndRespond($actualUser, $resource);
        
        if ($response) {
            return $response;
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
