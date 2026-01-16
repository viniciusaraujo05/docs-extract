<?php

namespace App\Observers;

use App\Models\Document;
use App\Models\PlanUsage;

class DocumentObserver
{
    public function created(Document $document): void
    {
        if ($document->extracted_data !== null) {
            $usage = PlanUsage::getOrCreateForUser($document->user);
            $usage->incrementUsage('documents');
            
            \App\Events\DocumentLifecycle::dispatch($document, 'document.created', $document->status);
        }
    }

    public function updated(Document $document): void
    {
        $isFirstCompletion = $document->wasChanged('extracted_data') 
            && $document->extracted_data !== null 
            && $document->getOriginal('extracted_data') === null;

        $shouldDispatchWebhook = false;
        $eventType = null;
        
        if ($isFirstCompletion) {
            $shouldDispatchWebhook = true;
            $eventType = 'document.created';
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
            \App\Events\DocumentLifecycle::dispatch($document, $eventType, $document->status);
        }
    }

    public function deleted(Document $document): void
    {
        \App\Events\DocumentLifecycle::dispatch($document, 'document.deleted', $document->status);
    }
}
