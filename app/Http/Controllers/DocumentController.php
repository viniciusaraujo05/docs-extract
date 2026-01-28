<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Documents\DeleteDocumentAction;
use App\Actions\Documents\ReprocessDocumentAction;
use App\Actions\Documents\StoreDocumentAction;
use App\DataTransferObjects\DocumentData;
use App\Http\Requests\StoreDocumentRequest;
use App\Http\Requests\UpdateDocumentDataRequest;
use App\Http\Requests\UpdateDocumentRequest;
use App\Models\Document;
use App\Models\ExtractionSchema;
use App\Models\User;
use App\Repositories\DocumentRepository;
use App\Repositories\DocumentTypeRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controller para gestão de documentos.
 *
 * Refatorado para usar Repository Pattern e Actions,
 * seguindo princípios SOLID e Clean Code.
 */
final class DocumentController extends Controller
{
    private const ITEMS_PER_PAGE = 20;

    public function __construct(
        private readonly DocumentRepository $documentRepository,
        private readonly DocumentTypeRepository $documentTypeRepository,
        private readonly StoreDocumentAction $storeDocumentAction,
        private readonly DeleteDocumentAction $deleteDocumentAction,
        private readonly ReprocessDocumentAction $reprocessDocumentAction,
        private readonly \App\Repositories\DocumentBatchRepository $batchRepository,
        private readonly \App\Actions\Documents\StoreBatchDocumentsAction $storeBatchDocumentsAction,
    ) {}

    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $result = $this->documentRepository->getPaginatedForUser($user, self::ITEMS_PER_PAGE);
        $paginator = $result['paginator'];
        $documentTypes = $this->documentTypeRepository->getAllForUser($user->id);

        $recentBatches = $this->batchRepository->getRecentBatches($user, 3);

        return Inertia::render('documents/index', [
            'documents' => [
                'data' => $result['collection']->map(fn (Document $doc): array => [
                    'id' => $doc->id,
                    'name' => $doc->name,
                    'mime_type' => $doc->mime_type,
                    'original_filename' => $doc->original_filename,
                    'file_size' => $doc->file_size,
                    'type' => $doc->type,
                    'status' => $doc->status,
                    'created_at' => $doc->created_at?->toISOString(),
                    'document_type' => $doc->documentType ? [
                        'id' => $doc->documentType->id,
                        'name' => $doc->documentType->name,
                        'description' => $doc->documentType->description,
                    ] : null,
                ])->toArray(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'total' => $paginator->total(),
            ],
            'documentTypes' => $documentTypes,
            'recentBatches' => $recentBatches->map(fn ($b) => [
                'id' => $b->id,
                'status' => $b->status,
                'template_name' => $b->template_name,
                'progress' => $b->getProgress(),
                'created_at' => $b->created_at->toISOString(),
            ])->toArray(),
        ]);
    }

    public function create(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $documentTypes = $this->documentTypeRepository->getActiveForCreation($user->id);
        $hasTemplates = count($documentTypes) > 0;

        // Check usage limits
        $subscriptionService = app(\App\Services\SubscriptionService::class);
        $limitReached = $subscriptionService->hasReachedLimit($user, 'documents');
        $planName = $subscriptionService->getUserPlanName($user);

        // Check model limit
        $modelLimitReached = $subscriptionService->hasReachedLimit($user, 'models');

        // Check if this is the first document
        $isFirstDocument = $user->documents()->doesntExist();

        return Inertia::render('documents/create', [
            'documentTypes' => $documentTypes,
            'hasTemplates' => $hasTemplates,
            'limitReached' => $limitReached,
            'planName' => $planName,
            'modelLimitReached' => $modelLimitReached,
            'isFirstDocument' => $isFirstDocument,
        ]);
    }

    public function store(StoreDocumentRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        // Check page limit before storing
        $subscriptionService = app(\App\Services\SubscriptionService::class);
        if ($subscriptionService->hasReachedLimit($user, 'documents')) {
            $planName = $subscriptionService->getUserPlanName($user);

            return redirect()->back()
                ->with('error', "You've reached the document limit for your {$planName} plan. Upgrade to continue uploading documents.");
        }

        $file = $request->file('file');
        $documentData = DocumentData::fromRequest($request->all());

        $schema = $documentData->schema ?? $this->getDefaultSchema($documentData->type);

        $document = $this->storeDocumentAction->execute(
            user: $user,
            file: $file,
            type: $documentData->type,
            documentTypeId: $documentData->documentTypeId,
            newTypeName: $documentData->newTypeName,
            schema: $schema,
            extractedData: $documentData->extractedData,
            forceOverwrite: $request->boolean('force_overwrite', false),
        );

        $message = $documentData->extractedData !== null
            ? 'Documento salvo com sucesso.'
            : 'Documento enviado para processamento.';

        return redirect()
            ->route('documents.show', ['locale' => app()->getLocale(), 'document' => $document->id])
            ->with('success', $message);
    }

