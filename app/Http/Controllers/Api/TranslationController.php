<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TranslationCacheService;
use Illuminate\Http\JsonResponse;

class TranslationController extends Controller
{
    public function __construct(
        private readonly TranslationCacheService $translationCache
    ) {}

    /**
     * Get translations for a specific locale from Redis cache.
     */
    public function show(string $locale): JsonResponse
    {
        $supportedLocales = config('app.available_locales', ['pt', 'en']);

        if (!in_array($locale, $supportedLocales)) {
            return response()->json([
                'error' => 'Unsupported locale',
                'supported' => $supportedLocales,
            ], 400);
        }

        $translations = $this->translationCache->get($locale);

        return response()->json([
            'locale' => $locale,
            'translations' => $translations,
        ]);
    }
}
