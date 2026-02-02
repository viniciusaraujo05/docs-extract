<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware to restrict API domain access to programmatic API calls only.
 * 
 * If a browser tries to access the API domain directly, it will be
 * redirected to the main application domain.
 */
class RestrictApiDomain
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $apiDomain = env('API_DOMAIN');
        
        // Only apply if API_DOMAIN is configured and we're on that domain
        if (!$apiDomain || $request->getHost() !== $apiDomain) {
            return $next($request);
        }

        // Check if this is a browser request (not a programmatic API call)
        if ($this->isBrowserRequest($request)) {
            // Redirect to main app domain
            $mainDomain = parse_url(config('app.url'), PHP_URL_HOST);
            $redirectUrl = 'https://' . $mainDomain;
            
            return redirect($redirectUrl);
        }

        return $next($request);
    }

    /**
     * Determine if the request is coming from a browser.
     */
    protected function isBrowserRequest(Request $request): bool
    {
        // If request has Authorization header with Bearer token, it's likely an API call
        if ($request->hasHeader('Authorization') && 
            str_starts_with($request->header('Authorization'), 'Bearer ')) {
            return false;
        }

        // Check Accept header - browsers typically send text/html
        $accept = $request->header('Accept', '');
        if (str_contains($accept, 'text/html')) {
            return true;
        }

        // Check for common browser User-Agents
        $userAgent = $request->header('User-Agent', '');
        $browserPatterns = [
            'Mozilla',
            'Chrome',
            'Safari',
            'Firefox',
            'Edge',
            'Opera',
        ];

        foreach ($browserPatterns as $pattern) {
            if (str_contains($userAgent, $pattern)) {
                // But if it's explicitly requesting JSON, it's probably an API client
                if (str_contains($accept, 'application/json')) {
                    return false;
                }
                return true;
            }
        }

        return false;
    }
}
