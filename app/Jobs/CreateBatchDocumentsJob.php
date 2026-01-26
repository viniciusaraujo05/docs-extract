<?php

namespace App\Jobs;

use App\Models\DocumentBatch;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class CreateBatchDocumentsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;
    public int $timeout = 120;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public DocumentBatch $batch,
        public User $user,
        public array $filesPaths // Array of temporary file paths
    ) {
        $this->onQueue('default');
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('Creating batch documents', [
            'batch_id' => $this->batch->id,
            'files_count' => count($this->filesPaths),
        ]);

        try {
            foreach ($this->filesPaths as $index => $fileInfo) {
                // Support both new array format and legacy string format (for backward compatibility if queues are running)
                if (is_string($fileInfo)) {
                     $filePath = $fileInfo;
                     // Try to recover original name from temp filename if possible, otherwise use basename
                     // Temp format: batch_{batchId}_{index}_{originalName}
                     $basename = basename($filePath);
                     // Try to strip prefix
                     if (preg_match('/^batch_\d+_\d+_(.+)$/', $basename, $matches)) {
                         $originalName = $matches[1];
                     } else {
                         $originalName = $basename;
                     }
                } else {
                    $filePath = $fileInfo['path'];
                    $originalName = $fileInfo['original_name'];
                }

                $this->createDocument($filePath, $originalName, $index);
            }

            Log::info('Batch documents created successfully', [
                'batch_id' => $this->batch->id,
                'total_documents' => $this->batch->total_documents,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create batch documents', [
                'batch_id' => $this->batch->id,
                'error' => $e->getMessage(),
            ]);

            $this->batch->markAsFailed();
            throw $e;
        }
    }

    /**
     * Create a single document and dispatch processing job.
     */
    private function createDocument(string $tempPath, string $originalFilenameFromAction, int $index): void
    {
        // Get file info from DEFAULT disk
        $originalFilename = $originalFilenameFromAction; // Use the passed original name
        $disk = config('filesystems.default');
        
        $mimeType = Storage::disk($disk)->mimeType($tempPath);
        $fileSize = Storage::disk($disk)->size($tempPath);

        // Generate unique filename
        $filename = $this->user->id . '_' . time() . '_' . $index . '_' . $originalFilename;
        $finalPath = 'documents/' . $filename;

        // Move file to final location on the SAME disk
        // Since we are using the default disk for both temp and final, we can just move it.
        if (Storage::disk($disk)->exists($finalPath)) {
            // Edge case: collision? Should be rare with timestamp and user ID.
            throw new \RuntimeException("File already exists at destination: {$finalPath}");
        }
        
        Storage::disk($disk)->move($tempPath, $finalPath);

        // Determine document type (must match enum: invoice, receipt, custom)
        // We load the relationship to ensure we can access the type name
        $this->batch->loadMissing('documentType');
        
        $rawType = $this->batch->new_type_name ?? $this->batch->documentType?->name ?? 'custom';
        
        // Map user-defined type names to database constraints
        $type = match (strtolower($rawType)) {
            'invoice', 'fatura' => 'invoice',
            'receipt', 'recibo' => 'receipt',
            default => 'custom',
        };

        // Create document record
        $document = $this->user->documents()->create([
            'batch_id' => $this->batch->id,
            'document_type_id' => $this->batch->document_type_id,
            'name' => pathinfo($originalFilename, PATHINFO_FILENAME),
            'original_filename' => $originalFilename,
            'file_path' => $finalPath,
            'mime_type' => $mimeType,
            'file_size' => $fileSize,
            'type' => $type,
            'schema_used' => $this->batch->schema_used,
            'status' => 'pending',
            'storage_disk' => config('filesystems.default'),
        ]);

        Log::info('Document created, dispatching processing job', [
            'document_id' => $document->id,
            'batch_id' => $this->batch->id,
        ]);

        // Dispatch processing job
        ProcessBatchDocumentJob::dispatch($document, $this->batch);
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Create batch documents job failed', [
            'batch_id' => $this->batch->id,
            'error' => $exception->getMessage(),
        ]);

        $this->batch->markAsFailed();

        // Clean up temporary files
        // Clean up temporary files
        // Clean up temporary files
        foreach ($this->filesPaths as $fileInfo) {
            $filePath = is_array($fileInfo) ? $fileInfo['path'] : $fileInfo;
            if (Storage::disk(config('filesystems.default'))->exists($filePath)) {
                Storage::disk(config('filesystems.default'))->delete($filePath);
            }
        }
    }
}
