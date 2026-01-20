<?php

namespace Tests\Feature;

use App\Jobs\SendWebhookJob;
use App\Models\Document;
use App\Models\User;
use App\Models\WebhookEndpoint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class WebhookFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_manage_webhooks()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('api.webhooks.store', ['locale' => 'en']), [
            'url' => 'https://example.com/webhook',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('webhook_endpoints', [
            'user_id' => $user->id,
            'url' => 'https://example.com/webhook',
        ]);

        $webhook = WebhookEndpoint::first();

        $response = $this->actingAs($user)->delete(route('api.webhooks.destroy', ['locale' => 'en', 'webhookEndpoint' => $webhook->id]));
        $response->assertRedirect();
        $this->assertDatabaseMissing('webhook_endpoints', ['id' => $webhook->id]);
    }

    public function test_document_creation_triggers_event()
    {
        Event::fake([\App\Events\DocumentLifecycle::class]);

        $document = Document::factory()->create(['status' => 'processing']);

        Event::assertDispatched(\App\Events\DocumentLifecycle::class, function ($event) use ($document) {
            return $event->document->id === $document->id && $event->eventType === 'document.created';
        });
    }

    public function test_document_update_triggers_event()
    {
        Event::fake([\App\Events\DocumentLifecycle::class]);

        $document = Document::factory()->create(['status' => 'processing']);

        $document->update(['status' => 'completed', 'extracted_data' => ['foo' => 'bar']]);

        Event::assertDispatched(\App\Events\DocumentLifecycle::class, function ($event) use ($document) {
            return $event->document->id === $document->id && $event->eventType === 'document.updated';
        });
    }

    public function test_listener_dispatches_job()
    {
        Queue::fake();

        $user = User::factory()->create();
        $webhook = WebhookEndpoint::create([
            'user_id' => $user->id,
            'url' => 'https://example.com/cb',
            'secret' => 'secret',
            'events' => ['document.created'],
            'is_active' => true,
        ]);

        $document = Document::factory()->create([
            'user_id' => $user->id,
            'status' => 'completed',
        ]);

        $event = new \App\Events\DocumentLifecycle($document, 'document.created');
        $listener = new \App\Listeners\TriggerDocumentWebhooks;
        $listener->handle($event);

        Queue::assertPushed(SendWebhookJob::class, function ($job) use ($webhook) {
            return $job->webhookEndpoint->id === $webhook->id && $job->event === 'document.created';
        });
    }

    public function test_job_sends_request_with_correct_signature()
    {
        $user = User::factory()->create();
        $webhook = WebhookEndpoint::create([
            'user_id' => $user->id,
            'url' => 'https://example.com/cb',
            'secret' => 'my-secret',
            'is_active' => true,
        ]);

        \Illuminate\Support\Facades\Http::fake();

        $payload = ['foo' => 'bar'];
        $job = new SendWebhookJob($webhook, 'document.created', $payload);
        $job->handle();

        \Illuminate\Support\Facades\Http::assertSent(function ($request) use ($payload) {
            $expectedSignature = hash_hmac('sha256', json_encode($payload), 'my-secret');

            return $request->url() === 'https://example.com/cb' &&
                   $request->hasHeader('X-Webhook-Signature', $expectedSignature) &&
                   $request->hasHeader('X-Webhook-Event', 'document.created');
        });
    }
}
