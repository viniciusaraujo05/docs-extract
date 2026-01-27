<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_email_verification_screen_can_be_rendered()
    {
        $user = User::factory()->unverified()->create(['locale' => 'en']);

        $response = $this->actingAs($user)->get(route('locale.verification.notice'));

        $response->assertStatus(200);
    }

    public function test_email_can_be_verified()
    {
        $user = User::factory()->unverified()->create(['locale' => 'en']);

        Event::fake();

        $verificationUrl = URL::temporarySignedRoute(
            'locale.verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)]
        );

        $response = $this->actingAs($user)->get($verificationUrl);

        Event::assertDispatched(Verified::class);
        $this->assertTrue($user->fresh()->hasVerifiedEmail());
        $response->assertStatus(302);
        $this->assertStringContainsString('/dashboard', $response->headers->get('Location'));
        $this->assertStringContainsString('verified=1', $response->headers->get('Location'));
    }

    public function test_email_is_not_verified_with_invalid_hash()
    {
        $user = User::factory()->unverified()->create(['locale' => 'en']);

        $verificationUrl = URL::temporarySignedRoute(
            'locale.verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1('wrong-email')]
        );

        $this->actingAs($user)->get($verificationUrl);

        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    public function test_email_is_not_verified_with_invalid_user_id(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => null,
            'locale' => 'en',
        ]);

        $verificationUrl = URL::temporarySignedRoute(
            'locale.verification.verify',
            now()->addMinutes(60),
            ['id' => 123, 'hash' => sha1($user->email)]
        );

        $this->actingAs($user)->get($verificationUrl);

        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    public function test_verified_user_is_redirected_to_dashboard_from_verification_prompt(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
            'locale' => 'en',
        ]);

        $response = $this->actingAs($user)->get(route('locale.verification.notice'));

        $response->assertStatus(302);
        $this->assertStringContainsString('/dashboard', $response->headers->get('Location'));
    }

    public function test_already_verified_user_visiting_verification_link_is_redirected_without_firing_event_again(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
            'locale' => 'en',
        ]);

        Event::fake();

        $verificationUrl = URL::temporarySignedRoute(
            'locale.verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)]
        );

        $response = $this->actingAs($user)->get($verificationUrl);
        $response->assertStatus(302);
        $this->assertStringContainsString('/dashboard', $response->headers->get('Location'));
        $this->assertStringContainsString('verified=1', $response->headers->get('Location'));

        $this->assertTrue($user->fresh()->hasVerifiedEmail());
        Event::assertNotDispatched(Verified::class);
    }
}
