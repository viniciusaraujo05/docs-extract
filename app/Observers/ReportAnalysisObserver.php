<?php

namespace App\Observers;

use App\Models\PlanUsage;
use App\Models\ReportAnalysis;

class ReportAnalysisObserver
{
    /**
     * Handle the ReportAnalysis "created" event.
     */
    public function created(ReportAnalysis $reportAnalysis): void
    {
        // Increment reports count for the user
        $usage = PlanUsage::getOrCreateForUser($reportAnalysis->user);
        $usage->incrementUsage('reports');
    }

    /**
     * Handle the ReportAnalysis "updated" event.
     */
    public function updated(ReportAnalysis $reportAnalysis): void
    {
        //
    }

    /**
     * Handle the ReportAnalysis "deleted" event.
     */
    public function deleted(ReportAnalysis $reportAnalysis): void
    {
        // Optionally decrement count if you want to allow deletion to free up limit
        // Currently keeping it simple - once counted, stays counted
    }
}
