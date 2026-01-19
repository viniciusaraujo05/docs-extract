<?php

namespace App\Services;

use App\Models\PlanUsage;
use App\Models\User;

class SubscriptionService
{
    public function __construct(
        private StripeProductService $stripeProductService,
        private UsageTrackingService $usageTrackingService
    ) {}

    /**
     * Get all active prices from Stripe
     */
    public function getActivePrices(): \Illuminate\Support\Collection
    {
        return $this->stripeProductService->getActivePrices();
    }

    public function getUserSubscriptionData(User $user): array
    {
        $subscription = $user->subscription('default');
        $invoices = $user->invoices();
        $upcomingInvoice = null;

        if ($subscription && $subscription->active()) {
            try {
                $upcomingInvoice = $user->upcomingInvoice();
            } catch (\Exception $e) {
                // No upcoming invoice
            }
        }

        return [
            'subscription' => $subscription,
            'subscriptions' => $user->subscriptions,
            'invoices' => $invoices,
            'upcoming_invoice' => $upcomingInvoice,
            'plan_name' => $this->getUserPlanName($user),
            'plan_features' => $this->getUserPlanFeatures($user),
        ];
    }

    public function createCheckoutSession(User $user, string $priceId): string
    {
        // Ensure user has a Stripe ID so Cashier passes 'customer' param
        $user->createOrGetStripeCustomer();

        return $user->newSubscription('default', $priceId)
            ->checkout([
                'success_url' => route('subscription.success', ['locale' => app()->getLocale()]),
                'cancel_url' => route('subscription.cancel', ['locale' => app()->getLocale()]),
            ])
            ->url;
    }

    /**
     * Create a checkout session for a newly registered user.
     * Pre-fills customer_email so user doesn't need to type it again in Stripe.
     */
    public function createCheckoutSessionForNewUser(User $user, string $priceId): string
    {
        // Ensure user has a Stripe ID so Cashier passes 'customer' param
        $user->createOrGetStripeCustomer();

        return $user->newSubscription('default', $priceId)
            ->checkout([
                // 'customer_email' => $user->email, // REMOVED: Conflicts with 'customer' param added by Cashier
                'success_url' => route('subscription.success', ['locale' => app()->getLocale()])
                    . '?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => route('subscription.cancel', ['locale' => app()->getLocale()]),
            ])
            ->url;
    }


    public function getBillingPortalUrl(User $user): string
    {
        return $user->billingPortalUrl(
            route('settings.billing', ['locale' => app()->getLocale()])
        );
    }

    public function cancelSubscription(User $user): bool
    {
        $subscription = $user->subscription('default');

        if (! $subscription) {
            \Illuminate\Support\Facades\Log::warning('Subscription cancellation failed: No subscription found for user ' . $user->id);
            return false;
        }

        try {
            $subscription->cancel();
            \Illuminate\Support\Facades\Log::info('Subscription cancelled for user ' . $user->id);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Subscription cancellation error for user ' . $user->id . ': ' . $e->getMessage());
            throw $e;
        }

        return true;
    }

    public function resumeSubscription(User $user): bool
    {
        $subscription = $user->subscription('default');

        if (! $subscription) {
            return false;
        }

        $subscription->resume();

        return true;
    }

    public function getUserPlanName(User $user): string
    {
        $subscription = $user->subscription('default');

        if (! $subscription || ! $subscription->items->first()) {
            return 'FREE';
        }

        $productId = $subscription->items->first()->stripe_product;

        return $this->stripeProductService->getPlanName($productId);
    }

    public function getUserPlanFeatures(User $user): array
    {
        $subscription = $user->subscription('default');

        if (! $subscription || ! $subscription->items->first()) {
            return config('plans.plans.free.features', []);
        }

        $productId = $subscription->items->first()->stripe_product;
        $planKey = config('plans.product_mapping')[$productId] ?? 'free';

        return config("plans.plans.{$planKey}.features", []);
    }

    /**
     * Get plan limits for user
     */
    public function getUserPlanLimits(User $user): array
    {
        $subscription = $user->subscription('default');

        if (! $subscription || ! $subscription->items->first()) {
            return config('plans.plans.free.limits', []);
        }

        $productId = $subscription->items->first()->stripe_product;
        $planKey = config('plans.product_mapping')[$productId] ?? 'free';

        return config("plans.plans.{$planKey}.limits", []);
    }

    /**
     * Check if user has reached a specific limit
     */
    public function hasReachedLimit(User $user, string $feature): bool
    {
        $limits = $this->getUserPlanLimits($user);
        $limit = $limits[$feature] ?? 0;

        if ($limit === -1) {
            return false; // unlimited
        }

        // Get current usage from PlanUsage
        $usage = PlanUsage::getOrCreateForUser($user);
        $currentUsage = match ($feature) {
            'documents' => $usage->documents_count,
            'models' => $usage->models_count,
            'api_requests' => $usage->api_requests_count,
            'reports' => $usage->reports_count,
            default => 0,
        };

        return $currentUsage >= $limit;
    }

    /**
     * Get usage percentage for a feature
     */
    public function getUsagePercentage(User $user, string $feature): float
    {
        $limits = $this->getUserPlanLimits($user);
        $limit = $limits[$feature] ?? 0;

        if ($limit === -1) {
            return 0; // unlimited
        }

        if ($limit === 0) {
            return 100; // not available
        }

        // Get current usage from PlanUsage
        $usage = PlanUsage::getOrCreateForUser($user);
        $currentUsage = match ($feature) {
            'documents' => $usage->documents_count,
            'models' => $usage->models_count,
            'api_requests' => $usage->api_requests_count,
            'reports' => $usage->reports_count,
            default => 0,
        };

        return min(100, ($currentUsage / $limit) * 100);
    }

    /**
     * Get API usage for current billing period
     */
    private function getApiUsage(User $user): int
    {
        // TODO: Implement API usage tracking
        return 0;
    }

    /**
     * Get complete usage data including percentages
     */
    public function getUsageData(User $user, ?array $planData = null): array
    {
        $planUsage = PlanUsage::getOrCreateForUser($user);
        
        $usage = [
            'documents' => $planUsage->documents_count,
            'models' => $planUsage->models_count,
            'api_requests' => $planUsage->api_requests_count,
            'api_keys' => \App\Models\ApiClient::where('user_id', $user->id)->count(),
        ];

        // If plan data not provided, fetch it
        if ($planData === null) {
            $limits = $this->getUserPlanLimits($user);
        } else {
            $limits = $planData['limits'] ?? [];
        }

        $usagePercentages = [];
        
        foreach ($limits as $limit => $value) {
            // Skip non-numeric limits (like exports array, webhooks boolean)
            if (is_array($value) || is_bool($value)) {
                if ($value === false) {
                    $usagePercentages[$limit] = 100; // not available
                } elseif ($value === true) {
                    $usagePercentages[$limit] = 0; // available
                } else {
                    $usagePercentages[$limit] = 0; // array or other, treat as available
                }

                continue;
            }

            if ($value === -1) {
                $usagePercentages[$limit] = 0; // unlimited
            } elseif ($value === 0) {
                $usagePercentages[$limit] = 100; // not available
            } else {
                // Check if the limit exists in usage array
                $usageValue = isset($usage[$limit]) ? $usage[$limit] : 0;
                $usagePercentages[$limit] = min(100, ($usageValue / $value) * 100);
            }
        }

        return [
            'usage' => $usage,
            'usage_percentages' => $usagePercentages,
        ];
    }
}
