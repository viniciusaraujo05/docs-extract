<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\WebhookEndpoint;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendWebhookJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * The maximum number of unhandled exceptions to allow before failing.
     *
     * @var int
     */
    public $maxExceptions = 3;

    /**
     * The number of seconds to wait before retrying the job.
     */
    public function backoff(): array
    {
        return [60, 180, 300];
    }

    public function __construct(
        public WebhookEndpoint $webhookEndpoint,
        public string $event,
        public array $payload
    ) {}

    public function handle(): void
    {
        Log::info('Sending webhook', [
            'webhook_id' => $this->webhookEndpoint->id,
            'url' => $this->webhookEndpoint->url,
            'event' => $this->event,
        ]);

        $payloadJson = json_encode($this->payload);
        $signature = hash_hmac('sha256', $payloadJson, $this->webhookEndpoint->secret);

        $response = Http::timeout(10)
            ->withHeaders([
                'Content-Type' => 'application/json',
                'User-Agent' => 'DOCSET-Webhook/1.0',
                'X-Webhook-Event' => $this->event,
                'X-Webhook-Signature' => $signature,
            ])
            ->post($this->webhookEndpoint->url, $this->payload);

        if ($response->failed()) {
            Log::warning('Webhook delivery failed', [
                'webhook_id' => $this->webhookEndpoint->id,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            $response->throw();
        }

        Log::info('Webhook delivered successfully', [
            'webhook_id' => $this->webhookEndpoint->id,
            'status' => $response->status(),
        ]);
    }
}
