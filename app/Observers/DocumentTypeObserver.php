<?php

namespace App\Observers;

use App\Models\DocumentType;
use App\Models\PlanUsage;

class DocumentTypeObserver
{
    /**
     * Handle the DocumentType "created" event.
     */
    public function created(DocumentType $documentType): void
    {
        // Increment models count for the user
        $usage = PlanUsage::getOrCreateForUser($documentType->user);
        $usage->incrementUsage('models');
    }

    /**
     * Handle the DocumentType "updated" event.
     */
    public function updated(DocumentType $documentType): void
    {
        //
    }

    /**
     * Handle the DocumentType "deleted" event.
     */
    public function deleted(DocumentType $documentType): void
    {
        // Optionally decrement count if you want to allow deletion to free up limit
        // Currently keeping it simple - once counted, stays counted
    }
}
