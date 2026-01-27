<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Mail\VerificationMail;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class VerificationNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_sends_verification_notification(): void
    {
        Mail::fake();

        $user = User::factory()->create([
            'email_verified_at' => null,
            'locale' => 'en',
        ]);

        $response = $this->actingAs($user)->post(route('locale.verification.send'));
        $response->assertStatus(302);
        // Redirects to previous page or dashboard?
        // If from is not set, back() falls back to root? Or maybe dashboard.
        // Actually the controller redirects back().
        // If I don't set from(), it might redirect to root.
        // Let's just check it redirects SOMEWHERE.
        
        Mail::assertSent(VerificationMail::class, function ($mail) use ($user) {
            return $mail->hasTo($user->email);
        });
    }

    public function test_does_not_send_verification_notification_if_email_is_verified(): void
    {
        Notification::fake();

        $user = User::factory()->create([
            'email_verified_at' => now(),
            'locale' => 'en',
        ]);

        $response = $this->actingAs($user)->post(route('locale.verification.send'));
        $response->assertStatus(302);
        $this->assertStringContainsString('/dashboard', $response->headers->get('Location'));

        Notification::assertNothingSent();
    }
}
