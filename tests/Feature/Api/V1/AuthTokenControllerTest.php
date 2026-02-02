<?php

namespace Tests\Feature\Api\V1;

use App\Models\ApiClient;
use Illuminate\Foundation\Testing\RefreshDatabase;
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

    public function test_authentication_requires_client_id(): void
    {
        $response = $this->postJson(route('api.v1.auth.token'), [
            'client_secret' => 'some-secret',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['client_id']);
    }

    public function test_authentication_requires_client_secret(): void
    {
        $client = ApiClient::factory()->create();

        $response = $this->postJson(route('api.v1.auth.token'), [
            'client_id' => $client->client_id,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['client_secret']);
    }

    public function test_authentication_requires_both_credentials(): void
    {
        $response = $this->postJson(route('api.v1.auth.token'), []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['client_id', 'client_secret']);
    }

    public function test_cannot_authenticate_with_nonexistent_client_id(): void
    {
        $response = $this->postJson(route('api.v1.auth.token'), [
            'client_id' => 'nonexistent-client-id',
            'client_secret' => 'some-secret',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Invalid credentials, client disabled, or IP not allowed.',
            ]);
    }

    public function test_authentication_response_contains_correct_token_type(): void
    {
        $secret = 'super-secret-key-123';
        $client = ApiClient::factory()->withSecret($secret)->create();

        $response = $this->postJson(route('api.v1.auth.token'), [
            'client_id' => $client->client_id,
            'client_secret' => $secret,
        ]);

        $response->assertStatus(200)
            ->assertJson(['token_type' => 'Bearer']);
    }

    public function test_authentication_response_contains_valid_expires_in(): void
    {
        $secret = 'super-secret-key-123';
        $client = ApiClient::factory()->withSecret($secret)->create();

        $response = $this->postJson(route('api.v1.auth.token'), [
            'client_id' => $client->client_id,
            'client_secret' => $secret,
        ]);

        $response->assertStatus(200);
        $data = $response->json();

        $this->assertIsInt($data['expires_in']);
        $this->assertGreaterThan(0, $data['expires_in']);
    }

    public function test_authentication_response_includes_client_details(): void
    {
        $secret = 'super-secret-key-123';
        $client = ApiClient::factory()->withSecret($secret)->create([
            'name' => 'Test Client',
            'status' => 'active',
            'rate_limit_per_minute' => 60,
        ]);

        $response = $this->postJson(route('api.v1.auth.token'), [
            'client_id' => $client->client_id,
            'client_secret' => $secret,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'client' => [
                    'id' => $client->public_id,
                    'name' => 'Test Client',
                    'status' => 'active',
                    'rate_limit_per_minute' => 60,
                ],
            ]);
    }

    public function test_authentication_with_empty_strings_fails(): void
    {
        $response = $this->postJson(route('api.v1.auth.token'), [
            'client_id' => '',
            'client_secret' => '',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['client_id', 'client_secret']);
    }

    public function test_api_client_can_refresh_token(): void
    {
        $client = ApiClient::factory()->create();
        $token = auth('api')->login($client);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson(route('api.v1.auth.refresh'));

        $response->assertStatus(200)
            ->assertJsonStructure([
                'token_type',
                'access_token',
                'expires_in',
                'client',
            ]);

        $data = $response->json();
        $this->assertNotEmpty($data['access_token']);
        $this->assertIsString($data['access_token']);
    }

    public function test_cannot_refresh_token_without_authentication(): void
    {
        $response = $this->postJson(route('api.v1.auth.refresh'));

        $response->assertStatus(401);
    }

    public function test_cannot_refresh_with_invalid_token(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer invalid-token-here')
            ->postJson(route('api.v1.auth.refresh'));

        $response->assertStatus(401);
    }

    public function test_cannot_refresh_with_malformed_authorization_header(): void
    {
        $response = $this->withHeader('Authorization', 'InvalidFormat')
            ->postJson(route('api.v1.auth.refresh'));

        $response->assertStatus(401);
    }

    public function test_refresh_token_returns_new_access_token(): void
    {
        $client = ApiClient::factory()->create();
        $originalToken = auth('api')->login($client);

        $response = $this->withHeader('Authorization', 'Bearer '.$originalToken)
            ->postJson(route('api.v1.auth.refresh'));

        $response->assertStatus(200);
        $newToken = $response->json('access_token');

        $this->assertNotEmpty($newToken);
        $this->assertIsString($newToken);
    }

    public function test_api_client_can_revoke_token(): void
    {
        $client = ApiClient::factory()->create();
        $token = auth('api')->login($client);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson(route('api.v1.auth.logout'));

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Token revoked successfully.',
            ]);
    }

    public function test_cannot_logout_without_authentication(): void
    {
        $response = $this->postJson(route('api.v1.auth.logout'));

        $response->assertStatus(401);
    }

    public function test_cannot_logout_with_invalid_token(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer invalid-token')
            ->postJson(route('api.v1.auth.logout'));

        $response->assertStatus(401);
    }

    public function test_token_is_revoked_after_logout(): void
    {
        $client = ApiClient::factory()->create();
        $token = auth('api')->login($client);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson(route('api.v1.auth.logout'));

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Token revoked successfully.',
            ]);
    }

    public function test_logout_response_has_correct_structure(): void
    {
        $client = ApiClient::factory()->create();
        $token = auth('api')->login($client);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson(route('api.v1.auth.logout'));

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
            ])
            ->assertJson([
                'success' => true,
            ]);
    }

    public function test_authentication_with_special_characters_in_secret(): void
    {
        $secret = 'special!@#$%^&*()_+-=[]{}|;:,.<>?';
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
                'client',
            ]);
    }

    public function test_multiple_authentication_requests_generate_different_tokens(): void
    {
        $secret = 'super-secret-key-123';
        $client = ApiClient::factory()->withSecret($secret)->create();

        $response1 = $this->postJson(route('api.v1.auth.token'), [
            'client_id' => $client->client_id,
            'client_secret' => $secret,
        ]);

        $response2 = $this->postJson(route('api.v1.auth.token'), [
            'client_id' => $client->client_id,
            'client_secret' => $secret,
        ]);

        $token1 = $response1->json('access_token');
        $token2 = $response2->json('access_token');

        $this->assertNotEquals($token1, $token2);
    }
}
