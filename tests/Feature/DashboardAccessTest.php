<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class DashboardAccessTest extends TestCase
{
    use \Illuminate\Foundation\Testing\RefreshDatabase;

    public function test_dashboard_access_via_url()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/en/dashboard');

        $response->assertStatus(200);
    }
}
