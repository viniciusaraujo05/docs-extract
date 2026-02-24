<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectToCanonicalHost
{
    public function handle(Request $request, Closure $next): Response
    {
        $normalizePath = in_array($request->getMethod(), ['GET', 'HEAD'], true);
        $normalizedPath = $request->getPathInfo();
        if ($normalizePath && $normalizedPath !== '/' && str_ends_with($normalizedPath, '/')) {
            $normalizedPath = rtrim($normalizedPath, '/');
        }

        $appUrl = config('app.url');
        if (! $appUrl) {
            if ($normalizedPath !== $request->getPathInfo()) {
                return redirect()->to($this->buildTargetUrl($request, $normalizedPath), 301);
            }

            return $next($request);
        }

        $parsed = parse_url($appUrl);
        $canonicalHost = $parsed['host'] ?? null;
        if (! $canonicalHost) {
            if ($normalizedPath !== $request->getPathInfo()) {
                return redirect()->to($this->buildTargetUrl($request, $normalizedPath), 301);
            }

            return $next($request);
        }

        $canonicalScheme = $parsed['scheme'] ?? $request->getScheme();
        $canonicalPort = $parsed['port'] ?? null;
        $canonicalAuthority = $canonicalHost.($canonicalPort ? ':'.$canonicalPort : '');

        $currentAuthority = $request->getHttpHost();
        $currentScheme = $request->getScheme();

        if (
            strcasecmp($currentAuthority, $canonicalAuthority) !== 0 ||
            strcasecmp($currentScheme, $canonicalScheme) !== 0 ||
            $normalizedPath !== $request->getPathInfo()
        ) {
            $target = $canonicalScheme.'://'.$canonicalAuthority.$normalizedPath;
            $queryString = $request->getQueryString();
            if ($queryString) {
                $target .= '?'.$queryString;
            }

            return redirect()->to($target, 301);
        }

        return $next($request);
    }

    private function buildTargetUrl(Request $request, string $path): string
    {
        $target = $request->getSchemeAndHttpHost().$path;
        $queryString = $request->getQueryString();

        if ($queryString) {
            $target .= '?'.$queryString;
        }

        return $target;
    }
}
