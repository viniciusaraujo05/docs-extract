<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class StripePlanService
{
    /**
     * Get all plans with pricing from existing API endpoint
     */
    public function getAllPlans(): array
    {
        /** @var array $plans */
        $plans = Cache::remember('stripe.plans', 3600, function () {
            try {
                // Get prices from existing endpoint
                $response = Http::get(config('app.url') . '/api/stripe/prices');
                $data = $response->json();
                
                if (!$data['success']) {
                    throw new \Exception('Failed to fetch prices');
                }
                
                $prices = collect($data['prices'])->keyBy('product_id');
                
                // Get plans from config and merge with real prices
                $plans = [];
                $planConfig = config('plans.plans');
                
                foreach ($planConfig as $planKey => $config) {
                    if (!isset($config['stripe_product_id'])) {
                        continue;
                    }
                    
                    $price = $prices[$config['stripe_product_id']] ?? null;
                    
                    $plans[$planKey] = [
                        'id' => $planKey,
                        'name' => $config['name'],
                        'description' => $config['tagline'] ?? '',
                        'price' => $price ? $this->formatPrice($price['unit_amount'], $price['currency']) : $config['price'],
                        'price_id' => $price ? $price['id'] : null,
                        'stripe_price_id' => $price ? $price['id'] : null,
                        'stripe_product_id' => $config['stripe_product_id'],
                        'interval' => $price ? $price['interval'] : $config['interval'],
                        'currency' => $price ? strtoupper($price['currency']) : 'EUR',
                        'features' => $config['features'],
                        'limits' => $config['limits'],
                        'color' => $config['color'] ?? 'gray',
                        'recommended' => $config['recommended'] ?? false,
                        'tagline' => $config['tagline'] ?? '',
                    ];
                }
                
                return $plans;
            } catch (\Exception $e) {
                \Log::error("Error fetching plans: " . $e->getMessage());
                
                // Return config plans as fallback
                return $this->getConfigPlans();
            }
        });
        
        return $plans;
    }
    
    /**
     * Get plans from config as fallback
     */
    private function getConfigPlans(): array
    {
        $plans = [];
        $planConfig = config('plans.plans');
        
        foreach ($planConfig as $planKey => $config) {
            $plans[$planKey] = [
                'id' => $planKey,
                'name' => $config['name'],
                'description' => $config['tagline'] ?? '',
                'price' => $config['price'],
                'price_id' => null,
                'stripe_price_id' => null,
                'stripe_product_id' => $config['stripe_product_id'],
                'interval' => $config['interval'],
                'currency' => 'EUR',
                'features' => $config['features'],
                'limits' => $config['limits'],
                'color' => $config['color'] ?? 'gray',
                'recommended' => $config['recommended'] ?? false,
                'tagline' => $config['tagline'] ?? '',
            ];
        }
        
        return $plans;
    }

    /**
     * Get a specific plan by key
     */
    public function getPlan(string $planKey): ?array
    {
        $plans = $this->getAllPlans();
        return $plans[$planKey] ?? null;
    }

    /**
     * Clear the plans cache
     */
    public function clearCache(): void
    {
        Cache::forget('stripe.plans');
    }

    /**
     * Format price from cents to readable format
     */
    private function formatPrice(int $amount, string $currency): string
    {
        $symbols = [
            'USD' => '$',
            'EUR' => '€',
        ];
        
        $symbol = $symbols[strtoupper($currency)] ?? strtoupper($currency) . ' ';
        
        return $symbol . number_format($amount / 100, 2);
    }
}
