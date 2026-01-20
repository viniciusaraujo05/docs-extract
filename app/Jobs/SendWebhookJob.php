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
        $startTime = now();

        Log::info('[QUEUE] Webhook job started', [
            'timestamp' => $startTime->toIso8601String(),
            'webhook_id' => $this->webhookEndpoint->id,
            'url' => $this->webhookEndpoint->url,
            'event' => $this->event,
            'attempt' => $this->attempts(),
            'max_tries' => $this->tries,
        ]);

        try {
            $payloadJson = json_encode($this->payload);
            $signature = hash_hmac('sha256', $payloadJson, $this->webhookEndpoint->secret);

            Log::info('[QUEUE] Sending HTTP request', [
                'timestamp' => now()->toIso8601String(),
                'webhook_id' => $this->webhookEndpoint->id,
                'url' => $this->webhookEndpoint->url,
                'signature' => substr($signature, 0, 16).'...',
            ]);

            $response = Http::timeout(10)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'User-Agent' => 'DOCSET-Webhook/1.0',
                    'X-Webhook-Event' => $this->event,
                    'X-Webhook-Signature' => $signature,
                ])
                ->post($this->webhookEndpoint->url, $this->payload);

            $duration = now()->diffInMilliseconds($startTime);

            if ($response->failed()) {
                $status = $response->status();

                Log::warning('[QUEUE] Webhook delivery failed', [
                    'timestamp' => now()->toIso8601String(),
                    'webhook_id' => $this->webhookEndpoint->id,
                    'url' => $this->webhookEndpoint->url,
                    'status' => $status,
                    'duration_ms' => $duration,
                    'attempt' => $this->attempts(),
                    'response_body' => substr($response->body(), 0, 500),
                ]);

                // For rate limit errors (429), just log and don't retry
                if ($status === 429) {
                    Log::warning('[QUEUE] Webhook rate limited - skipping retry', [
                        'timestamp' => now()->toIso8601String(),
                        'webhook_id' => $this->webhookEndpoint->id,
                        'url' => $this->webhookEndpoint->url,
                    ]);

                    return;
                }

                // For other errors (5xx), throw to trigger retry
                if ($status >= 500) {
                    Log::warning('[QUEUE] Server error - will retry', [
                        'timestamp' => now()->toIso8601String(),
                        'webhook_id' => $this->webhookEndpoint->id,
                        'status' => $status,
                        'attempt' => $this->attempts(),
                        'remaining_tries' => $this->tries - $this->attempts(),
                    ]);
                    $response->throw();
                }

                // For client errors (4xx except 429), log but don't retry
                Log::warning('[QUEUE] Client error - not retrying', [
                    'timestamp' => now()->toIso8601String(),
                    'webhook_id' => $this->webhookEndpoint->id,
                    'status' => $status,
                ]);

                return;
            }

            Log::info('[QUEUE] Webhook delivered successfully', [
                'timestamp' => now()->toIso8601String(),
                'webhook_id' => $this->webhookEndpoint->id,
                'url' => $this->webhookEndpoint->url,
                'status' => $response->status(),
                'duration_ms' => $duration,
                'attempt' => $this->attempts(),
            ]);
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            $duration = now()->diffInMilliseconds($startTime);

            Log::error('[QUEUE] Webhook connection failed - will retry', [
                'timestamp' => now()->toIso8601String(),
                'webhook_id' => $this->webhookEndpoint->id,
                'url' => $this->webhookEndpoint->url,
                'error' => $e->getMessage(),
                'duration_ms' => $duration,
                'attempt' => $this->attempts(),
                'remaining_tries' => $this->tries - $this->attempts(),
            ]);
            throw $e;
        } catch (\Illuminate\Http\Client\RequestException $e) {
            $duration = now()->diffInMilliseconds($startTime);

            Log::error('[QUEUE] Webhook request failed', [
                'timestamp' => now()->toIso8601String(),
                'webhook_id' => $this->webhookEndpoint->id,
                'url' => $this->webhookEndpoint->url,
                'error' => $e->getMessage(),
                'duration_ms' => $duration,
                'attempt' => $this->attempts(),
            ]);

            // Only rethrow for server errors that should retry
            if ($e->response && $e->response->status() >= 500) {
                Log::warning('[QUEUE] Server error - will retry', [
                    'timestamp' => now()->toIso8601String(),
                    'webhook_id' => $this->webhookEndpoint->id,
                    'remaining_tries' => $this->tries - $this->attempts(),
                ]);
                throw $e;
            }

            Log::warning('[QUEUE] Client error - not retrying', [
                'timestamp' => now()->toIso8601String(),
                'webhook_id' => $this->webhookEndpoint->id,
            ]);

            return;
        } catch (\Exception $e) {
            $duration = now()->diffInMilliseconds($startTime);

            Log::error('[QUEUE] Unexpected webhook error', [
                'timestamp' => now()->toIso8601String(),
                'webhook_id' => $this->webhookEndpoint->id,
                'url' => $this->webhookEndpoint->url,
                'error' => $e->getMessage(),
                'duration_ms' => $duration,
                'attempt' => $this->attempts(),
                'trace' => $e->getTraceAsString(),
            ]);

            return;
        }
    }
}
