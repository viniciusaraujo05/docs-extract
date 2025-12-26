<?php

namespace App\Services;

use Stripe\Stripe;
use Stripe\Price;
use Illuminate\Support\Collection;

class StripeProductService
{
    private array $productMapping;

    public function __construct()
    {
        $this->productMapping = [
            config('stripe-products.products.starter') => 'STARTER',
            config('stripe-products.products.pro') => 'PRO',
            config('stripe-products.products.business') => 'BUSINESS',
        ];

        Stripe::setApiKey(config('cashier.secret'));
    }

    public function getActivePrices(): Collection
    {
        $prices = Price::all([
            'active' => true,
            'expand' => ['data.product'],
        ]);

        return collect($prices->data)
            ->filter(fn($price) => $price->recurring && isset($this->productMapping[$price->product->id]))
            ->map(fn($price) => $this->formatPrice($price))
            ->values();
    }

    public function getPlanName(string $productId): string
    {
        return $this->productMapping[$productId] ?? 'UNKNOWN';
    }

    public function getPlanFeatures(string $productId): array
    {
        return config("stripe-products.features.{$productId}", []);
    }

    private function formatPrice($price): array
    {
        $productId = $price->product->id;
        
        return [
            'id' => $price->id,
            'product_id' => $productId,
            'plan_name' => $this->getPlanName($productId),
            'product_name' => $price->product->name,
            'product_description' => $price->product->description,
            'unit_amount' => $price->unit_amount,
            'currency' => strtoupper($price->currency),
            'recurring' => [
                'interval' => $price->recurring->interval,
                'interval_count' => $price->recurring->interval_count,
            ],
            'metadata' => $price->product->metadata->toArray(),
            'features' => $this->getPlanFeatures($productId),
        ];
    }
}
