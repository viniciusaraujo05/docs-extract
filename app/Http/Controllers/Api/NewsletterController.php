<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\NewsletterSubscribed;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class NewsletterController extends Controller
{
    public function subscribe(Request $request)
    {
        $request->validate([
            'email' => 'required|email|max:255',
            'locale' => 'nullable|string|max:5',
        ]);

        $email = $request->input('email');
        $locale = $request->input('locale', 'en');

        $subscriber = NewsletterSubscriber::where('email', $email)->first();

        if ($subscriber) {
            if (! $subscriber->is_active) {
                $subscriber->update(['is_active' => true, 'locale' => $locale]);
                Mail::to($email)->send(new NewsletterSubscribed($locale));

                return response()->json(['message' => 'Resubscribed successfully']);
            }

            return response()->json(['message' => 'Already subscribed']);
        }

        NewsletterSubscriber::create([
            'email' => $email,
            'locale' => $locale,
            'is_active' => true,
        ]);

        Mail::to($email)->send(new NewsletterSubscribed($locale));

        return response()->json(['message' => 'Subscribed successfully']);
    }
}
