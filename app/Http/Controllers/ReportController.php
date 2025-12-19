<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Reports\AggregateReportDataAction;
use App\Actions\Reports\AnalyzeReportWithAIAction;
use App\Actions\Reports\ExportReportAction;
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
    ) {}
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $documentTypes = $this->documentTypeRepository->getActiveWithDocumentCount($user->id);

        return Inertia::render('reports/index', [
            'documentTypes' => $documentTypes,
        ]);
    }

    public function getData(Request $request, DocumentType $documentType): JsonResponse
    {
        $this->authorize('view', $documentType);

        $documents = $this->documentRepository->getCompletedByDocumentType($documentType->id);
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

        $documents = $this->documentRepository->getCompletedByDocumentType($documentType->id);
        $fields = $documentType->fields ?? [];
        $filename = $this->exportReportAction->generateFilename($documentType);

        return response()->streamDownload(function () use ($documents, $fields) {
            $handle = fopen('php://output', 'w');
            
            // Header row
            $headers = ['ID', 'Nome do Documento', 'Data de Criação'];
            foreach ($fields as $field) {
                $headers[] = $field['label'] ?? $field['name'];
            }
            fputcsv($handle, $headers);
            
            // Data rows
            foreach ($documents as $doc) {
                $row = [
                    $doc->id,
                    $doc->name,
                    $doc->created_at?->format('d/m/Y H:i'),
                ];
                
                $extractedData = $doc->extracted_data ?? [];
                foreach ($fields as $field) {
                    $value = $extractedData[$field['name']] ?? '';
                    $row[] = is_array($value) ? json_encode($value) : $value;
                }
                
                fputcsv($handle, $row);
            }
            
            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * Analisa os dados do relatório usando IA.
     */
    public function analyzeWithAI(Request $request, DocumentType $documentType): JsonResponse
    {
        $this->authorize('view', $documentType);

        try {
            $documents = $this->documentRepository->getCompletedByDocumentType($documentType->id);
            $fields = $documentType->fields ?? [];
            $aggregatedData = $this->aggregateReportDataAction->execute($documents, $fields);

            $reportData = [
                'totalDocuments' => $documents->count(),
                'aggregated' => $aggregatedData,
            ];

            $analysis = $this->analyzeReportWithAIAction->execute(
                $reportData,
                $documentType->name
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
