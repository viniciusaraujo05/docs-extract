<?php

namespace Tests\Feature\Security;

use App\Models\Document;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DataExposureTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that document endpoint does not expose sensitive user data.
     */
    public function test_document_show_does_not_expose_user_sensitive_data(): void
    {
        // Create two users
        $owner = User::factory()->create([
            'email' => 'owner@example.com',
            'stripe_id' => 'cus_test123',
            'pm_type' => 'card',
            'pm_last_four' => '4242',
            'google_id' => 'google_123',
            'github_id' => 'github_456',
        ]);

        $viewer = User::factory()->create();

        // Create a document owned by the first user
        $document = Document::factory()->create([
            'user_id' => $owner->id,
            'name' => 'Test Document',
        ]);

        // Owner views their own document (web route with JSON request)
        $response = $this->actingAs($owner)
            ->withHeader('Accept', 'application/json')
            ->get("/en/documents/{$document->id}");

        $response->assertStatus(200);

        // Verify sensitive user data is NOT exposed
        $response->assertJsonMissing([
            'stripe_id' => 'cus_test123',
        ]);
        $response->assertJsonMissing([
            'pm_type' => 'card',
        ]);
        $response->assertJsonMissing([
            'pm_last_four' => '4242',
        ]);
        $response->assertJsonMissing([
            'google_id' => 'google_123',
        ]);
        $response->assertJsonMissing([
            'github_id' => 'github_456',
        ]);

        // Verify the response does NOT contain a nested 'user' object with sensitive data
        $json = $response->json();
        $this->assertArrayNotHasKey('user', $json['document'] ?? []);
    }

    /**
     * Test that document endpoint does not expose owner email.
     */
    public function test_document_show_does_not_expose_owner_email(): void
    {
        $owner = User::factory()->create([
            'email' => 'secret@example.com',
        ]);

        $document = Document::factory()->create([
            'user_id' => $owner->id,
        ]);

        $response = $this->actingAs($owner)
            ->withHeader('Accept', 'application/json')
            ->get("/en/documents/{$document->id}");

        $response->assertStatus(200);

        // Email should not be in the response
        $this->assertStringNotContainsString('secret@example.com', $response->getContent());
    }

    /**
     * Test that web document show endpoint does not expose sensitive data.
     */
    public function test_web_document_show_does_not_expose_sensitive_data(): void
    {
        $owner = User::factory()->create([
            'email' => 'owner@example.com',
            'stripe_id' => 'cus_test123',
        ]);

        $document = Document::factory()->create([
            'user_id' => $owner->id,
        ]);

        $response = $this->actingAs($owner)->get("/en/documents/{$document->id}");

        $response->assertStatus(200);

        // Check that Inertia props don't contain sensitive user data
        $page = $response->viewData('page');
        $props = $page['props'];

        // Document should be in props
        $this->assertArrayHasKey('document', $props);

        // But it should NOT have a 'user' relationship with sensitive data
        if (isset($props['document']['user'])) {
            $this->assertArrayNotHasKey('stripe_id', $props['document']['user']);
            $this->assertArrayNotHasKey('pm_type', $props['document']['user']);
            $this->assertArrayNotHasKey('pm_last_four', $props['document']['user']);
            $this->assertArrayNotHasKey('google_id', $props['document']['user']);
            $this->assertArrayNotHasKey('github_id', $props['document']['user']);
        }
    }

    /**
     * Test that User model properly hides sensitive fields.
     */
    public function test_user_model_hides_sensitive_fields(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'stripe_id' => 'cus_test123',
            'pm_type' => 'card',
            'pm_last_four' => '4242',
            'google_id' => 'google_123',
            'github_id' => 'github_456',
            'password' => 'secret',
        ]);

        $array = $user->toArray();

        // These fields should be hidden
        $this->assertArrayNotHasKey('password', $array);
        $this->assertArrayNotHasKey('stripe_id', $array);
        $this->assertArrayNotHasKey('pm_type', $array);
        $this->assertArrayNotHasKey('pm_last_four', $array);
        $this->assertArrayNotHasKey('google_id', $array);
        $this->assertArrayNotHasKey('github_id', $array);
        $this->assertArrayNotHasKey('two_factor_secret', $array);
        $this->assertArrayNotHasKey('two_factor_recovery_codes', $array);
        $this->assertArrayNotHasKey('remember_token', $array);

        // These fields should be visible
        $this->assertArrayHasKey('id', $array);
        $this->assertArrayHasKey('name', $array);
        $this->assertArrayHasKey('email', $array);
    }

    /**
     * Test that JSON serialization of User hides sensitive fields.
     */
    public function test_user_json_serialization_hides_sensitive_fields(): void
    {
        $user = User::factory()->create([
            'stripe_id' => 'cus_test123',
            'pm_type' => 'card',
            'google_id' => 'google_123',
        ]);

        $json = json_encode($user);

        // Sensitive data should NOT be in JSON
        $this->assertStringNotContainsString('cus_test123', $json);
        $this->assertStringNotContainsString('google_123', $json);
        $this->assertStringNotContainsString('pm_type', $json);
    }

    /**
     * Test that other users cannot access documents they don't own.
     */
    public function test_users_cannot_access_other_users_documents(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();

        $document = Document::factory()->create([
            'user_id' => $owner->id,
        ]);

        // Other user tries to access the document
        $response = $this->actingAs($otherUser)->get("/en/documents/{$document->id}");

        // Should be forbidden
        $response->assertStatus(403);
    }

    /**
     * Test that unauthenticated users cannot access documents.
     */
    public function test_unauthenticated_users_cannot_access_documents(): void
    {
        $owner = User::factory()->create();
        $document = Document::factory()->create([
            'user_id' => $owner->id,
        ]);

        // Unauthenticated request
        $response = $this->get("/en/documents/{$document->id}");

        // Should redirect to login
        $response->assertRedirect();
    }
}
