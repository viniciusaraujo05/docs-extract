<?php

namespace App\Http\Middleware;

use App\Services\SubscriptionService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Symfony\Component\HttpFoundation\Response;

class CheckPlanLimits
{
    public function __construct(
        private SubscriptionService $subscriptionService
    ) {}

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $feature): Response
    {
        $user = $request->user();

        // Check if user has reached the limit for the specified feature
        if ($this->subscriptionService->hasReachedLimit($user, $feature)) {
            $planName = $this->subscriptionService->getUserPlanName($user);

            return Redirect::route('billing', ['locale' => app()->getLocale()])
                ->with('error', "You've reached the {$feature} limit for your {$planName} plan. Upgrade to continue.");
        }

        return $next($request);
    }
}
