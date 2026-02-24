<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectToCanonicalHost
{
    public function handle(Request $request, Closure $next): Response
    {
        $appUrl = config('app.url');
        if (! $appUrl) {
            return $next($request);
        }

        $parsed = parse_url($appUrl);
        $canonicalHost = $parsed['host'] ?? null;
        if (! $canonicalHost) {
            return $next($request);
        }

        $canonicalScheme = $parsed['scheme'] ?? $request->getScheme();
        $canonicalPort = $parsed['port'] ?? null;
        $canonicalAuthority = $canonicalHost.($canonicalPort ? ':'.$canonicalPort : '');

        $currentAuthority = $request->getHttpHost();
        $currentScheme = $request->getScheme();

        if (
            strcasecmp($currentAuthority, $canonicalAuthority) !== 0 ||
            strcasecmp($currentScheme, $canonicalScheme) !== 0
        ) {
            $target = $canonicalScheme.'://'.$canonicalAuthority.$request->getRequestUri();

            return redirect()->to($target, 301);
        }

        return $next($request);
    }
}