    public function show(Request $request, string $locale, string $document)
    {
        $documentModel = $this->documentRepository->findById($document);

        $this->authorize('view', $documentModel);

        $diskName = $documentModel->storage_disk ?? config('filesystems.default');

        \Illuminate\Support\Facades\Log::info('Checking Preview', [
            'doc_id' => $documentModel->id,
            'path' => $documentModel->file_path,
            'disk_db' => $documentModel->storage_disk,
            'disk_used' => $diskName,
            'exists' => Storage::disk($diskName)->exists($documentModel->file_path),
        ]);

        $previewUrl = Storage::disk($diskName)->exists($documentModel->file_path)
            ? route('documents.preview', ['locale' => app()->getLocale(), 'document' => $documentModel->id])
            : null;

        if ($request->wantsJson()) {
            return response()->json([
                'document' => $documentModel->load('user'),
                'previewUrl' => $previewUrl,
            ]);
        }

        return Inertia::render('documents/show', [
            'document' => $documentModel->load('user'),
            'previewUrl' => $previewUrl,
        ]);
    }

    public function update(UpdateDocumentRequest $request, string $locale, string $document): RedirectResponse
    {
        $documentModel = $this->documentRepository->findById($document);

        $this->authorize('update', $documentModel);

        $this->documentRepository->update($documentModel, [
            'name' => $request->validated('name'),
        ]);

        return redirect()
            ->route('documents.show', ['locale' => app()->getLocale(), 'document' => $documentModel->id])
            ->with('success', 'Documento atualizado com sucesso.');
    }

    public function preview(string $locale, string $document)
    {
        $documentModel = $this->documentRepository->findById($document);

        $this->authorize('view', $documentModel);

        $diskName = $documentModel->storage_disk ?? config('filesystems.default');
        $disk = Storage::disk($diskName);

        if (! $disk->exists($documentModel->file_path)) {
            abort(404, 'File not found');
        }

        // For remote storage (R2, S3), stream the file
        if (! in_array($diskName, ['local', 'public'])) {
            $stream = $disk->readStream($documentModel->file_path);

            if ($stream === false) {
                abort(500, 'Failed to read file from storage');
            }

            return response()->stream(function () use ($stream) {
                fpassthru($stream);
                if (is_resource($stream)) {
                    fclose($stream);
                }
            }, 200, [
                'Content-Type' => $documentModel->mime_type,
                'Content-Disposition' => 'inline; filename="'.$documentModel->original_filename.'"',
            ]);
        }

        // For local storage, use file response
        $path = $disk->path($documentModel->file_path);

        if (! file_exists($path)) {
            abort(404, 'File not found');
        }

        return response()->file($path, [
            'Content-Type' => $documentModel->mime_type,
        ]);
    }

    public function updateData(UpdateDocumentDataRequest $request, string $locale, string $document): RedirectResponse
    {
        $documentModel = $this->documentRepository->findById($document);

        $this->authorize('update', $documentModel);

        $this->documentRepository->update($documentModel, [
            'extracted_data' => $request->validated('extracted_data'),
        ]);

        return redirect()
            ->route('documents.show', ['locale' => app()->getLocale(), 'document' => $documentModel->id])
            ->with('success', 'Dados atualizados com sucesso.');
    }

    public function reprocess(Request $request, string $locale, string $document): RedirectResponse
    {
        $documentModel = $this->documentRepository->findById($document);

        $this->authorize('update', $documentModel);

        /** @var User $user */
        $user = $request->user();

        try {
            $this->reprocessDocumentAction->execute($documentModel, $user->organization);
        } catch (\RuntimeException $e) {
            return redirect()
                ->route('documents.show', ['locale' => app()->getLocale(), 'document' => $documentModel->id])
                ->with('error', $e->getMessage());
        }

        return redirect()
            ->route('documents.show', ['locale' => app()->getLocale(), 'document' => $documentModel->id])
            ->with('success', 'Documento enviado para reprocessamento.');
    }

    public function destroy(string $locale, string $document): RedirectResponse
    {
        $documentModel = $this->documentRepository->findById($document);

        $this->authorize('delete', $documentModel);

        $this->deleteDocumentAction->execute($documentModel);

        return redirect()
            ->route('documents.index', ['locale' => app()->getLocale()])
            ->with('success', 'Documento eliminado com sucesso.');
    }

    /**
     * Store batch documents.
     */
    public function batchStore(\App\Http\Requests\StoreBatchDocumentRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        // Check if user has reached document limit
        $subscriptionService = app(\App\Services\SubscriptionService::class);
        if ($subscriptionService->hasReachedLimit($user, 'documents')) {
            $planName = $subscriptionService->getUserPlanName($user);

            return redirect()->back()
                ->with('error', "You've reached the document limit for your {$planName} plan. Upgrade to continue uploading documents.");
        }

        $files = $request->file('files');
        $documentTypeId = $request->input('document_type_id');
        $documentTypeId = $documentTypeId ? (int) $documentTypeId : null;
        $newTypeName = $request->input('new_type_name');
        $fields = $request->input('fields');

        $schema = ['fields' => $fields];

        $batch = $this->storeBatchDocumentsAction->execute(
            user: $user,
            files: $files,
            documentTypeId: $documentTypeId,
            newTypeName: $newTypeName,
            schema: $schema,
        );

        return redirect()
            ->route('documents.batch.show', ['locale' => app()->getLocale(), 'batch' => $batch->id])
            ->with('success', count($files).' documents queued for processing.');
    }

