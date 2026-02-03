<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\StripePlanService;
use App\Services\SubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlanController extends Controller
{
    public function __construct(
        private SubscriptionService $subscriptionService,
        private StripePlanService $stripePlanService
    ) {}

    /**
     * Get all available plans with pricing
     */
    public function index(Request $request): JsonResponse
    {
        $locale = $this->normalizeLocale($request->input('locale', 'en'));

        // Get plans from Stripe with real-time pricing
        // Return as array list
        $plans = array_values($this->stripePlanService->getAllPlans($locale));

        return response()->json($plans);
    }

    /**
     * Get current user's plan and usage
     */
    public function current(Request $request): JsonResponse
    {
        $user = $request->user();
        $subscription = $user->subscription('default');
        $locale = $this->normalizeLocale($request->input('locale', app()->getLocale()));

        $currentPlanKey = 'free';

        if ($subscription && $subscription->active()) {
            $productId = $subscription->items->first()->stripe_product;
            $currentPlanKey = config('plans.product_mapping')[$productId] ?? 'free';
        }

        // Get translated plan data
        $planData = $this->stripePlanService->getPlan($currentPlanKey, $locale);

        // If plan data not found via Stripe service, fallback to config directly but with translation
        if (! $planData) {
            $plans = $this->stripePlanService->getAllPlans($locale);
            $planData = $plans[$currentPlanKey] ?? null;
        }

        // Ensure we still have some data even if fallback failed
        if (! $planData) {
            $planData = config("plans.plans.{$currentPlanKey}");
        }

        // Get usage data from SubscriptionService
        $usageData = $this->subscriptionService->getUsageData($user, $planData);

        return response()->json([
            'current_plan' => $currentPlanKey,
            'plan_data' => $planData,
            'subscription' => $subscription,
            'usage' => $usageData['usage'],
            'usage_percentages' => $usageData['usage_percentages'],
            'next_billing_date' => $subscription?->ends_at?->format('Y-m-d'),
            'is_trial' => $subscription?->onTrial(),
            'is_past_due' => $subscription?->pastDue(),
            'is_canceled' => $subscription?->canceled(),
        ]);
    }

    /**
     * Display billing page
     */
    public function billing(): Response
    {
        return Inertia::render('settings/billing');
    }

    /**
     * Get upcoming invoice
     */
    public function upcomingInvoice(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->subscribed('default')) {
            return response()->json(null);
        }

        try {
            $invoice = $user->upcomingInvoice();

            if (! $invoice) {
                return response()->json(null);
            }

            $amount = $invoice->rawTotal();

            return response()->json([
                'amount' => is_numeric($amount) ? (int) $amount : 0,
                'currency' => strtoupper($invoice->currency),
                'date' => $invoice->date()->format('Y-m-d'),
                'items' => collect($invoice->invoiceItems())->map(function ($item) {
                    return [
                        'description' => $item->description,
                        'amount' => $item->amount,
                        'currency' => strtoupper($item->currency),
                    ];
                })->toArray(),
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get invoice history
     */
    public function invoices(Request $request): JsonResponse
    {
        $user = $request->user();
        $invoices = $user->invoices()->map(function ($invoice) {
            $amount = $invoice->rawTotal();

            return [
                'id' => $invoice->id,
                'amount' => is_numeric($amount) ? (int) $amount : 0,
                'currency' => strtoupper($invoice->currency),
                'date' => $invoice->date()->format('Y-m-d'),
                'status' => $invoice->status,
                'url' => $invoice->hosted_invoice_url,
            ];
        });

        return response()->json($invoices);
    }

    private function normalizeLocale(string $locale): string
    {
        return $locale === 'pt' ? 'pt-BR' : $locale;
    }
}
