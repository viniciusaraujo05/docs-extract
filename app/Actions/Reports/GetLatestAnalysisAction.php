<?php

declare(strict_types=1);

namespace App\Actions\Reports;

use App\Repositories\ReportAnalysisRepository;

/**
 * Action para obter a última análise de relatório.
 *
 * Single Responsibility: Apenas buscar e formatar a última análise.
 */
final class GetLatestAnalysisAction
{
    public function __construct(
        private readonly ReportAnalysisRepository $reportAnalysisRepository
    ) {}

    /**
     * Executa a ação de obter a última análise.
     *
     * @return array{success: bool, has_analysis: bool, analysis?: array, instructions?: string|null, created_at?: string}
     */
    public function execute(int $userId, int $documentTypeId): array
    {
        $latestAnalysis = $this->reportAnalysisRepository->getLatestForUserAndDocumentType(
            $userId,
            $documentTypeId
        );

        if (! $latestAnalysis) {
            return [
                'success' => true,
                'has_analysis' => false,
            ];
        }

        return [
            'success' => true,
            'has_analysis' => true,
            'analysis' => $latestAnalysis->analysis_data,
            'instructions' => $latestAnalysis->instructions,
            'created_at' => $latestAnalysis->created_at->toISOString(),
        ];
    }
}
