<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfAuthenticated
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$guards): Response
    {
        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                $locale = $this->resolveLocale($request);
                return redirect("/{$locale}/dashboard");
            }
        }

        return $next($request);
    }

    private function resolveLocale(Request $request): string
    {
        $supportedLocales = config('app.available_locales', ['pt', 'en']);

        // 1. Check route parameter (highest priority, already validated by route constraint)
        if ($request->route('locale')) {
            $routeLocale = $request->route('locale');
            if (in_array($routeLocale, $supportedLocales, true)) {
                return $routeLocale;
            }
        }

        // 2. Check authenticated user preference (from database, trusted source)
        if ($request->user()?->locale) {
            $userLocale = $request->user()->locale;
            if (in_array($userLocale, $supportedLocales, true)) {
                return $userLocale;
            }
        }

        // 3. Check session (validate to prevent injection)
        if (session()->has('locale')) {
            $sessionLocale = session('locale');
            if (is_string($sessionLocale) && in_array($sessionLocale, $supportedLocales, true)) {
                return $sessionLocale;
            }
        }

        // 4. Fallback to default
        return config('app.locale', 'pt');
    }
}
