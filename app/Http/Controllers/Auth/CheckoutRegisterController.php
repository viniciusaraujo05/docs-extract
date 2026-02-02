<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules;

/**
 * Controller for Direct Purchase flow (Flow B).
 * Handles registration with immediate redirect to Stripe Checkout.
 *
 * Note: This controller does NOT trigger the Registered event to avoid
 * email verification redirect. The verification email will be sent
 * after successful payment via webhook.
 */
class CheckoutRegisterController extends Controller
{
    public function __construct(
        private SubscriptionService $subscriptionService
    ) {}

    /**
     * Handle checkout registration.
     * Creates user, logs in, and redirects to Stripe Checkout.
     */
    public function store(Request $request)
    {
        // SECURITY: Do not log sensitive data like emails
        Log::info('CheckoutRegisterController::store called', [
            'price_id' => $request->price_id,
            'has_email' => ! empty($request->email),
        ]);

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'price_id' => ['required', 'string'],
            'plan_name' => ['nullable', 'string'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'locale' => $request->route('locale', app()->getLocale()),
            // email_verified_at stays NULL - user will verify after payment
        ]);

        $user->notify(new \App\Notifications\WelcomeNotification);

        // SECURITY: Log only non-sensitive identifiers
        Log::info('User created for checkout flow', ['user_id' => $user->id]);

        // Dispatch Registered event to trigger email verification immediately
        // event(new \Illuminate\Auth\Events\Registered($user));

        Auth::login($user);
        $request->session()->regenerate();

        // Redirect to internal checkout page (Flow step 2)
        // Pass price_id so the page can initiate the correct subscription
        return redirect()->route('subscription.checkout', [
            'locale' => app()->getLocale(),
            'price_id' => $request->price_id,
            'plan_name' => $request->plan_name,
        ]);
    }
}
