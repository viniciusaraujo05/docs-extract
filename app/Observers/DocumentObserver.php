<?php

namespace App\Observers;

use App\Models\Document;
use App\Models\PlanUsage;
use Illuminate\Support\Facades\Log;

class DocumentObserver
{
    public function created(Document $document): void
    {
        Log::info('[OBSERVER] Document created', [
            'timestamp' => now()->toIso8601String(),
            'document_id' => $document->id,
            'status' => $document->status,
            'has_extracted_data' => $document->extracted_data !== null,
        ]);

        if ($document->extracted_data !== null) {
            $usage = PlanUsage::getOrCreateForUser($document->user);
            $usage->incrementUsage('documents', $document->page_count ?? 1);

            Log::info('[OBSERVER] Dispatching document.created event', [
                'timestamp' => now()->toIso8601String(),
                'document_id' => $document->id,
                'event_type' => 'document.created',
                'status' => $document->status,
            ]);

            \App\Events\DocumentLifecycle::dispatch($document, 'document.created', $document->status);
        }
    }

    public function updated(Document $document): void
    {
        $isFirstCompletion = $document->wasChanged('extracted_data')
            && $document->extracted_data !== null
            && $document->getOriginal('extracted_data') === null;

        Log::info('[OBSERVER] Document updated', [
            'timestamp' => now()->toIso8601String(),
            'document_id' => $document->id,
            'status' => $document->status,
            'is_first_completion' => $isFirstCompletion,
            'changed_fields' => array_keys($document->getDirty()),
        ]);

        $shouldDispatchWebhook = false;
        $eventType = null;

        if ($isFirstCompletion) {
            $shouldDispatchWebhook = true;
            $eventType = 'document.created';

            $usage = PlanUsage::getOrCreateForUser($document->user);
            $usage->incrementUsage('documents', $document->page_count ?? 1);
        } elseif ($document->wasChanged('status')) {
            if (in_array($document->status, ['completed', 'failed'])) {
                $shouldDispatchWebhook = true;
                $eventType = 'document.updated';
            }
        } elseif ($document->wasChanged('extracted_data')) {
            $shouldDispatchWebhook = true;
            $eventType = 'document.updated';
        }

        if ($shouldDispatchWebhook) {
            Log::info('[OBSERVER] Dispatching lifecycle event', [
                'timestamp' => now()->toIso8601String(),
                'document_id' => $document->id,
                'event_type' => $eventType,
                'status' => $document->status,
            ]);

            \App\Events\DocumentLifecycle::dispatch($document, $eventType, $document->status);
        } else {
            Log::debug('[OBSERVER] No webhook dispatch needed', [
                'timestamp' => now()->toIso8601String(),
                'document_id' => $document->id,
                'changed_fields' => array_keys($document->getDirty()),
            ]);
        }
    }

    public function deleted(Document $document): void
    {
        Log::info('[OBSERVER] Document deleted', [
            'timestamp' => now()->toIso8601String(),
            'document_id' => $document->id,
            'status' => $document->status,
        ]);

        Log::info('[OBSERVER] Dispatching document.deleted event', [
            'timestamp' => now()->toIso8601String(),
            'document_id' => $document->id,
            'event_type' => 'document.deleted',
        ]);

        \App\Events\DocumentLifecycle::dispatch($document, 'document.deleted', $document->status);
    }
}
