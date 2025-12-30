<?php

namespace App\Http\Controllers;

use App\Mail\PaymentSuccessMail;
use App\Mail\PaymentFailedMail;
use App\Mail\SubscriptionCanceledMail;
use App\Mail\PlanChangedMail;
use Illuminate\Support\Facades\Mail;
use App\Models\User;
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
            // Check if it was a plan change (upgrade/downgrade)
            // This is a simplified check, in a real scenario you might compare old/new prices
            Mail::to($user->email)->send(new PlanChangedMail('Previous Plan', $user->subscription('default')->type));
        }

        return $response;
    }

    public function handleCustomerSubscriptionDeleted(array $payload)
    {
        $response = parent::handleCustomerSubscriptionDeleted($payload);

        $user = $this->getUserByStripeId($payload['data']['object']['customer']);
        
        if ($user) {
            $date = now()->format('d/m/Y');
            Mail::to($user->email)->send(new SubscriptionCanceledMail($date));
        }

        return $response;
    }

    public function handleInvoicePaymentSucceeded(array $payload)
    {
        $user = $this->getUserByStripeId($payload['data']['object']['customer']);
        
        if ($user) {
            $planName = $user->subscription('default')->type ?? 'Plan';
            $date = now()->format('d/m/Y');
            Mail::to($user->email)->send(new PaymentSuccessMail($planName, $date));
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
