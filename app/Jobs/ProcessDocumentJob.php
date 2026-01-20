<?php

namespace App\Jobs;

use App\Models\Document;
use App\Services\DocumentService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessDocumentJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $timeout = 300;

    public int $backoff = 60;

    public function __construct(
        public Document $document
    ) {}

    public function handle(DocumentService $documentService): void
    {
        Log::info('Processing document', ['document_id' => $this->document->id]);

        try {
            $documentService->processDocument($this->document);

            Log::info('Document processed successfully', [
                'document_id' => $this->document->id,
                'status' => $this->document->fresh()->status,
            ]);
        } catch (\App\Exceptions\ExtractionException $e) {
            Log::error('Extraction Logic Failed', [
                'document_id' => $this->document->id,
                'key' => $e->getTranslationKey(),
                'error' => $e->getMessage(),
            ]);
            throw $e;
        } catch (\Exception $e) {
            Log::error('Document processing failed', [
                'document_id' => $this->document->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('Document job failed permanently', [
            'document_id' => $this->document->id,
            'error' => $exception->getMessage(),
        ]);

        $message = $exception instanceof \App\Exceptions\ExtractionException
            ? $exception->getTranslatedMessage()
            : 'Processamento falhou após múltiplas tentativas: '.$exception->getMessage();

        $this->document->markAsFailed($message);
    }
}
