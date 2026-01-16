<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\DocumentLifecycle;
use App\Jobs\SendWebhookJob;
use App\Models\WebhookEndpoint;

class TriggerDocumentWebhooks
{
    public function handle(DocumentLifecycle $event): void
    {
        $document = $event->document;
        $eventType = $event->eventType;
        $status = $event->status;
        $user = $document->user;

        if (! $user) {
            return;
        }

        $webhooks = WebhookEndpoint::where('user_id', $user->id)
            ->where('is_active', true)
            ->get();

        foreach ($webhooks as $webhook) {
            $events = $webhook->events;
            
            if (! empty($events)) {
                $hasMatch = in_array($eventType, $events);
                
                if (!$hasMatch && in_array('document.completed', $events)) {
                    if ($eventType === 'document.updated' && $status === 'completed') {
                        $hasMatch = true;
                    } elseif ($eventType === 'document.created') {
                        $hasMatch = true;
                    }
                }

                if (! $hasMatch) {
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

            SendWebhookJob::dispatch($webhook, $eventType, $payload);
        }
    }
}
