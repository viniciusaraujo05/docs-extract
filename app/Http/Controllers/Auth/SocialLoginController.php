<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialLoginController extends Controller
{
    /**
     * Redirect the user to the provider authentication page.
     */
    public function redirectToProvider(string $locale, string $provider)
    {
        session(['social_login_locale' => $locale]);
        return Socialite::driver($provider)->redirect();
    }

    /**
     * Obtain the user information from the provider (Localized version).
     * Route parameters: {locale}, {provider}
     */
    public function handleLocalizedProviderCallback(string $locale, string $provider)
    {
        return $this->handleProviderCallback($provider, $locale);
    }

    /**
     * Obtain the user information from the provider.
     */
    public function handleProviderCallback(string $provider, ?string $locale = null)
    {
        if ($locale) {
            app()->setLocale($locale);
        } else {
            $locale = session()->pull('social_login_locale', app()->getLocale());
        }

        try {
            // stateless() is used to avoid InvalidStateException on some configurations
            $socialUser = Socialite::driver($provider)->stateless()->user();
        } catch (\Exception $e) {
            return redirect()->route('locale.login', ['locale' => $locale])
                ->with('status', 'Authentication failed. Please try again.');
        }

        $user = User::where($provider . '_id', $socialUser->getId())
            ->orWhere('email', $socialUser->getEmail())
            ->first();

        if ($user) {
            // Update provider ID and avatar if missing or changed
            $user->update([
                $provider . '_id' => $socialUser->getId(),
                'avatar' => $socialUser->getAvatar(),
                // If user was created via email, mark verified if social provider verified it
                'email_verified_at' => $user->email_verified_at ?? now(),
            ]);
        } else {
            // Create new user
            $user = User::create([
                'name' => $socialUser->getName() ?? $socialUser->getNickname(),
                'email' => $socialUser->getEmail(),
                'password' => bcrypt(Str::random(16)), // Dummy password
                $provider . '_id' => $socialUser->getId(),
                'avatar' => $socialUser->getAvatar(),
                'email_verified_at' => now(),
            ]);
        }

        Auth::login($user);

        return redirect()->route('dashboard', ['locale' => $locale]);
    }
}
