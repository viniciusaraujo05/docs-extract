<?php

declare(strict_types=1);

namespace App\Actions\Documents;

use App\Jobs\CreateBatchDocumentsJob;
use App\Models\DocumentBatch;
use App\Models\User;
use App\Repositories\DocumentBatchRepository;
use App\Repositories\DocumentTypeRepository;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * Action to store batch documents.
 *
 * Handles:
 * - Creating batch record
 * - Storing uploaded files temporarily
 * - Creating new document type if needed
 * - Dispatching job to create documents
 */
final readonly class StoreBatchDocumentsAction
{
    public function __construct(
        private DocumentBatchRepository $batchRepository,
        private DocumentTypeRepository $documentTypeRepository,
    ) {}

    public function execute(
        User $user,
        array $files, // Array of UploadedFile
        ?int $documentTypeId,
        ?string $newTypeName,
        array $schema,
    ): DocumentBatch {
        // Create new document type if needed
        if ($documentTypeId === null && !empty($newTypeName) && isset($schema['fields'])) {
            $newDocumentType = $this->documentTypeRepository->create([
                'user_id' => $user->id,
                'name' => $newTypeName,
                'fields' => $schema['fields'],
            ]);
            $documentTypeId = $newDocumentType->id;
        }

        // Create batch record
        $batch = $this->batchRepository->create([
            'user_id' => $user->id,
            'document_type_id' => $documentTypeId,
            'new_type_name' => $newTypeName,
            'schema_used' => $schema,
            'total_documents' => count($files),
            'status' => 'pending',
        ]);

        // Store files temporarily
        $tempPaths = [];
        $documentRepository = app(\App\Repositories\DocumentRepository::class);

        foreach ($files as $index => $file) {
             // Check if document already exists
            if ($documentRepository->existsByNameForUser($file->getClientOriginalName(), $user->id)) {
                // User requested error feedback similar to single upload.
                // Single upload usually prompts for overwrite or fails.
                // In batch, we will fail the request so the user knows which file is duplicated.
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'files' => ["O arquivo '{$file->getClientOriginalName()}' já existe."],
                ]);
            }

            $tempPath = $this->storeTemporarily($file, $user->id, $batch->id, $index);
            $tempPaths[] = [
                'path' => $tempPath,
                'original_name' => $file->getClientOriginalName(),
            ];
        }

        if (empty($tempPaths)) {
             // If all files were duplicates, maybe we should mark batch as 'completed' or 'failed' immediately?
             $batch->update(['status' => 'completed', 'total_documents' => 0]);
             return $batch;
        }
        
        // Update total documents count in case some were skipped
        $batch->update(['total_documents' => count($tempPaths)]);

        // Dispatch job to create documents and process them
        CreateBatchDocumentsJob::dispatch($batch, $user, $tempPaths);

        return $batch;
    }

    /**
     * Store file temporarily before creating document record.
     */
    private function storeTemporarily(UploadedFile $file, int $userId, int $batchId, int $index): string
    {
        $filename = "batch_{$batchId}_{$index}_" . $file->getClientOriginalName();
        $path = $file->storeAs("temp/batches/{$userId}", $filename, 'local');

        if (!$path) {
            throw new \RuntimeException('Failed to store temporary file. Please check storage configuration.');
        }

        return $path;
    }
}
