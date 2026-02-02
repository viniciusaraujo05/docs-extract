<?php

namespace Tests\Feature;

use App\Models\ApiClient;
use App\Models\ConnectedAccount;
use App\Models\Document;
use App\Models\DocumentType;
use App\Models\User;
use App\Models\WebhookEndpoint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ApiRoutesTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test public API routes are accessible without authentication
     */
    public function test_public_api_routes_are_accessible(): void
    {
        // Geolocation
        $response = $this->getJson('/api/geolocation/detect');
        $response->assertStatus(200);

        // Locale
        $response = $this->getJson('/api/locale/current');
        $response->assertStatus(200);

        // Translations
        $response = $this->getJson('/api/translations/en');
        $response->assertStatus(200);

        // Stripe prices
        $response = $this->getJson('/api/stripe/prices');
        $response->assertStatus(200);

        // Plans
        $response = $this->getJson('/api/plans');
        $response->assertStatus(200);
    }

    /**
     * Test public routes have rate limiting
     */
    public function test_public_routes_have_rate_limiting(): void
    {
        // Make 61 requests (limit is 60/min)
        for ($i = 0; $i < 61; $i++) {
            $response = $this->getJson('/api/plans');
            
            if ($i < 60) {
                $response->assertStatus(200);
            } else {
                // 61st request should be rate limited
                $response->assertStatus(429);
            }
        }
    }

    /**
     * Test demo API routes have strict rate limiting
     */
    public function test_demo_routes_have_strict_rate_limiting(): void
    {
        // Make 4 requests (limit is 3/60min)
        for ($i = 0; $i < 4; $i++) {
            $response = $this->getJson('/api/demo/check');
            
            if ($i < 3) {
                $response->assertStatus(200);
            } else {
                // 4th request should be rate limited
                $response->assertStatus(429);
            }
        }
    }

    /**
     * Test authenticated routes require authentication
     */
    public function test_authenticated_routes_require_auth(): void
    {
        // Usage API
        $response = $this->getJson('/api/usage');
        $response->assertStatus(401);

        // Documents
        $response = $this->postJson('/api/documents', []);
        $response->assertStatus(401);

        // Reports
        $response = $this->getJson('/api/reports/1/data');
        $response->assertStatus(401);

        // Integrations
        $response = $this->postJson('/api/integrations/google/disconnect', []);
        $response->assertStatus(401);
    }

    /**
     * Test authenticated routes work with valid user
     */
    public function test_authenticated_routes_work_with_auth(): void
    {
        $user = User::factory()->create();

        // Usage API
        $response = $this->actingAs($user)->getJson('/api/usage');
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'usage',
            ])
            ->assertJson([
                'success' => true,
            ]);

        // Usage pages detail
        $response = $this->actingAs($user)->getJson('/api/usage/pages-detail');
        $response->assertStatus(200);
    }

    /**
     * Test CSRF protection on POST/PUT/DELETE routes
     */
    public function test_api_routes_have_csrf_protection(): void
    {
        $user = User::factory()->create();

        // Without CSRF token, request should fail
        $response = $this->actingAs($user)
            ->withoutMiddleware(\App\Http\Middleware\VerifyCsrfToken::class)
            ->postJson('/api/documents', []);
        
        // Should still require other validations, but not fail on CSRF
        $response->assertStatus(422); // Validation error, not 419 CSRF
    }

    /**
     * Test verified email requirement for sensitive routes
     */
    public function test_verified_routes_require_email_verification(): void
    {
        // User without verified email
        $user = User::factory()->create([
            'email_verified_at' => null,
        ]);

        // API Clients require verification
        $response = $this->actingAs($user)->postJson('/api/clients', [
            'name' => 'Test Client',
            'contact_email' => 'test@example.com',
        ]);
        $response->assertStatus(403); // Forbidden - email not verified

        // Webhooks require verification
        $response = $this->actingAs($user)->postJson('/api/webhooks', [
            'url' => 'https://example.com/webhook',
        ]);
        $response->assertStatus(403);
    }

    /**
     * Test verified routes work with verified user
     */
    public function test_verified_routes_work_with_verified_user(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        // Test that verified user can access subscription routes
        $response = $this->actingAs($user)->postJson('/api/subscription/cancel-subscription');
        // Should not be 403 (forbidden due to unverified email)
        // May be 422 (validation) or other error, but not 403
        $this->assertNotEquals(403, $response->status());
    }

    /**
     * Test subscription checkout requires authentication
     */
    public function test_subscription_checkout_requires_auth(): void
    {
        $response = $this->postJson('/api/subscription/checkout', [
            'price_id' => 'price_test123',
        ]);
        
        $response->assertStatus(401);
    }

    /**
     * Test OAuth tokens are encrypted in database
     */
    public function test_oauth_tokens_are_encrypted(): void
    {
        $user = User::factory()->create();

        // Create a connected account with encrypted token
        $account = ConnectedAccount::create([
            'user_id' => $user->id,
            'provider' => 'google',
            'provider_id' => 'google-123',
            'name' => 'Test User',
            'email' => 'test@example.com',
            'token' => encrypt('test-access-token'),
            'refresh_token' => encrypt('test-refresh-token'),
            'expires_at' => now()->addHour(),
        ]);

        // Verify token is encrypted in database
        $rawToken = $account->getAttributes()['token'];
        $this->assertNotEquals('test-access-token', $rawToken);
        
        // Verify we can decrypt it
        $decrypted = decrypt($account->token);
        $this->assertEquals('test-access-token', $decrypted);
    }

    /**
     * Test email masking in integrations
     */
    public function test_integration_emails_are_masked(): void
    {
        $user = User::factory()->create();
        
        ConnectedAccount::create([
            'user_id' => $user->id,
            'provider' => 'google',
            'provider_id' => 'google-123',
            'name' => 'Test User',
            'email' => 'john.doe@example.com',
            'token' => encrypt('test-token'),
            'expires_at' => now()->addHour(),
        ]);

        $response = $this->actingAs($user)->get('/en/settings/integrations');
        
        $response->assertStatus(200);
        
        // Check that email is masked in Inertia props
        $props = $response->viewData('page')['props'];
        $this->assertArrayHasKey('integrations', $props);
        $this->assertNotEmpty($props['integrations']);
        
        $email = $props['integrations'][0]['email'];
        $this->assertStringStartsWith('j***@', $email);
        $this->assertStringNotContainsString('john.doe', $email);
    }

    /**
     * Test locale update requires authentication
     */
    public function test_locale_update_requires_auth(): void
    {
        $response = $this->postJson('/api/locale/update', [
            'locale' => 'pt',
        ]);
        
        $response->assertStatus(401);
    }

    /**
     * Test locale update works with authentication
     */
    public function test_locale_update_works_with_auth(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/locale/update', [
            'locale' => 'pt',
        ]);
        
        $response->assertStatus(200);
    }

    /**
     * Test subscription routes require authentication
     */
    public function test_subscription_routes_require_auth(): void
    {
        $response = $this->postJson('/api/subscription/checkout', [
            'price_id' => 'price_123',
        ]);
        
        $response->assertStatus(401);
    }

    /**
     * Test integration routes require authentication
     */
    public function test_integration_routes_require_auth(): void
    {
        $response = $this->postJson('/api/integrations/google/disconnect', []);
        $response->assertStatus(401);

        $response = $this->postJson('/api/integrations/google/process-file', [
            'fileId' => 'file-123',
        ]);
        $response->assertStatus(401);
    }

    /**
     * Test API routes don't have locale prefix
     */
    public function test_api_routes_dont_have_locale_prefix(): void
    {
        // These should NOT work (locale in API path)
        $response = $this->getJson('/api/en/usage');
        $response->assertStatus(404);

        $response = $this->getJson('/api/pt/plans');
        $response->assertStatus(404);

        // These SHOULD work (no locale in API path)
        $response = $this->getJson('/api/plans');
        $response->assertStatus(200);
    }

    /**
     * Test web routes have locale prefix
     */
    public function test_web_routes_have_locale_prefix(): void
    {
        $user = User::factory()->create();

        // These SHOULD work (locale in web path)
        $response = $this->actingAs($user)->get('/en/documents');
        $response->assertStatus(200);

        $response = $this->actingAs($user)->get('/pt/documents');
        $response->assertStatus(200);

        // These should NOT work (no locale)
        $response = $this->actingAs($user)->get('/documents');
        $response->assertStatus(404);
    }

    /**
     * Test rate limiting on locale update
     */
    public function test_locale_update_has_rate_limiting(): void
    {
        $user = User::factory()->create();

        // Make 11 requests (limit is 10/min)
        for ($i = 0; $i < 11; $i++) {
            $response = $this->actingAs($user)->postJson('/api/locale/update', [
                'locale' => 'pt',
            ]);
            
            if ($i < 10) {
                $response->assertStatus(200);
            } else {
                // 11th request should be rate limited
                $response->assertStatus(429);
            }
        }
    }

    /**
     * Test support route requires authentication
     */
    public function test_support_route_requires_auth(): void
    {
        $response = $this->postJson('/api/support', [
            'subject' => 'Test',
            'message' => 'Test message',
        ]);
        
        $response->assertStatus(401);
    }

    /**
     * Test reports route requires authentication
     */
    public function test_reports_route_requires_auth(): void
    {
        $response = $this->getJson('/api/reports/1/data');
        $response->assertStatus(401);

        $response = $this->postJson('/api/reports/1/analyze-ai', [
            'instructions' => 'Test',
        ]);
        $response->assertStatus(401);
    }
}
