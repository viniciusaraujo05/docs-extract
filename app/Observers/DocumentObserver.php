<?php

namespace App\Observers;

use App\Models\Document;
use App\Models\PlanUsage;

class DocumentObserver
{
    /**
     * Handle the Document "created" event.
     */
    public function created(Document $document): void
    {
        // Only increment document count if document has extracted_data (was saved)
        // Don't count documents that are just uploaded but not saved yet
        if ($document->extracted_data !== null) {
            $usage = PlanUsage::getOrCreateForUser($document->user);
            $usage->incrementUsage('documents');
            
            // Dispatch webhook event only when document is created with extracted_data
            // (e.g., when uploaded with pre-extracted data)
            \App\Events\DocumentLifecycle::dispatch($document, 'document.created', $document->status);
        }
    }

    /**
     * Handle the Document "updated" event.
     */
    public function updated(Document $document): void
    {
        // Check if this is the first time extracted_data is being added (document completion)
        $isFirstCompletion = $document->wasChanged('extracted_data') 
            && $document->extracted_data !== null 
            && $document->getOriginal('extracted_data') === null;

        // Don't dispatch webhook for intermediate 'processing' status
        // Only dispatch for meaningful state changes (created/completed/failed)
        $shouldDispatchWebhook = false;
        
        if ($isFirstCompletion) {
            // First completion - dispatch 'document.created'
            $shouldDispatchWebhook = true;
            $eventType = 'document.created';
        } elseif ($document->wasChanged('status')) {
            $newStatus = $document->status;
            $oldStatus = $document->getOriginal('status');
            
            // Only dispatch webhook for final states (completed/failed), not intermediate (processing)
            if (in_array($newStatus, ['completed', 'failed'])) {
                $shouldDispatchWebhook = true;
                $eventType = 'document.updated';
            }
        } elseif ($document->wasChanged('extracted_data') && !$isFirstCompletion) {
            // Data was updated (not first time) - dispatch update
            $shouldDispatchWebhook = true;
            $eventType = 'document.updated';
        }
        
        if ($shouldDispatchWebhook) {
            \App\Events\DocumentLifecycle::dispatch($document, $eventType, $document->status);
        }

        // If document was just saved (extracted_data was added), count it
        if ($isFirstCompletion) {
            $usage = PlanUsage::getOrCreateForUser($document->user);
            $usage->incrementUsage('documents');
        }

        // If document was processed successfully, count as API request
        if ($document->wasChanged('status') && $document->status === 'completed') {
            $usage = PlanUsage::getOrCreateForUser($document->user);
            $usage->incrementUsage('api_requests');
        }
    }

    /**
     * Handle the Document "deleted" event.
     */
    public function deleted(Document $document): void
    {
        // Dispatch webhook event
        \App\Events\DocumentLifecycle::dispatch($document, 'document.deleted', $document->status);
    }
}
