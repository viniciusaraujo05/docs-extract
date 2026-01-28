<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Actions\DocumentTypes\StoreDocumentTypeAction;
use App\Actions\DocumentTypes\UpdateDocumentTypeAction;
use App\Enums\HttpResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreDocumentTypeRequest;
use App\Models\ApiClient;
use App\Repositories\DocumentTypeRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller API v1 para gestão de tipos de documentos (modelos).
 *
 * Endpoints protegidos por JWT para clientes externos.
 */
final class DocumentTypeControllerApi extends Controller
{
    public function __construct(
        private readonly DocumentTypeRepository $documentTypeRepository,
        private readonly StoreDocumentTypeAction $storeDocumentTypeAction,
        private readonly UpdateDocumentTypeAction $updateDocumentTypeAction,
    ) {}

    /**
     * Lista todos os tipos de documentos do usuário.
     *
     * GET /api/v1/document-types
     */
    public function index(): JsonResponse
    {
        /** @var ApiClient $apiClient */
        $apiClient = auth('api')->user();

        $documentTypes = $this->documentTypeRepository->getAllForUser($apiClient->user_id);

        return response()->json(
            HttpResponse::OK->json(
                data: $documentTypes->map(fn ($type) => [
                    'id' => $type->id,
                    'name' => $type->name,
                    'description' => $type->description,
                    'fields' => $type->fields,
                    'created_at' => $type->created_at?->toISOString(),
                ])->values()->toArray(),
                message: 'Document types retrieved successfully.'
            ),
            HttpResponse::OK->value
        );
    }

    /**
     * Cria um novo tipo de documento.
     *
     * POST /api/v1/document-types
     */
    public function store(StoreDocumentTypeRequest $request): JsonResponse
    {
        /** @var ApiClient $apiClient */
        $apiClient = auth('api')->user();

        try {
            $documentType = $this->storeDocumentTypeAction->execute(
                userId: $apiClient->user_id,
                name: $request->input('name'),
                description: $request->input('description'),
                fields: $request->input('fields'),
            );

            return response()->json(
                HttpResponse::CREATED->json(
                    data: [
                        'id' => $documentType->id,
                        'name' => $documentType->name,
                        'description' => $documentType->description,
                        'fields' => $documentType->fields,
                        'created_at' => $documentType->created_at?->toISOString(),
                    ],
                    message: 'Document type created successfully.'
                ),
                HttpResponse::CREATED->value
            );
        } catch (\Exception $e) {
            return response()->json(
                HttpResponse::INTERNAL_SERVER_ERROR->json(
                    message: 'Failed to create document type.',
                    meta: ['error' => $e->getMessage()]
                ),
                HttpResponse::INTERNAL_SERVER_ERROR->value
            );
        }
    }

    /**
     * Exibe um tipo de documento específico.
     *
     * GET /api/v1/document-types/{id}
     */
    public function show(int $id): JsonResponse
    {
        /** @var ApiClient $apiClient */
        $apiClient = auth('api')->user();

        $documentType = $this->documentTypeRepository->findById($id);

        if (! $documentType || $documentType->user_id !== $apiClient->user_id) {
            return response()->json(
                HttpResponse::NOT_FOUND->json(
                    message: 'Document type not found.'
                ),
                HttpResponse::NOT_FOUND->value
            );
        }

        return response()->json(
            HttpResponse::OK->json(
                data: [
                    'id' => $documentType->id,
                    'name' => $documentType->name,
                    'description' => $documentType->description,
                    'fields' => $documentType->fields,
                    'created_at' => $documentType->created_at?->toISOString(),
                ],
                message: 'Document type retrieved successfully.'
            ),
            HttpResponse::OK->value
        );
    }

    /**
     * Atualiza um tipo de documento.
     *
     * PUT /api/v1/document-types/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        /** @var ApiClient $apiClient */
        $apiClient = auth('api')->user();

        $documentType = $this->documentTypeRepository->findById($id);

        if (! $documentType || $documentType->user_id !== $apiClient->user_id) {
            return response()->json(
                HttpResponse::NOT_FOUND->json(
                    message: 'Document type not found.'
                ),
                HttpResponse::NOT_FOUND->value
            );
        }

        try {
            $validated = $request->validate([
                'name' => ['sometimes', 'string', 'max:255'],
                'description' => ['nullable', 'string', 'max:1000'],
                'fields' => ['sometimes', 'array', 'min:1'],
                'fields.*.name' => ['required_with:fields', 'string', 'max:255'],
                'fields.*.type' => ['required_with:fields', 'string', 'in:string,number,date,boolean,array,object'],
                'fields.*.description' => ['nullable', 'string', 'max:500'],
                'fields.*.required' => ['nullable', 'boolean'],
            ]);

            $success = $this->updateDocumentTypeAction->execute(
                documentType: $documentType,
                name: $validated['name'] ?? $documentType->name,
                description: array_key_exists('description', $validated) ? $validated['description'] : $documentType->description,
                fields: $validated['fields'] ?? $documentType->fields,
            );

            if (! $success) {
                throw new \Exception('Failed to update document type in repository.');
            }

            return response()->json(
                HttpResponse::OK->json(
                    data: [
                        'id' => $documentType->id,
                        'name' => $documentType->name,
                        'description' => $documentType->description,
                        'fields' => $documentType->fields,
                        'updated_at' => $documentType->updated_at?->toISOString(),
                    ],
                    message: 'Document type updated successfully.'
                ),
                HttpResponse::OK->value
            );
        } catch (\Exception $e) {
            return response()->json(
                HttpResponse::INTERNAL_SERVER_ERROR->json(
                    message: 'Failed to update document type.',
                    meta: ['error' => $e->getMessage()]
                ),
                HttpResponse::INTERNAL_SERVER_ERROR->value
            );
        }
    }

    /**
     * Remove um tipo de documento.
     *
     * DELETE /api/v1/document-types/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        /** @var ApiClient $apiClient */
        $apiClient = auth('api')->user();

        $documentType = $this->documentTypeRepository->findById($id);

        if (! $documentType || $documentType->user_id !== $apiClient->user_id) {
            return response()->json(
                HttpResponse::NOT_FOUND->json(
                    message: 'Document type not found.'
                ),
                HttpResponse::NOT_FOUND->value
            );
        }

        try {
            $this->documentTypeRepository->delete($documentType);

            return response()->json(
                HttpResponse::OK->json(
                    message: 'Document type deleted successfully.'
                ),
                HttpResponse::OK->value
            );
        } catch (\Exception $e) {
            return response()->json(
                HttpResponse::INTERNAL_SERVER_ERROR->json(
                    message: 'Failed to delete document type.',
                    meta: ['error' => $e->getMessage()]
                ),
                HttpResponse::INTERNAL_SERVER_ERROR->value
            );
        }
    }
}
