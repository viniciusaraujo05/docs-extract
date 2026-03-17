<?php

namespace Tests\Feature\Security;

use App\Jobs\SendWebhookJob;
use App\Models\User;
use App\Models\WebhookEndpoint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class WebhookSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_webhook_creation_rejects_insecure_urls(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($user)->post('/api/webhooks', [
            'url' => 'http://127.0.0.1/webhook',
        ]);

        $response->assertSessionHasErrors(['url']);
    }

    public function test_webhook_job_blocks_private_destinations(): void
    {
        Http::fake();

        $webhook = WebhookEndpoint::create([
            'user_id' => User::factory()->create()->id,
            'url' => 'https://127.0.0.1/webhook',
            'secret' => 'secret',
            'is_active' => true,
        ]);

        $job = new SendWebhookJob($webhook, 'document.created', ['id' => 1]);
        $job->handle();

        Http::assertNothingSent();
    }
}
