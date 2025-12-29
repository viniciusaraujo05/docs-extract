<?php

namespace App\Services;

use App\Models\ApiClient;
use App\Models\DocumentType;
use App\Models\PlanUsage;
use App\Models\User;
use Illuminate\Support\Facades\DB;

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
        return $user->newSubscription('default', $priceId)
            ->checkout([
                'success_url' => route('subscription.success', ['locale' => app()->getLocale()]),
                'cancel_url' => route('subscription.cancel', ['locale' => app()->getLocale()]),
            ])
            ->url;
    }

    public function getBillingPortalUrl(User $user): string
    {
        return $user->billingPortalUrl(
            route('subscription.index', ['locale' => app()->getLocale()])
        );
    }

    public function cancelSubscription(User $user): bool
    {
        $subscription = $user->subscription('default');

        if (! $subscription) {
            return false;
        }

        $subscription->cancel();

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
        $currentUsage = match($feature) {
            'documents' => $usage->documents_count,
            'models' => $usage->models_count,
            'api_requests' => $usage->api_requests_count,
            'reports' => $usage->reports_count,
            'api_keys' => ApiClient::where('user_id', $user->id)->count(),
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
        $currentUsage = match($feature) {
            'documents' => $usage->documents_count,
            'models' => $usage->models_count,
            'api_requests' => $usage->api_requests_count,
            'reports' => $usage->reports_count,
            'api_keys' => ApiClient::where('user_id', $user->id)->count(),
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
}
