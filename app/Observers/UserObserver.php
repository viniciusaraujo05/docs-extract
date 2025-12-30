<?php

namespace App\Observers;

use App\Models\User;
use App\Mail\WelcomeMail;
use App\Mail\SecurityChangeMail;
use Illuminate\Support\Facades\Mail;

class UserObserver
{
    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        // 1. Welcome Email (after confirmation)
        if ($user->wasChanged('email_verified_at') && $user->email_verified_at !== null) {
            Mail::to($user->email)->send(new WelcomeMail());
        }

        // 2. Security Change: Password
        if ($user->wasChanged('password')) {
            Mail::to($user->email)->send(new SecurityChangeMail(__('Password')));
        }

        // 3. Security Change: Email
        if ($user->wasChanged('email')) {
            Mail::to($user->email)->send(new SecurityChangeMail(__('Email')));
        }
    }
}
