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

    public function checkout(Request $request): RedirectResponse
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

            return redirect()->away($checkoutUrl);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function success(Request $request): Response
    {
        return Inertia::render('Subscription/Success', [
            'session_id' => $request->query('session_id'),
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
