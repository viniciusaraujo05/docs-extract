<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;

class LocaleController extends Controller
{
    /**
     * Change the application locale.
     */
    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'locale' => 'required|string|in:pt,en',
        ]);

        $locale = $request->input('locale');

        // Update session
        Session::put('locale', $locale);

        // Update user preference if authenticated
        if ($request->user()) {
            $request->user()->update(['locale' => $locale]);
        }

        // Set locale for current request
        App::setLocale($locale);

        return response()->json([
            'success' => true,
            'locale' => $locale,
            'message' => __('Language changed successfully'),
        ]);
    }

    /**
     * Get current locale.
     */
    public function current(Request $request): JsonResponse
    {
        return response()->json([
            'locale' => App::getLocale(),
            'available_locales' => config('app.available_locales'),
        ]);
    }
}
