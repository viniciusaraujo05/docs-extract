<?php

namespace App\Console\Commands;

use App\Services\StripePlanService;
use Illuminate\Console\Command;

class ClearPlansCache extends Command
{
    protected $signature = 'plans:clear-cache';

    protected $description = 'Clear the Stripe plans cache';

    public function handle(StripePlanService $stripePlanService): int
    {
        $this->info('Clearing Stripe plans cache...');

        $stripePlanService->clearCache();

        $this->info('Plans cache cleared successfully!');

        return Command::SUCCESS;
    }
}
