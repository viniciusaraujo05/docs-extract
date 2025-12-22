<?php

declare(strict_types=1);

namespace App\Actions\Reports;

use App\Models\ReportAnalysis;
use App\Repositories\ReportAnalysisRepository;

/**
 * Action para salvar análise de relatório.
 * 
 * Single Responsibility: Apenas salvar análise no banco de dados.
 */
final class SaveAnalysisAction
{
    public function __construct(
        private readonly ReportAnalysisRepository $reportAnalysisRepository
    ) {
    }

    /**
     * Executa a ação de salvar análise.
     */
    public function execute(
        int $userId,
        int $documentTypeId,
        array $analysisData,
        int $totalDocuments,
        ?string $instructions = null
    ): ReportAnalysis {
        return $this->reportAnalysisRepository->create([
            'user_id' => $userId,
            'document_type_id' => $documentTypeId,
            'instructions' => $instructions,
            'analysis_data' => $analysisData,
            'total_documents' => $totalDocuments,
        ]);
    }
}
