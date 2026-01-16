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
use Symfony\Component\HttpFoundation\BinaryFileResponse;

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
    ) {}

    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $result = $this->documentRepository->getPaginatedForUser($user, self::ITEMS_PER_PAGE);
        $paginator = $result['paginator'];
        $documentTypes = $this->documentTypeRepository->getAllForUser($user->id);

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
        ]);
    }

    public function create(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $documentTypes = $this->documentTypeRepository->getActiveForCreation($user->id);

        return Inertia::render('documents/create', [
            'documentTypes' => $documentTypes,
        ]);
    }

    public function store(StoreDocumentRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        // Check document limit before storing
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

    public function show(string $locale, string $document): Response
    {
        $documentModel = $this->documentRepository->findById($document);

        $this->authorize('view', $documentModel);

        $previewUrl = Storage::disk(config('filesystems.default'))->exists($documentModel->file_path)
            ? route('documents.preview', ['locale' => app()->getLocale(), 'document' => $documentModel->id])
            : null;

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

        if (!$disk->exists($documentModel->file_path)) {
            abort(404, 'File not found');
        }

        // For remote storage (R2, S3), stream the file
        if (!in_array($diskName, ['local', 'public'])) {
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
                'Content-Disposition' => 'inline; filename="' . $documentModel->original_filename . '"',
            ]);
        }

        // For local storage, use file response
        $path = $disk->path($documentModel->file_path);
        
        if (!file_exists($path)) {
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
     * Verifica se já existe documento com o nome fornecido.
     */
    public function checkName(Request $request): JsonResponse
    {
        $filename = (string) $request->query('name', '');
        $displayName = $request->query('display_name');
        $displayName ??= $filename !== '' ? pathinfo($filename, PATHINFO_FILENAME) : '';

        /** @var User $user */
        $user = $request->user();

        $exists = $this->documentRepository->existsByNameForUser($filename, $user->id, $displayName);

        return response()->json([
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
