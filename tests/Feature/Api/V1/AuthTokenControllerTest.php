<?php

namespace Tests\Feature\Api\V1;

use App\Enums\HttpResponse;
use App\Models\ApiClient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class AuthTokenControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_api_client_can_authenticate_with_valid_credentials(): void
    {
        $secret = 'super-secret-key-123';
        $client = ApiClient::factory()->withSecret($secret)->create();

        $response = $this->postJson(route('api.v1.auth.token'), [
            'client_id' => $client->client_id,
            'client_secret' => $secret,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'token_type',
                'access_token',
                'expires_in',
                'client' => [
                    'id',
                    'name',
                    'status',
                    'rate_limit_per_minute',
                ],
            ]);
    }

    public function test_api_client_cannot_authenticate_with_invalid_credentials(): void
    {
        $client = ApiClient::factory()->create();

        $response = $this->postJson(route('api.v1.auth.token'), [
            'client_id' => $client->client_id,
            'client_secret' => 'wrong-secret',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Invalid credentials, client disabled, or IP not allowed.',
            ]);
    }

    public function test_api_client_can_refresh_token(): void
    {
        $client = ApiClient::factory()->create();
        $token = auth('api')->login($client);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson(route('api.v1.auth.refresh'));

        $response->assertStatus(200)
            ->assertJsonStructure([
                'token_type',
                'access_token',
                'expires_in',
            ]);
            
        // Ensure new token is different? strict JWT refresh might return same if within grace period, 
        // but typically it rotates. Let's just assert structure.
    }

    public function test_api_client_can_revoke_token(): void
    {
        $client = ApiClient::factory()->create();
        $token = auth('api')->login($client);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson(route('api.v1.auth.logout'));

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Token revoked successfully.',
            ]);

    }
}
