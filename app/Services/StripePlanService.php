<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class StripePlanService
{
    /**
     * Get all plans with pricing from existing API endpoint
     */
    public function getAllPlans(string $locale = 'en'): array
    {
        $cacheKey = "stripe_plans_{$locale}";

        // Try to get from cache first
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        try {
            // Get prices from Stripe API directly
            $stripeProductService = app(\App\Services\StripeProductService::class);
            $stripePrices = $stripeProductService->getActivePrices()->keyBy('product_id');

            // Get plans from config and merge with real prices
            $plans = [];
            $planConfig = config('plans.plans');

            foreach ($planConfig as $planKey => $config) {
                $stripeProductId = $config['stripe_product_id'] ?? null;

                // Skip if no stripe product ID
                if (! $stripeProductId) {
                    continue;
                }

                $price = $stripePrices[$stripeProductId] ?? null;

                // Get translated values based on locale
                $displayName = $this->getTranslatedValue($config['display_name'] ?? [], $locale, $config['name']);
                $tagline = $this->getTranslatedValue($config['tagline'] ?? [], $locale, '');
                $features = $this->getTranslatedValue($config['features'] ?? [], $locale, []);

                $plans[$planKey] = [
                    'id' => $planKey,
                    'name' => $config['name'],
                    'display_name' => $displayName,
                    'description' => $tagline,
                    'price' => $price ? ($price['unit_amount'] / 100) : null,
                    'price_id' => $price ? $price['id'] : null,
                    'stripe_price_id' => $price ? $price['id'] : null,
                    'stripe_product_id' => $stripeProductId,
                    'interval' => $price ? $price['recurring']['interval'] : null,
                    'currency' => $price ? strtoupper($price['currency']) : 'EUR',
                    'unit_amount' => $price ? $price['unit_amount'] : 0,
                    'recurring' => $price ? $price['recurring'] : null,
                    'features' => $features,
                    'limits' => $config['limits'],
                    'color' => $config['color'] ?? 'gray',
                    'recommended' => $config['recommended'] ?? false,
                    'is_popular' => $config['recommended'] ?? false,
                    'tagline' => $tagline,
                ];
            }

            // Only cache if successful
            Cache::put($cacheKey, $plans, now()->addDay());

            return $plans;
        } catch (\Exception $e) {
            Log::error('Error fetching plans from Stripe: '.$e->getMessage());

            // Return config plans as fallback WITHOUT caching the error state
            return $this->getConfigPlans($locale);
        }
    }

    /**
     * Get plans from config as fallback
     */
    private function getConfigPlans(string $locale = 'en'): array
    {
        $plans = [];
        $planConfig = config('plans.plans');

        foreach ($planConfig as $planKey => $config) {
            // Get translated values based on locale
            $displayName = $this->getTranslatedValue($config['display_name'] ?? [], $locale, $config['name']);
            $tagline = $this->getTranslatedValue($config['tagline'] ?? [], $locale, '');
            $features = $this->getTranslatedValue($config['features'] ?? [], $locale, []);

            $plans[$planKey] = [
                'id' => $planKey,
                'name' => $config['name'],
                'display_name' => $displayName,
                'description' => $tagline,
                'price' => null,
                'price_id' => null,
                'stripe_price_id' => null,
                'stripe_product_id' => $config['stripe_product_id'],
                'interval' => null,
                'currency' => 'EUR',
                'features' => $features,
                'limits' => $config['limits'],
                'color' => $config['color'] ?? 'gray',
                'recommended' => $config['recommended'] ?? false,
                'tagline' => $tagline,
            ];
        }

        return $plans;
    }

    /**
     * Get translated value from config array based on locale
     */
    private function getTranslatedValue(array $translations, string $locale, $default)
    {
        // Try exact locale match
        if (isset($translations[$locale])) {
            return $translations[$locale];
        }

        // Try base locale (e.g., 'pt' from 'pt-BR')
        $baseLocale = explode('-', $locale)[0];
        if (isset($translations[$baseLocale])) {
            return $translations[$baseLocale];
        }

        // Try pt-BR as fallback for pt
        if ($baseLocale === 'pt' && isset($translations['pt-BR'])) {
            return $translations['pt-BR'];
        }

        // Fallback to English
        if (isset($translations['en'])) {
            return $translations['en'];
        }

        return $default;
    }

    /**
     * Get a specific plan by key
     */
    public function getPlan(string $planKey, string $locale = 'en'): ?array
    {
        $plans = $this->getAllPlans($locale);

        return $plans[$planKey] ?? null;
    }

    /**
     * Clear the plans cache
     */
    public function clearCache(): void
    {
        $locales = ['en', 'pt-BR', 'pt-PT', 'pt', 'es', 'fr', 'de'];

        foreach ($locales as $locale) {
            Cache::forget("stripe_plans_{$locale}");
        }
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

        $symbol = $symbols[strtoupper($currency)] ?? strtoupper($currency).' ';

        return $symbol.number_format($amount / 100, 2);
    }
}
