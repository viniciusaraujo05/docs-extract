<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Symfony\Component\HttpFoundation\Response;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request): Response
    {
        $supportedLocales = config('app.available_locales', ['pt', 'en']);
        $locale = session('locale', config('app.locale', 'pt'));

        // Validate locale against whitelist to prevent injection
        if (!is_string($locale) || !in_array($locale, $supportedLocales, true)) {
            $locale = config('app.locale', 'pt');
        }

        return $request->wantsJson()
            ? new JsonResponse('', 204)
            : redirect()->intended("/{$locale}/dashboard");
    }
}
