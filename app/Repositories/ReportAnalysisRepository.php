<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\ReportAnalysis;
use Illuminate\Database\Eloquent\Collection;

/**
 * Repository para análises de relatórios.
 * 
 * Centraliza queries relacionadas a ReportAnalysis,
 * seguindo Repository Pattern.
 */
final class ReportAnalysisRepository
{
    /**
     * Obtém a última análise de um usuário para um tipo de documento.
     */
    public function getLatestForUserAndDocumentType(int $userId, int $documentTypeId): ?ReportAnalysis
    {
        return ReportAnalysis::query()
            ->where('user_id', $userId)
            ->where('document_type_id', $documentTypeId)
            ->latest()
            ->first();
    }

    /**
     * Cria uma nova análise de relatório.
     */
    public function create(array $data): ReportAnalysis
    {
        return ReportAnalysis::create($data);
    }

    /**
     * Obtém todas as análises de um usuário.
     */
    public function getAllForUser(int $userId): Collection
    {
        return ReportAnalysis::query()
            ->where('user_id', $userId)
            ->with('documentType')
            ->latest()
            ->get();
    }

    /**
     * Obtém análises de um tipo de documento específico.
     */
    public function getByDocumentType(int $documentTypeId, int $userId): Collection
    {
        return ReportAnalysis::query()
            ->where('document_type_id', $documentTypeId)
            ->where('user_id', $userId)
            ->latest()
            ->get();
    }

    /**
     * Deleta análises antigas (mais de X dias).
     */
    public function deleteOlderThan(int $days): int
    {
        return ReportAnalysis::query()
            ->where('created_at', '<', now()->subDays($days))
            ->delete();
    }
}
