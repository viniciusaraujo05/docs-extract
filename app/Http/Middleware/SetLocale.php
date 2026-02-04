<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Priority: 1. URL, 2. User preference, 3. Session, 4. Browser, 5. Default
        $locale = $this->determineLocale($request);

        App::setLocale($locale);
        Session::put('locale', $locale);

        // Allow Stripe webhook without locale redirect or session changes
        if ($request->is('stripe/webhook')) {
            return $next($request);
        }

        // Allow SEO files (sitemap, robots) without locale redirect
        if ($request->is('sitemap.xml') || $request->is('robots.txt')) {
            return $next($request);
        }

        // Allow Social Auth Callback and OAuth endpoints without locale redirect
        if ($request->is('auth/*/callback') || 
            $request->is('integrations/*/callback') || 
            $request->is('integrations/*/export') ||
            $request->is('oauth/*') ||
            $request->is('login')) {
            return $next($request);
        }

        // If URL doesn't have locale and it's not an API route, redirect to localized URL
        if (! $request->route('locale') && ! $request->is('api/*') && ! $request->is('/')) {
            $path = $request->path();

            return redirect("/{$locale}/{$path}");
        }

        return $next($request);
    }

    /**
     * Determine locale to use.
     */
    private function determineLocale(Request $request): string
    {
        $supportedLocales = config('app.available_locales', ['pt', 'pt_PT', 'en']);

        // 1. Check URL parameter (highest priority, validated by route constraint)
        if ($request->route('locale')) {
            $urlLocale = $request->route('locale');
            // Strict validation with type check
            if (is_string($urlLocale) && in_array($urlLocale, $supportedLocales, true)) {
                // Store in session and update user preference
                Session::put('locale', $urlLocale);
                if ($request->user()) {
                    $request->user()->update(['locale' => $urlLocale]);
                }

                return $urlLocale;
            }
        }

        // 2. Check authenticated user preference (trusted database source)
        if ($request->user() && $request->user()->locale) {
            $userLocale = $request->user()->locale;
            if (is_string($userLocale) && in_array($userLocale, $supportedLocales, true)) {
                return $userLocale;
            }
        }

        // 3. Check session (validate to prevent tampering)
        if (Session::has('locale')) {
            $sessionLocale = Session::get('locale');
            if (is_string($sessionLocale) && in_array($sessionLocale, $supportedLocales, true)) {
                return $sessionLocale;
            }
        }

        // 4. Check browser Accept-Language header
        $browserLocale = $request->getPreferredLanguage($supportedLocales);
        if ($browserLocale && in_array($browserLocale, $supportedLocales, true)) {
            return $browserLocale;
        }

        // 5. Default to configured locale
        return config('app.locale', 'pt');
    }
}
