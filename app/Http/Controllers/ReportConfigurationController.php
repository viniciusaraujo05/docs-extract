<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\DocumentType;
use App\Models\ReportConfiguration;
use App\Repositories\DocumentRepository;
use App\Repositories\ReportConfigurationRepository;
use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller para gestão de configurações de relatórios.
 *
 * Refatorado para usar Repository Pattern,
 * seguindo princípios SOLID e Clean Code.
 */
final class ReportConfigurationController extends Controller
{
    public function __construct(
        private readonly ReportConfigurationRepository $reportConfigurationRepository,
        private readonly DocumentRepository $documentRepository,
        private readonly ReportService $reportService,
    ) {
    }

    /**
     * List all configurations for a document type.
     */
    public function index(Request $request, DocumentType $documentType): JsonResponse
    {
        $this->authorize('view', $documentType);

        $configs = $this->reportConfigurationRepository->getAllForUserAndDocumentType(
            $request->user()->id,
            $documentType->id
        );

        return response()->json([
            'configurations' => $configs,
        ]);
    }

    /**
     * Store a new configuration.
     */
    public function store(Request $request, DocumentType $documentType): JsonResponse
    {
        $this->authorize('view', $documentType);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'field_config' => 'required|array',
            'calculated_fields' => 'nullable|array',
            'selection_mode' => 'required|in:all,filtered,manual',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'selected_document_ids' => 'nullable|array',
            'selected_document_ids.*' => 'integer|exists:documents,id',
            'date_grouping' => 'nullable|in:day,month,year',
            'date_field' => 'nullable|string',
        ]);

        $config = $this->reportConfigurationRepository->create([
            'user_id' => $request->user()->id,
            'document_type_id' => $documentType->id,
            ...$validated,
        ]);

        return response()->json([
            'configuration' => $config,
            'message' => 'Configuração criada com sucesso.',
        ], 201);
    }

    /**
     * Update a configuration.
     */
    public function update(Request $request, ReportConfiguration $configuration): JsonResponse
    {
        $this->authorize('update', $configuration);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'field_config' => 'sometimes|required|array',
            'calculated_fields' => 'nullable|array',
            'selection_mode' => 'sometimes|required|in:all,filtered,manual',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'selected_document_ids' => 'nullable|array',
            'selected_document_ids.*' => 'integer|exists:documents,id',
            'date_grouping' => 'nullable|in:day,month,year',
            'date_field' => 'nullable|string',
        ]);

        $this->reportConfigurationRepository->update($configuration, $validated);

        return response()->json([
            'configuration' => $configuration->fresh(),
            'message' => 'Configuração atualizada com sucesso.',
        ]);
    }

    /**
     * Delete a configuration.
     */
    public function destroy(ReportConfiguration $configuration): JsonResponse
    {
        $this->authorize('delete', $configuration);

        $this->reportConfigurationRepository->delete($configuration);

        return response()->json([
            'message' => 'Configuração eliminada com sucesso.',
        ]);
    }

    /**
     * Generate report data based on configuration.
     */
    public function generate(ReportConfiguration $configuration): JsonResponse
    {
        $this->authorize('view', $configuration);

        $data = $this->reportService->generateReport($configuration);

        return response()->json($data);
    }

    /**
     * Preview report with current settings (without saving).
     */
    public function preview(Request $request, DocumentType $documentType): JsonResponse
    {
        $this->authorize('view', $documentType);

        $validated = $request->validate([
            'field_config' => 'required|array',
            'selection_mode' => 'required|in:all,filtered,manual',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'selected_document_ids' => 'nullable|array',
            'date_grouping' => 'nullable|in:day,month,year',
            'date_field' => 'nullable|string',
        ]);

        $data = $this->reportService->generatePreview(
            $documentType,
            $validated['field_config'],
            $validated['selection_mode'],
            $validated['date_from'] ?? null,
            $validated['date_to'] ?? null,
            $validated['selected_document_ids'] ?? null,
            $validated['date_grouping'] ?? null,
            $validated['date_field'] ?? null
        );

        return response()->json($data);
    }

    /**
     * Get documents for manual selection.
     */
    public function documents(Request $request, DocumentType $documentType): JsonResponse
    {
        $this->authorize('view', $documentType);

        $documents = $this->documentRepository->getForManualSelection($documentType->id);

        return response()->json([
            'documents' => $documents->map(fn ($doc) => [
                'id' => $doc->id,
                'name' => $doc->name,
                'filename' => $doc->original_filename,
                'created_at' => $doc->created_at?->format('d/m/Y H:i'),
            ]),
        ]);
    }
}
