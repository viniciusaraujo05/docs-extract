<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Actions\Documents\StoreDocumentAction;
use App\DataTransferObjects\DocumentData;
use App\Enums\HttpResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\UploadDocumentRequest;
use App\Models\ApiClient;
use App\Models\Document;
use App\Models\ExtractionSchema;
use App\Repositories\DocumentRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller para API v1 de documentos.
 * 
 * Endpoints protegidos por JWT para clientes externos.
 */
final class DocumentControllerApi extends Controller
{
    public function __construct(
        private readonly StoreDocumentAction $storeDocumentAction,
        private readonly DocumentRepository $documentRepository,
    ) {
    }

    /**
     * Upload de documento via API.
     * 
     * POST /api/v1/documents
     */
    public function store(UploadDocumentRequest $request): JsonResponse
    {
        /** @var ApiClient $apiClient */
        $apiClient = auth('api')->user();

        $file = $request->file('file');
        $type = $request->input('type', 'custom');
        $documentTypeId = $request->input('document_type_id');
        $schemaJson = $request->input('schema');

        $schema = $schemaJson !== null 
            ? json_decode($schemaJson, true, 512, JSON_THROW_ON_ERROR)
            : $this->getDefaultSchema($type);

        try {
            $document = $this->storeDocumentAction->execute(
                user: $apiClient->user,
                file: $file,
                type: $type,
                documentTypeId: $documentTypeId !== null ? (int) $documentTypeId : null,
                newTypeName: null,
                schema: $schema,
                extractedData: null,
                forceOverwrite: false,
            );

            return response()->json(
                HttpResponse::CREATED->json(
                    data: [
                        'id' => $document->id,
                        'name' => $document->name,
                        'status' => $document->status,
                        'type' => $document->type,
                        'created_at' => $document->created_at?->toISOString(),
                    ],
                    message: 'Document uploaded successfully and queued for processing.'
                ),
                HttpResponse::CREATED->value
            );
        } catch (\Exception $e) {
            return response()->json(
                HttpResponse::INTERNAL_SERVER_ERROR->json(
                    message: 'Failed to upload document.',
                    meta: ['error' => $e->getMessage()]
                ),
                HttpResponse::INTERNAL_SERVER_ERROR->value
            );
        }
    }

    /**
     * Consulta status/resultado de documento.
     * 
     * GET /api/v1/documents/{id}
     */
    public function show(Request $request, string $id): JsonResponse
    {
        /** @var ApiClient $apiClient */
        $apiClient = auth('api')->user();

        $document = $this->documentRepository->findById($id);

        if (! $document || $document->user_id !== $apiClient->user_id) {
            return response()->json(
                HttpResponse::NOT_FOUND->json(
                    message: 'Document not found or access denied.'
                ),
                HttpResponse::NOT_FOUND->value
            );
        }

        return response()->json(
            [
                'data' => [
                    'id' => $document->id,
                    'public_id' => $document->public_id,
                    'name' => $document->name,
                    'document_type' => $document->documentType?->name,
                    'status' => $document->status,
                    'extracted_data' => $document->extracted_data,
                    'created_at' => $document->created_at?->toISOString(),
                ],
            ],
            HttpResponse::OK->value
        );
    }

    /**
     * Lista documentos do cliente.
     * 
     * GET /api/v1/documents
     */
    public function index(Request $request): JsonResponse
    {
        /** @var ApiClient $apiClient */
        $apiClient = auth('api')->user();

        $perPageRaw = $request->query('per_page', '20');
        $perPage = is_numeric($perPageRaw) ? (int) $perPageRaw : 20;
        $perPage = min(max($perPage, 1), 100);

        $result = $this->documentRepository->getPaginatedForUser($apiClient->user, $perPage);
        $paginator = $result['paginator'];

        return response()->json(
            [
                'data' => $result['collection']->map(fn ($doc) => [
                    'id' => $doc->id,
                    'public_id' => $doc->public_id,
                    'name' => $doc->name,
                    'document_type' => $doc->documentType?->name,
                    'status' => $doc->status,
                    'extracted_data' => $doc->extracted_data,
                    'created_at' => $doc->created_at?->toISOString(),
                ])->toArray(),
                'meta' => [
                    'pagination' => [
                        'current_page' => $paginator->currentPage(),
                        'last_page' => $paginator->lastPage(),
                        'per_page' => $paginator->perPage(),
                        'total' => $paginator->total(),
                    ],
                ],
            ],
            HttpResponse::OK->value
        );
    }

