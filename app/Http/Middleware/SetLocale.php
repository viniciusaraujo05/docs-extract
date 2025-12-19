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
        
        // If URL doesn't have locale and it's not an API route, redirect to localized URL
        if (!$request->route('locale') && !$request->is('api/*') && !$request->is('/')) {
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
        $supportedLocales = ['pt', 'en'];
        
        // 1. Check URL parameter (highest priority)
        if ($request->route('locale')) {
            $urlLocale = $request->route('locale');
            if (in_array($urlLocale, $supportedLocales)) {
                // Store in session and update user preference
                Session::put('locale', $urlLocale);
                if ($request->user()) {
                    $request->user()->update(['locale' => $urlLocale]);
                }
                return $urlLocale;
            }
        }

        // 2. Check authenticated user preference
        if ($request->user() && $request->user()->locale) {
            $userLocale = $request->user()->locale;
            if (in_array($userLocale, $supportedLocales)) {
                return $userLocale;
            }
        }

        // 3. Check session
        if (Session::has('locale')) {
            $sessionLocale = Session::get('locale');
            if (in_array($sessionLocale, $supportedLocales)) {
                return $sessionLocale;
            }
        }

        // 4. Check browser Accept-Language header
        $browserLocale = $request->getPreferredLanguage($supportedLocales);
        if ($browserLocale && in_array($browserLocale, $supportedLocales)) {
            return $browserLocale;
        }

        // 5. Default to Portuguese
        return 'pt';
    }
}
