<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CookieConsent
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (!$request->hasCookie('cookie_consent')) {
            $response->withCookie(cookie()->forever('cookie_consent_pending', true));
        }

        return $response;
    }
}