    /**
     * Busca documento por nome.
     * 
     * GET /api/v1/documents/search/name?name=invoice
     */
    public function searchByName(Request $request): JsonResponse
    {
        /** @var ApiClient $apiClient */
        $apiClient = auth('api')->user();

        $name = $request->query('name');

        if (!$name) {
            return response()->json(
                HttpResponse::UNPROCESSABLE_ENTITY->json(
                    message: 'The name parameter is required.'
                ),
                HttpResponse::UNPROCESSABLE_ENTITY->value
            );
        }

        $documents = $this->documentRepository->findByName($apiClient->user, (string) $name);

        if (!$documents || $documents->isEmpty()) {
            return response()->json(
                HttpResponse::NOT_FOUND->json(
                    message: 'No documents found with the specified name.'
                ),
                HttpResponse::NOT_FOUND->value
            );
        }

        return response()->json(
            [
                'data' => $documents->map(fn ($doc) => [
                    'id' => $doc->id,
                    'public_id' => $doc->public_id,
                    'name' => $doc->name,
                    'document_type' => $doc->documentType?->name,
                    'status' => $doc->status,
                    'extracted_data' => $doc->extracted_data,
                    'created_at' => $doc->created_at?->toISOString(),
                ])->toArray()
            ],
            HttpResponse::OK->value
        );
    }

    /**
     * Filtra documentos por intervalo de datas.
     * 
     * POST /api/v1/documents/search/date
     */
    public function searchByDate(Request $request): JsonResponse
    {
        /** @var ApiClient $apiClient */
        $apiClient = auth('api')->user();

        $validated = $request->validate([
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $perPage = $validated['per_page'] ?? 20;

        $documents = $this->documentRepository->findByDateRange(
            $apiClient->user,
            $validated['start_date'],
            $validated['end_date'],
            $perPage
        );

        return response()->json(
            [
                'data' => $documents['collection']->map(fn ($doc) => [
                    'id' => $doc->id,
                    'public_id' => $doc->public_id,
                    'name' => $doc->name,
                    'document_type' => $doc->documentType?->name,
                    'status' => $doc->status,
                    'extracted_data' => $doc->extracted_data,
                    'created_at' => $doc->created_at?->toISOString(),
                ])->toArray(),
                'meta' => [
                    'pagination' => [
                        'current_page' => $documents['paginator']->currentPage(),
                        'last_page' => $documents['paginator']->lastPage(),
                        'per_page' => $documents['paginator']->perPage(),
                        'total' => $documents['paginator']->total(),
                    ],
                    'date_range' => [
                        'start_date' => $validated['start_date'],
                        'end_date' => $validated['end_date'],
                    ],
                ]
            ],
            HttpResponse::OK->value
        );
    }

    /**
     * Filtrar documentos com múltiplos critérios opcionais.
     * 
     * GET /api/v1/documents/filter
     * 
     * Query params:
     * - document_type: nome do tipo de documento (opcional)
     * - start_date: data inicial (opcional)
     * - end_date: data final (opcional)
     * - name: nome do documento (busca parcial, opcional)
     */
    public function filter(Request $request): JsonResponse
    {
        /** @var ApiClient $apiClient */
        $apiClient = auth('api')->user();

        $validated = $request->validate([
            'document_type' => ['nullable', 'string', 'max:255'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'name' => ['nullable', 'string', 'max:255'],
        ]);

        $query = Document::query()
            ->where('user_id', $apiClient->user_id);

        // Filtro por tipo de documento
        if (!empty($validated['document_type'])) {
            $query->whereHas('documentType', function ($q) use ($validated) {
                $q->where('name', 'like', '%' . $validated['document_type'] . '%');
            });
        }

        // Filtro por intervalo de datas
        if (!empty($validated['start_date'])) {
            $query->whereDate('created_at', '>=', $validated['start_date']);
        }
        if (!empty($validated['end_date'])) {
            $query->whereDate('created_at', '<=', $validated['end_date']);
        }

        // Filtro por nome do documento
        if (!empty($validated['name'])) {
            $query->where('name', 'like', '%' . $validated['name'] . '%');
        }

        $documents = $query->with('documentType')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(
            [
                'data' => [
                    'documents' => $documents->map(fn ($doc) => [
                        'id' => $doc->id,
                        'public_id' => $doc->public_id,
                        'name' => $doc->name,
                        'document_type' => $doc->documentType?->name,
                        'status' => $doc->status,
                        'extracted_data' => $doc->extracted_data,
                        'created_at' => $doc->created_at?->toISOString(),
                    ]),
                    'total' => $documents->count(),
                    'filters_applied' => array_filter($validated),
                ],
            ],
            HttpResponse::OK->value
        );
    }

    /**
     * @return array{fields: array<mixed>}
     */
    private function getDefaultSchema(string $type): array
    {
        return match ($type) {
            'invoice' => ExtractionSchema::getDefaultInvoiceSchema(),
            'receipt' => ExtractionSchema::getDefaultReceiptSchema(),
            default => ['fields' => []],
        };
    }
}
