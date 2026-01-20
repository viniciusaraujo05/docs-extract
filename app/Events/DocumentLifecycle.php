<?php

declare(strict_types=1);

namespace App\Events;

use App\Models\Document;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;

class DocumentLifecycle
{
    use Dispatchable, InteractsWithSockets;

    public string $eventUuid;

    public function __construct(
        public Document $document,
        public string $eventType,
        public ?string $status = null
    ) {
        $this->eventUuid = \Illuminate\Support\Str::uuid()->toString();
        $this->status = $status ?? $document->status;
    }
}
