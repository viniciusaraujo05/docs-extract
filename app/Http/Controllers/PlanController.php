<?php

namespace App\Http\Controllers;

use App\Models\ApiClient;
use App\Models\DocumentType;
use App\Models\PlanUsage;
use App\Models\User;
use App\Services\StripePlanService;
use App\Services\SubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Cashier\Subscription;

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
        // Get plans from Stripe with real-time pricing
        $plans = $this->stripePlanService->getAllPlans();
        
        return response()->json($plans);
    }

    /**
     * Get current user's plan and usage
     */
    public function current(Request $request): JsonResponse
    {
        $user = $request->user();
        $subscription = $user->subscription('default');
        
        $currentPlan = 'free';
        $planData = config('plans.plans.free');
        
        if ($subscription && $subscription->active()) {
            $productId = $subscription->items->first()->stripe_product;
            $planKey = config('plans.product_mapping')[$productId] ?? 'free';
            $currentPlan = $planKey;
            $planData = config("plans.plans.{$planKey}");
        }
        
        // Ensure planData exists
        if (!$planData) {
            $planData = config('plans.plans.free');
        }

        // Get usage data from PlanUsage
        $planUsage = PlanUsage::getOrCreateForUser($user);
        $usage = [
            'documents' => $planUsage->documents_count,
            'models' => $planUsage->models_count,
            'api_requests' => $planUsage->api_requests_count,
            'api_keys' => ApiClient::where('user_id', $user->id)->count(),
        ];
        
        // Debug log
        \Log::info('Plan data for user ' . $user->id, [
            'plan' => $currentPlan,
            'planData' => $planData,
            'usage' => $usage
        ]);

        // Calculate usage percentages
        $usagePercentages = [];
        foreach ($planData['limits'] as $limit => $value) {
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

        return response()->json([
            'current_plan' => $currentPlan,
            'plan_data' => $planData,
            'subscription' => $subscription,
            'usage' => $usage,
            'usage_percentages' => $usagePercentages,
            'next_billing_date' => $subscription?->ends_at?->format('F j, Y'),
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
        
        if (!$user->subscribed('default')) {
            return response()->json(null);
        }

        try {
            $invoice = $user->upcomingInvoice();
            return response()->json([
                'amount' => $invoice->total(),
                'currency' => strtoupper($invoice->currency),
                'date' => $invoice->date()->format('F j, Y'),
                'items' => collect($invoice->invoiceItems())->map(function ($item) {
                    return [
                        'description' => $item->description,
                        'amount' => $item->total(),
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
            return [
                'id' => $invoice->id,
                'amount' => $invoice->total(),
                'currency' => strtoupper($invoice->currency),
                'date' => $invoice->date()->format('F j, Y'),
                'status' => $invoice->status,
                'url' => $invoice->hosted_invoice_url,
            ];
        });

        return response()->json($invoices);
    }

    /**
     * Get API usage for current billing period
     */
    private function getApiUsage($user): int
    {
        // TODO: Implement API usage tracking
        // This could be stored in a usage_logs table or cached
        return 0;
    }
}
