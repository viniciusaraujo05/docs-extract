<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\DocumentLifecycle;
use App\Jobs\SendWebhookJob;
use App\Models\WebhookEndpoint;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class TriggerDocumentWebhooks implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(DocumentLifecycle $event): void
    {
        $document = $event->document;
        $eventType = $event->eventType;
        $status = $event->status;
        $user = $document->user;

        if (! $user) {
            return;
        }

        \Illuminate\Support\Facades\Log::info("Processing DocumentLifecycle event: {$eventType}", [
            'uuid' => $event->eventUuid,
            'document_id' => $document->id,
            'status' => $status,
        ]);

        // Get all active webhooks for the user
        $webhooks = WebhookEndpoint::where('user_id', $user->id)
            ->where('is_active', true)
            ->get();

        foreach ($webhooks as $webhook) {
            // Filter by event type if events are specified in the webhook
            $events = $webhook->events;
            if (! empty($events)) {
                // Backward compatibility: 'document.completed' used to mean "finished processing"
                // mapping to created/updated for now, or just allow it to pass for legacy hooks.
                $hasMatch = in_array($eventType, $events);
                
                if (!$hasMatch && in_array('document.completed', $events)) {
                    // Treat 'document.completed' as matching 'document.updated' where status is completed
                    // Or simply match 'document.created' and 'document.updated' for smoother transition
                    if ($eventType === 'document.updated' && $status === 'completed') {
                        $hasMatch = true;
                    } elseif ($eventType === 'document.created') {
                         // Some users might expect 'created' to be the start of completion flow
                         $hasMatch = true;
                    }
                }

                if (! $hasMatch) {
                    continue;
                }
            }

            // Prepare payload
            $payload = [
                'event' => $eventType,
                'created_at' => now()->toIso8601String(),
                'data' => [
                    'id' => $document->id,
                    'type' => 'document',
                    'status' => $status,
                ],
            ];

            // Dispatch job
            SendWebhookJob::dispatch($webhook, $eventType, $payload);
        }
    }
}
