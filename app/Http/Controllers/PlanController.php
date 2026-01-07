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
        // Get locale from request, default to 'en'
        $locale = $request->input('locale', 'en');
        
        // Normalize locale (convert 'pt' to 'pt-BR')
        if ($locale === 'pt') {
            $locale = 'pt-BR';
        }
        
        // Get plans from Stripe with real-time pricing
        $plans = $this->stripePlanService->getAllPlans($locale);
        
        return response()->json($plans);
    }

    /**
     * Get current user's plan and usage
     */
    public function current(Request $request): JsonResponse
    {
        $user = $request->user();
        $subscription = $user->subscription('default');
        
        // Get locale from request or fallback to app locale
        $locale = $request->input('locale', app()->getLocale());
        if ($locale === 'pt') $locale = 'pt-BR';

        $currentPlanKey = 'free';
        
        if ($subscription && $subscription->active()) {
            $productId = $subscription->items->first()->stripe_product;
            $currentPlanKey = config('plans.product_mapping')[$productId] ?? 'free';
        }
        
        // Get translated plan data
        $planData = $this->stripePlanService->getPlan($currentPlanKey, $locale);
        
        // If plan data not found via Stripe service, fallback to config directly but with translation
        if (!$planData) {
            $plans = $this->stripePlanService->getAllPlans($locale);
            $planData = $plans[$currentPlanKey] ?? null;
        }

        // Ensure we still have some data even if fallback failed
        if (!$planData) {
            $planData = config("plans.plans.{$currentPlanKey}");
        }

        // Get usage data from PlanUsage
        $planUsage = PlanUsage::getOrCreateForUser($user);
        $usage = [
            'documents' => $planUsage->documents_count,
            'models' => $planUsage->models_count,
            'api_requests' => $planUsage->api_requests_count,
            'api_keys' => ApiClient::where('user_id', $user->id)->count(),
        ];

        // Calculate usage percentages
        $usagePercentages = [];
        $limits = $planData['limits'] ?? [];
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

        return response()->json([
            'current_plan' => $currentPlanKey,
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
            $amount = $invoice->total();
            
            return response()->json([
                'amount' => is_numeric($amount) ? (int)$amount : 0,
                'currency' => strtoupper($invoice->currency),
                'date' => $invoice->date()->format('F j, Y'),
                'items' => collect($invoice->invoiceItems())->map(function ($item) {
                    return [
                        'description' => $item->description,
                        'amount' => is_numeric($item->total()) ? (int)$item->total() : 0,
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
            $amount = $invoice->total();
            return [
                'id' => $invoice->id,
                'amount' => is_numeric($amount) ? (int)$amount : 0,
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