    /**
     * Show batch progress/results.
     */
    public function batchShow(Request $request, string $locale, string $batch): Response
    {
        /** @var User $user */
        $user = $request->user();

        $batchModel = $this->batchRepository->findForUser((int) $batch, $user);

        if (! $batchModel) {
            abort(404, 'Batch not found');
        }

        return Inertia::render('documents/batch-progress', [
            'batch' => [
                'id' => $batchModel->id,
                'status' => $batchModel->status,
                'template_name' => $batchModel->template_name,
                'progress' => $batchModel->getProgress(),
                'created_at' => $batchModel->created_at->toISOString(),
                'started_at' => $batchModel->started_at?->toISOString(),
                'completed_at' => $batchModel->completed_at?->toISOString(),
            ],
            'documents' => $batchModel->documents->map(fn ($doc) => [
                'id' => $doc->id,
                'name' => $doc->name,
                'status' => $doc->status,
                'error_message' => $doc->error_message,
                'created_at' => $doc->created_at->toISOString(),
            ])->toArray(),
            'hasGoogleConnection' => $user->connectedAccounts()->where('provider', 'google')->exists(),
        ]);
    }

    /**
     * Get batch progress (API endpoint for polling).
     */
    public function batchProgress(Request $request, string $locale, string $batch)
    {
        /** @var User $user */
        $user = $request->user();

        $batchModel = $this->batchRepository->findForUser((int) $batch, $user);

        if (! $batchModel) {
            if ($request->wantsJson() || $request->query('json') === 'true') {
                return response()->json(['error' => 'Batch not found'], 404);
            }
            abort(404, 'Batch not found');
        }

        // Return JSON if requested (for polling)
        if ($request->wantsJson() || $request->query('json') === 'true') {
            return response()->json([
                'batch' => [
                    'id' => $batchModel->id,
                    'status' => $batchModel->status,
                    'template_name' => $batchModel->template_name,
                    'progress' => $batchModel->getProgress(),
                    'created_at' => $batchModel->created_at->toISOString(),
                    'started_at' => $batchModel->started_at?->toISOString(),
                    'completed_at' => $batchModel->completed_at?->toISOString(),
                ],
                'documents' => $batchModel->documents->map(fn ($doc) => [
                    'id' => $doc->id,
                    'name' => $doc->name,
                    'status' => $doc->status,
                    'error_message' => $doc->error_message,
                    'created_at' => $doc->created_at->toISOString(),
                ])->toArray(),
            ]);
        }

        // Return Inertia view by default
        return Inertia::render('documents/batch-progress', [
            'batch' => [
                'id' => $batchModel->id,
                'status' => $batchModel->status,
                'template_name' => $batchModel->template_name,
                'progress' => $batchModel->getProgress(),
                'created_at' => $batchModel->created_at->toISOString(),
                'started_at' => $batchModel->started_at?->toISOString(),
                'completed_at' => $batchModel->completed_at?->toISOString(),
            ],
            'documents' => $batchModel->documents->map(fn ($doc) => [
                'id' => $doc->id,
                'name' => $doc->name,
                'status' => $doc->status,
                'error_message' => $doc->error_message,
                'created_at' => $doc->created_at->toISOString(),
            ])->toArray(),
        ]);
    }

    /**
     * Cancel a batch.
     */
    public function batchCancel(Request $request, string $locale, string $batch): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $batchModel = $this->batchRepository->findForUser((int) $batch, $user);

        if (! $batchModel) {
            abort(404, 'Batch not found');
        }

        $this->batchRepository->cancel($batchModel);

        return redirect()->back()->with('success', 'Batch processing cancelled.');
    }

    /**
     * Verifica se já existe documento com o nome fornecido.
     */
    /**
     * Verifica se já existe documento com o nome fornecido.
     * Suporta verificação em lote via parametro 'names[]'.
     */
    public function checkName(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        // Batch check
        if ($request->has('names')) {
            $names = $request->input('names');
            if (! is_array($names)) {
                $names = [$names];
            }

            $duplicates = $this->documentRepository->findExistingNames($names, $user->id);

            return response()->json([
                'structure' => 'batch',
                'duplicates' => $duplicates,
            ]);
        }

        // Single check (Legacy/Standard)
        $filename = (string) $request->input('name', '');
        $displayName = $request->input('display_name');
        $displayName ??= $filename !== '' ? pathinfo($filename, PATHINFO_FILENAME) : '';

        $exists = $this->documentRepository->existsByNameForUser($filename, $user->id, $displayName);

        return response()->json([
            'structure' => 'single',
            'exists' => $exists,
            'name' => $filename,
            'display_name_checked' => $displayName,
        ]);
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
