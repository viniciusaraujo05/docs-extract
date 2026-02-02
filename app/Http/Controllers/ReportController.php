<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Reports\AggregateReportDataAction;
use App\Actions\Reports\AnalyzeReportWithAIAction;
use App\Actions\Reports\ExportReportAction;
use App\Actions\Reports\GetLatestAnalysisAction;
use App\Actions\Reports\SaveAnalysisAction;
use App\Models\DocumentType;
use App\Models\User;
use App\Repositories\DocumentRepository;
use App\Repositories\DocumentTypeRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Controller para gestão de relatórios.
 *
 * Refatorado para usar Repository Pattern e Actions,
 * seguindo princípios SOLID e Clean Code.
 */
final class ReportController extends Controller
{
    public function __construct(
        private readonly DocumentRepository $documentRepository,
        private readonly DocumentTypeRepository $documentTypeRepository,
        private readonly AggregateReportDataAction $aggregateReportDataAction,
        private readonly ExportReportAction $exportReportAction,
        private readonly AnalyzeReportWithAIAction $analyzeReportWithAIAction,
        private readonly GetLatestAnalysisAction $getLatestAnalysisAction,
        private readonly SaveAnalysisAction $saveAnalysisAction,
    ) {}

    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        try {
            $documentTypes = $this->documentTypeRepository->getActiveWithDocumentCount($user->id);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to load dashboard', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Return empty array if query fails
            $documentTypes = collect([]);
        }

        return Inertia::render('reports/index', [
            'documentTypes' => $documentTypes,
        ]);
    }

    public function getData(Request $request, DocumentType $documentType): JsonResponse
    {
        $this->authorize('view', $documentType);

        /** @var User $user */
        $user = $request->user();

        $documents = $this->documentRepository->getCompletedByDocumentType(
            $documentType->id,
            $user->id
        );
        $fields = $documentType->fields ?? [];
        $aggregatedData = $this->aggregateReportDataAction->execute($documents, $fields);

        return response()->json([
            'documentType' => [
                'id' => $documentType->id,
                'name' => $documentType->name,
                'fields' => $fields,
            ],
            'documents' => $documents->map(fn ($doc) => [
                'id' => $doc->id,
                'name' => $doc->name,
                'data' => $doc->extracted_data,
                'created_at' => $doc->created_at?->toISOString(),
            ]),
            'aggregated' => $aggregatedData,
            'totalDocuments' => $documents->count(),
        ]);
    }

    public function export(Request $request, DocumentType $documentType): StreamedResponse
    {
        $this->authorize('view', $documentType);

        /** @var User $user */
        $user = $request->user();

        $documents = $this->documentRepository->getCompletedByDocumentType(
            $documentType->id,
            $user->id
        );
        $fields = $documentType->fields ?? [];
        $filename = $this->exportReportAction->generateFilename($documentType);

        return response()->streamDownload(function () use ($documents, $fields) {
            $handle = fopen('php://output', 'w');
            $this->exportReportAction->writeToHandle($handle, $documents, $fields);
            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * Obtém a última análise IA salva para um tipo de documento.
     */
    public function getLatestAnalysis(Request $request, DocumentType $documentType): JsonResponse
    {
        $this->authorize('view', $documentType);

        /** @var User $user */
        $user = $request->user();

        $result = $this->getLatestAnalysisAction->execute($user->id, $documentType->id);

        return response()->json($result);
    }

    /**
     * Analisa os dados do relatório usando IA.
     */
    public function analyzeWithAI(Request $request, DocumentType $documentType): JsonResponse
    {
        $this->authorize('view', $documentType);

        try {
            /** @var User $user */
            $user = $request->user();
            $instructions = (string) $request->input('instructions', '');
            $documents = $this->documentRepository->getCompletedByDocumentType(
                $documentType->id,
                $user->id
            );
            $fields = $documentType->fields ?? [];
            $aggregatedData = $this->aggregateReportDataAction->execute($documents, $fields);

            $reportData = [
                'totalDocuments' => $documents->count(),
                'aggregated' => $aggregatedData,
            ];

            $analysis = $this->analyzeReportWithAIAction->execute(
                $reportData,
                $documentType->name,
                $instructions !== '' ? $instructions : null,
                $user->locale ?? app()->getLocale()
            );

            // Salvar análise no banco de dados
            $this->saveAnalysisAction->execute(
                userId: $user->id,
                documentTypeId: $documentType->id,
                analysisData: $analysis,
                totalDocuments: $documents->count(),
                instructions: $instructions !== '' ? $instructions : null
            );

            return response()->json([
                'success' => true,
                'analysis' => $analysis,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
