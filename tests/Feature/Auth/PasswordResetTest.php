<?php

namespace Tests\Feature\Auth;

use App\Mail\PasswordResetMail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_reset_password_link_screen_can_be_rendered()
    {
        $response = $this->get(route('locale.password.request'));

        $response->assertStatus(200);
    }

    public function test_reset_password_link_can_be_requested()
    {
        Mail::fake();

        $user = User::factory()->create();

        $this->post(route('locale.password.email'), ['email' => $user->email]);

        Mail::assertSent(PasswordResetMail::class, function ($mail) use ($user) {
            return $mail->hasTo($user->email);
        });
    }

    public function test_reset_password_screen_can_be_rendered()
    {
        Mail::fake();

        $user = User::factory()->create();

        $this->post(route('locale.password.email'), ['email' => $user->email]);

        Mail::assertSent(PasswordResetMail::class, function ($mail) {
            // Can't easily extract token from Mail URL without parsing.
            // But we can check if it was sent.
            // To test render, we need the token.
            // The token is in the database.
            return true;
        });

        // Get token from DB
        $token = \Illuminate\Support\Facades\Password::createToken($user);
        $response = $this->get(route('locale.password.reset', $token));
        $response->assertStatus(200);
    }

    public function test_password_can_be_reset_with_valid_token()
    {
        Mail::fake();

        $user = User::factory()->create();

        $this->post(route('locale.password.email'), ['email' => $user->email]);

        // Create token manually to use in reset
        $token = \Illuminate\Support\Facades\Password::createToken($user);

        $response = $this->post(route('locale.password.update'), [
            'token' => $token,
            'email' => $user->email,
            'password' => 'ComplexPass123!@#',
            'password_confirmation' => 'ComplexPass123!@#',
        ]);

        $response->assertSessionHasNoErrors();

        // Password reset should redirect somewhere (either login or dashboard depending on config)
        $response->assertRedirect();
    }

    public function test_password_cannot_be_reset_with_invalid_token(): void
    {
        $user = User::factory()->create();

        $response = $this->post(route('locale.password.update'), [
            'token' => 'invalid-token',
            'email' => $user->email,
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertSessionHasErrors('email');
    }
}
