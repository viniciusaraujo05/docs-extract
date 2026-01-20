<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\DocumentLifecycle;
use App\Jobs\SendWebhookJob;
use App\Models\WebhookEndpoint;
use Illuminate\Support\Facades\Log;

class TriggerDocumentWebhooks
{
    public function handle(DocumentLifecycle $event): void
    {
        $document = $event->document;
        $eventType = $event->eventType;
        $status = $event->status;
        $user = $document->user;

        Log::info('[WEBHOOK] Listener triggered', [
            'timestamp' => now()->toIso8601String(),
            'document_id' => $document->id,
            'event_type' => $eventType,
            'status' => $status,
            'user_id' => $user?->id,
        ]);

        if (! $user) {
            Log::warning('[WEBHOOK] No user found for document, skipping webhooks', [
                'timestamp' => now()->toIso8601String(),
                'document_id' => $document->id,
            ]);

            return;
        }

        $webhooks = WebhookEndpoint::where('user_id', $user->id)
            ->where('is_active', true)
            ->get();

        Log::info('[WEBHOOK] Found active webhooks', [
            'timestamp' => now()->toIso8601String(),
            'user_id' => $user->id,
            'webhook_count' => $webhooks->count(),
        ]);

        foreach ($webhooks as $webhook) {
            $events = $webhook->events;

            if (! empty($events)) {
                $hasMatch = in_array($eventType, $events);

                if (! $hasMatch && in_array('document.completed', $events)) {
                    if ($eventType === 'document.updated' && $status === 'completed') {
                        $hasMatch = true;
                    } elseif ($eventType === 'document.created') {
                        $hasMatch = true;
                    }
                }

                if (! $hasMatch) {
                    Log::debug('[WEBHOOK] Event type not subscribed, skipping', [
                        'timestamp' => now()->toIso8601String(),
                        'webhook_id' => $webhook->id,
                        'webhook_url' => $webhook->url,
                        'event_type' => $eventType,
                        'subscribed_events' => $events,
                    ]);

                    continue;
                }
            }

            $payload = [
                'event' => $eventType,
                'created_at' => now()->toIso8601String(),
                'data' => [
                    'id' => $document->id,
                    'type' => 'document',
                    'status' => $status,
                ],
            ];

            Log::info('[WEBHOOK] Dispatching webhook job', [
                'timestamp' => now()->toIso8601String(),
                'webhook_id' => $webhook->id,
                'webhook_url' => $webhook->url,
                'event_type' => $eventType,
                'document_id' => $document->id,
            ]);

            SendWebhookJob::dispatch($webhook, $eventType, $payload);
        }

        Log::info('[WEBHOOK] Listener completed', [
            'timestamp' => now()->toIso8601String(),
            'document_id' => $document->id,
            'webhooks_dispatched' => $webhooks->count(),
        ]);
    }
}
