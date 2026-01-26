<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\DocumentBatch;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

final class DocumentBatchRepository
{
    /**
     * Create a new document batch.
     */
    public function create(array $data): DocumentBatch
    {
        return DocumentBatch::create($data);
    }

    /**
     * Find a batch by ID for a specific user.
     */
    public function findForUser(int $batchId, User $user): ?DocumentBatch
    {
        return DocumentBatch::forUser($user)
            ->with(['documents', 'documentType'])
            ->find($batchId);
    }

    /**
     * Get recent batches for a user.
     */
    public function getRecentBatches(User $user, int $limit = 10): Collection
    {
        return DocumentBatch::forUser($user)
            ->with(['documentType'])
            ->recent($limit)
            ->get();
    }

    /**
     * Get batches in progress for a user.
     */
    public function getInProgressBatches(User $user): Collection
    {
        return DocumentBatch::forUser($user)
            ->inProgress()
            ->with(['documentType'])
            ->get();
    }

    /**
     * Update a batch.
     */
    public function update(DocumentBatch $batch, array $data): DocumentBatch
    {
        $batch->update($data);
        
        return $batch->fresh();
    }

    /**
     * Delete a batch.
     */
    public function delete(DocumentBatch $batch): bool
    {
        return $batch->delete();
    }
}
