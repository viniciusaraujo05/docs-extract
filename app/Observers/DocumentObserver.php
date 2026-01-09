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
        }
    }

    /**
     * Handle the Document "updated" event.
     */
    public function updated(Document $document): void
    {
        // If document was just saved (extracted_data was added), count it
        if ($document->wasChanged('extracted_data') && $document->extracted_data !== null) {
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
        // Optionally decrement count if you want to allow deletion to free up limit
        // Currently keeping it simple - once counted, stays counted
    }
}
