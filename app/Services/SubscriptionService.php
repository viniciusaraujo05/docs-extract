<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Collection;

class SubscriptionService
{
    public function __construct(
        private StripeProductService $stripeProductService
    ) {}

    public function getUserSubscriptionData(User $user): array
    {
        return [
            'subscription' => $user->subscription('default'),
            'subscriptions' => $user->subscriptions,
            'invoices' => $user->invoices(),
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
        
        if (!$subscription) {
            return false;
        }

        $subscription->cancel();
        return true;
    }

    public function resumeSubscription(User $user): bool
    {
        $subscription = $user->subscription('default');
        
        if (!$subscription) {
            return false;
        }

        $subscription->resume();
        return true;
    }

    public function getUserPlanName(User $user): string
    {
        $subscription = $user->subscription('default');
        
        if (!$subscription || !$subscription->items->first()) {
            return 'FREE';
        }

        $productId = $subscription->items->first()->stripe_product;
        return $this->stripeProductService->getPlanName($productId);
    }

    public function getUserPlanFeatures(User $user): array
    {
        $subscription = $user->subscription('default');
        
        if (!$subscription || !$subscription->items->first()) {
            return config('stripe-products.features.free', []);
        }

        $productId = $subscription->items->first()->stripe_product;
        return $this->stripeProductService->getPlanFeatures($productId);
    }
}
