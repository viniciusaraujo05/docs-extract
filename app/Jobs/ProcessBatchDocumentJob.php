<?php

namespace App\Jobs;

use App\Models\Document;
use App\Models\DocumentBatch;
use App\Services\DocumentService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessBatchDocumentJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $timeout = 300;

    public int $backoff = 60;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Document $document,
        public DocumentBatch $batch
    ) {
        // Set queue to 'default' for batch processing (lower priority than single documents)
        $this->onQueue('default');
    }

    /**
     * Execute the job.
     */
    public function handle(DocumentService $documentService): void
    {
        // Check if batch was cancelled
        if ($this->batch->fresh()->status === 'cancelled') {
            Log::info('Batch document processing skipped (cancelled)', [
                'document_id' => $this->document->id,
                'batch_id' => $this->batch->id,
            ]);

            // Mark document as cancelled if needed, or just leave as pending/cancelled
            $this->document->update(['status' => 'cancelled']);

            return;
        }

        Log::info('Processing batch document', [
            'document_id' => $this->document->id,
            'batch_id' => $this->batch->id,
        ]);

        try {
            // Mark batch as processing if it's the first document
            if ($this->batch->status === 'pending') {
                $this->batch->markAsProcessing();
            }

            // Process the document
            $documentService->processDocument($this->document);

            // Update batch progress
            $this->batch->incrementProcessed(success: true);

            Log::info('Batch document processed successfully', [
                'document_id' => $this->document->id,
                'batch_id' => $this->batch->id,
                'batch_progress' => $this->batch->getProgress(),
            ]);
        } catch (\App\Exceptions\ExtractionException $e) {
            Log::error('Batch document extraction failed', [
                'document_id' => $this->document->id,
                'batch_id' => $this->batch->id,
                'key' => $e->getTranslationKey(),
                'error' => $e->getMessage(),
            ]);

            // Update batch progress with failure
            $this->batch->incrementProcessed(success: false);

            throw $e;
        } catch (\Exception $e) {
            Log::error('Batch document processing failed', [
                'document_id' => $this->document->id,
                'batch_id' => $this->batch->id,
                'error' => $e->getMessage(),
            ]);

            // Update batch progress with failure
            $this->batch->incrementProcessed(success: false);

            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Batch document job failed permanently', [
            'document_id' => $this->document->id,
            'batch_id' => $this->batch->id,
            'error' => $exception->getMessage(),
        ]);

        $message = $exception instanceof \App\Exceptions\ExtractionException
            ? $exception->getTranslatedMessage()
            : 'Processamento falhou após múltiplas tentativas: '.$exception->getMessage();

        $this->document->markAsFailed($message);
    }
}
