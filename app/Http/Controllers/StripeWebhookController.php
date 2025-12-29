<?php

namespace App\Http\Controllers;

use Laravel\Cashier\Http\Controllers\WebhookController as CashierController;

class StripeWebhookController extends CashierController
{
    public function handleCustomerSubscriptionCreated(array $payload)
    {
        // Handle subscription created event
        // You can add custom logic here

        return parent::handleCustomerSubscriptionCreated($payload);
    }

    public function handleCustomerSubscriptionUpdated(array $payload)
    {
        // Handle subscription updated event
        // You can add custom logic here

        return parent::handleCustomerSubscriptionUpdated($payload);
    }

    public function handleCustomerSubscriptionDeleted(array $payload)
    {
        // Handle subscription deleted event
        // You can add custom logic here

        return parent::handleCustomerSubscriptionDeleted($payload);
    }

    public function handleInvoicePaymentSucceeded(array $payload)
    {
        // Handle successful payment
        // You can add custom logic here like sending emails

        // No need to call parent since Cashier doesn't have this method by default
        return parent::successMethod();
    }

    public function handleInvoicePaymentFailed(array $payload)
    {
        // Handle failed payment
        // You can add custom logic here like notifying the user

        return parent::handleInvoicePaymentFailed($payload);
    }
}
