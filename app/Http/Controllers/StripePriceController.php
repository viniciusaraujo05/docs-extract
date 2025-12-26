<?php

namespace App\Http\Controllers;

use App\Services\StripeProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StripePriceController extends Controller
{
    public function __construct(
        private StripeProductService $stripeProductService
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $prices = $this->stripeProductService->getActivePrices();

            return response()->json([
                'prices' => $prices,
                'success' => true,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'success' => false,
            ], 500);
        }
    }
}
