<?php

namespace App\Http\Controllers;

use App\Services\SubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function __construct(
        private SubscriptionService $subscriptionService
    ) {}

    public function showCheckout(Request $request): Response
    {
        $priceId = $request->input('price_id');
        $planName = $request->input('plan_name');

        // If plan name is missing, try to resolve it from the price ID
        if (! $planName && $priceId) {
            try {
                $prices = $this->subscriptionService->getActivePrices();
                $price = $prices->firstWhere('id', $priceId);

                if ($price) {
                    $planName = $price['plan_name'];
                }
            } catch (\Exception $e) {
                Log::error('Failed to resolve plan name from price ID: '.$e->getMessage());
            }
        }

        Log::info('Checkout page accessed', [
            'price_id' => $priceId,
            'plan_name' => $planName,
            'all_input' => $request->all(),
        ]);

        return Inertia::render('Subscription/Checkout', [
            'priceId' => $priceId,
            'planName' => $planName,
            'userName' => $request->user()->name,
            'userEmail' => $request->user()->email,
        ]);
    }

    public function checkout(Request $request)
    {
        $priceId = $request->input('price_id');

        if (! $priceId) {
            return redirect()->back()->with('error', 'Price ID is required');
        }

        try {
            $checkoutUrl = $this->subscriptionService->createCheckoutSession(
                $request->user(),
                $priceId
            );

            return \Inertia\Inertia::location($checkoutUrl);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function success(Request $request): Response
    {
        $user = $request->user();
        $planName = $this->subscriptionService->getUserPlanName($user);

        $sessionId = $request->query('session_id');
        $amount = null;
        $currency = null;

        if ($sessionId) {
            try {
                // Ensure Stripe API key is set (Cashier does this, but good to ensure)
                \Stripe\Stripe::setApiKey(config('cashier.secret'));
                
                $session = \Stripe\Checkout\Session::retrieve($sessionId);
                
                // Check if the session belongs to the authenticated user to prevent data leaking
                // We check the customer ID match
                if ($session->customer === $user->stripe_id) {
                     // Stripe amounts are in cents
                    $amount = $session->amount_total / 100;
                    $currency = strtoupper($session->currency);
                }
            } catch (\Exception $e) {
                // Log the error but don't crash the page
                Log::warning('Failed to retrieve Stripe session for conversion tracking: '.$e->getMessage());
            }
        }

        return Inertia::render('Subscription/Success', [
            'session_id' => $sessionId,
            'user_name' => $user->name,
            'plan_name' => $planName,
            'value' => $amount,
            'currency' => $currency,
        ]);
    }

    public function cancel(): Response
    {
        return Inertia::render('Subscription/Cancel');
    }

    public function portal(Request $request): RedirectResponse
    {
        try {
            $url = $this->subscriptionService->getBillingPortalUrl($request->user());

            return redirect()->away($url);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function cancelSubscription(Request $request): JsonResponse
    {
        try {
            $success = $this->subscriptionService->cancelSubscription($request->user());

            if (! $success) {
                return response()->json(['error' => 'No active subscription found'], 404);
            }

            return response()->json(['message' => 'Subscription cancelled successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function resumeSubscription(Request $request): JsonResponse
    {
        try {
            $success = $this->subscriptionService->resumeSubscription($request->user());

            if (! $success) {
                return response()->json(['error' => 'No subscription found'], 404);
            }

            return response()->json(['message' => 'Subscription resumed successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
