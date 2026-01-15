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
    ) {
    }

    public function handle(): void
    {
        Log::info('Sending webhook', [
            'webhook_id' => $this->webhookEndpoint->id,
            'url' => $this->webhookEndpoint->url,
            'event' => $this->event,
        ]);

        try {
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
                $status = $response->status();

                Log::warning('Webhook delivery failed', [
                    'webhook_id' => $this->webhookEndpoint->id,
                    'status' => $status,
                    'body' => $response->body(),
                ]);

                // For rate limit errors (429), just log and don't retry
                if ($status === 429) {
                    Log::warning('Webhook rate limited - skipping', [
                        'webhook_id' => $this->webhookEndpoint->id,
                        'url' => $this->webhookEndpoint->url,
                    ]);
                    return;
                }

                // For other errors (5xx), throw to trigger retry
                if ($status >= 500) {
                    $response->throw();
                }

                // For client errors (4xx except 429), log but don't retry
                return;
            }

            Log::info('Webhook delivered successfully', [
                'webhook_id' => $this->webhookEndpoint->id,
                'status' => $response->status(),
            ]);
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            // Network errors - log and allow retry
            Log::error('Webhook connection failed', [
                'webhook_id' => $this->webhookEndpoint->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        } catch (\Illuminate\Http\Client\RequestException $e) {
            // Request errors - check if retry-able
            Log::error('Webhook request failed', [
                'webhook_id' => $this->webhookEndpoint->id,
                'error' => $e->getMessage(),
            ]);

            // Only rethrow for server errors that should retry
            if ($e->response && $e->response->status() >= 500) {
                throw $e;
            }

            // For rate limits and client errors, just log
            return;
        } catch (\Exception $e) {
            // Unexpected errors - log but don't block document save
            Log::error('Unexpected webhook error', [
                'webhook_id' => $this->webhookEndpoint->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Don't rethrow - allow document save to succeed
            return;
        }
    }
}
