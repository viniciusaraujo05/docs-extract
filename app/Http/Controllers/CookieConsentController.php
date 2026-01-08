<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;

class CookieConsentController extends Controller
{
    public function accept(Request $request)
    {
        $preferences = $request->input('preferences', [
            'necessary' => true,
            'analytics' => true,
            'marketing' => false,
        ]);

        Cookie::queue('cookie_consent', json_encode($preferences), 525600); // 1 year
        Cookie::queue(Cookie::forget('cookie_consent_pending'));

        return response()->json(['success' => true]);
    }

    public function reject(Request $request)
    {
        $preferences = [
            'necessary' => true,
            'analytics' => false,
            'marketing' => false,
        ];

        Cookie::queue('cookie_consent', json_encode($preferences), 525600);
        Cookie::queue(Cookie::forget('cookie_consent_pending'));

        return response()->json(['success' => true]);
    }

    public function status(Request $request)
    {
        $consent = $request->cookie('cookie_consent');
        $pending = $request->cookie('cookie_consent_pending');

        return response()->json([
            'hasConsent' => !is_null($consent),
            'pending' => !is_null($pending),
            'preferences' => $consent ? json_decode($consent, true) : null,
        ]);
    }
}
