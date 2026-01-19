<?php

namespace App\Http\Controllers;

use App\Mail\PaymentFailedMail;
use App\Mail\PaymentSuccessMail;
use App\Mail\PlanChangedMail;
use App\Mail\SubscriptionCanceledMail;
use Illuminate\Support\Facades\Mail;
use Laravel\Cashier\Http\Controllers\WebhookController as CashierController;

class StripeWebhookController extends CashierController
{
    public function handleCustomerSubscriptionCreated(array $payload)
    {
        // Handle subscription created event
        return parent::handleCustomerSubscriptionCreated($payload);
    }

    public function handleCustomerSubscriptionUpdated(array $payload)
    {
        $response = parent::handleCustomerSubscriptionUpdated($payload);

        $user = $this->getUserByStripeId($payload['data']['object']['customer']);

        if ($user) {
            // Check if plan changed by looking at previous_attributes
            $previousAttributes = $payload['data']['previous_attributes'] ?? [];
            $oldPriceId = null;

            // Check for price change in items (most common for plan changes)
            if (isset($previousAttributes['items']['data'][0]['price']['id'])) {
                $oldPriceId = $previousAttributes['items']['data'][0]['price']['id'];
            }
            // Fallback: check for direct plan change (legacy or specific api versions)
            elseif (isset($previousAttributes['plan']['id'])) {
                $oldPriceId = $previousAttributes['plan']['id'];
            } elseif (isset($previousAttributes['price']['id'])) {
                $oldPriceId = $previousAttributes['price']['id'];
            }

            // Only send email if we detected a price/plan change
            if ($oldPriceId) {
                $locale = $user->locale ?? 'en';
                $planService = app(\App\Services\StripePlanService::class);
                
                // Resolve New Plan Name
                // Cashier has already updated the local DB, so subscription('default')->type gives the NEW plan key (e.g. 'professional')
                $newPlanKey = $user->subscription('default')->type ?? 'default';
                $newPlanName = $newPlanKey; // Fallback
                $newPlanData = $planService->getPlan($newPlanKey, $locale);
                if ($newPlanData) {
                    $newPlanName = $newPlanData['display_name'];
                }

                // Resolve Old Plan Name
                // We have the old Stripe Price ID. We need to find which plan it belongs to.
                // getAllPlans fetches everything. We can search by strip_price_id or just brute force it.
                // Note: StripePlanService maps config keys to names. We need to map Price ID -> Plan Key -> Name.
                $allPlans = $planService->getAllPlans($locale);
                $oldPlanName = 'Previous Plan'; // Fallback
                
                foreach ($allPlans as $plan) {
                    // Check if this plan's price ID matches the old price ID
                    // Note: StripePlanService might return 'price_id' or 'stripe_price_id' depending on implementation details
                    if (($plan['price_id'] ?? '') === $oldPriceId || ($plan['stripe_price_id'] ?? '') === $oldPriceId) {
                        $oldPlanName = $plan['display_name'];
                        break;
                    }
                }
                
                // If we couldn't find it by price ID (maybe it was a legacy price not in current config), try to infer it?
                // For now, if we found a change but can't name the old one, we still send the email but with fallback.
                
                 Mail::to($user->email)->send(new PlanChangedMail($oldPlanName, $newPlanName, $locale));
            }
        }

        return $response;
    }

    public function handleCustomerSubscriptionDeleted(array $payload)
    {
        $response = parent::handleCustomerSubscriptionDeleted($payload);

        $user = $this->getUserByStripeId($payload['data']['object']['customer']);

        if ($user) {
            $locale = $user->locale ?? 'en';
            // Localize date
            $date = now()->locale($locale)->isoFormat('L');
            Mail::to($user->email)->send(new SubscriptionCanceledMail($date, $locale));
        }

        return $response;
    }

    public function handleInvoicePaymentSucceeded(array $payload)
    {
        $user = $this->getUserByStripeId($payload['data']['object']['customer']);

        if ($user) {
            $locale = $user->locale ?? 'en';
            $planService = app(\App\Services\StripePlanService::class);
            
            $planKey = $user->subscription('default')->type ?? 'default';
            $planName = $planKey;
            $planData = $planService->getPlan($planKey, $locale);
            
            if ($planData) {
                $planName = $planData['display_name'];
            }

            $date = now()->locale($locale)->isoFormat('L');
            Mail::to($user->email)->send(new PaymentSuccessMail($planName, $date, $locale));
        }

        return parent::successMethod();
    }

    public function handleInvoicePaymentFailed(array $payload)
    {
        $user = $this->getUserByStripeId($payload['data']['object']['customer']);

        if ($user) {
            Mail::to($user->email)->send(new PaymentFailedMail(7));
        }

        return parent::handleInvoicePaymentFailed($payload);
    }
}
