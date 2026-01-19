<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\SubscriptionService;
use Illuminate\Http\RedirectResponse;
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
        Log::info('CheckoutRegisterController::store called', [
            'email' => $request->email,
            'price_id' => $request->price_id,
        ]);
        
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'price_id' => ['required', 'string'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            // email_verified_at stays NULL - user will verify after payment
        ]);

        Log::info('User created for checkout flow', ['user_id' => $user->id]);

        // NOTE: We do NOT dispatch the Registered event here to avoid
        // triggering email verification flow. The verification email
        // will be sent after successful Stripe payment.

        Auth::login($user);
        $request->session()->regenerate();

        // Redirect to internal checkout page (Flow step 2)
        // Pass price_id so the page can initiate the correct subscription
        return redirect()->route('subscription.checkout', [
            'locale' => app()->getLocale(), 
            'price_id' => $request->price_id
        ]);
    }
}
