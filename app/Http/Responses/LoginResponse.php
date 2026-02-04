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
        if (! is_string($locale) || ! in_array($locale, $supportedLocales, true)) {
            $locale = config('app.locale', 'pt');
        }

        if ($request->wantsJson()) {
            return new JsonResponse('', 204);
        }

        \Illuminate\Support\Facades\Log::info('LoginResponse Check', [
            'url_intended' => $request->session()->get('url.intended'),
            'session_all' => $request->session()->all(),
        ]);

        // Explicitly check if there is an intended URL (like OAuth authorize)
        // If so, go there. Otherwise, standard dashboard.
        if ($request->session()->has('url.intended')) {
            return redirect()->intended();
        }

        return redirect()->intended("/{$locale}/documents");
    }
}
