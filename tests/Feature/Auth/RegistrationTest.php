<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered()
    {
        $response = $this->get(route('locale.register'));

        $response->assertStatus(200);
    }

    public function test_new_users_can_register()
    {
        $response = $this->post(route('locale.register.store'), [
            'name' => 'Test User',
            'email' => 'test_user_123@gmail.com',
            'password' => 'ComplexPass123!@#',
            'password_confirmation' => 'ComplexPass123!@#',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertAuthenticated();

        $response->assertStatus(302);
        // Using manual check for locale-agnostic redirect
        $this->assertStringContainsString('/dashboard', $response->headers->get('Location'));
    }
}
