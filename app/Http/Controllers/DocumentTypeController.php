<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\DocumentTypes\StoreDocumentTypeAction;
use App\Actions\DocumentTypes\UpdateDocumentTypeAction;
use App\Http\Requests\StoreDocumentTypeRequest;
use App\Http\Requests\UpdateDocumentTypeRequest;
use App\Models\DocumentType;
use App\Repositories\DocumentTypeRepository;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controller para gestão de tipos de documentos.
 *
 * Refatorado para usar Repository Pattern e Actions,
 * seguindo princípios SOLID e Clean Code.
 */
final class DocumentTypeController extends Controller
{
    public function __construct(
        private readonly DocumentTypeRepository $documentTypeRepository,
        private readonly StoreDocumentTypeAction $storeDocumentTypeAction,
        private readonly UpdateDocumentTypeAction $updateDocumentTypeAction,
    ) {
    }

    /**
     * Lista todos os tipos de documentos do utilizador.
     */
    public function index(Request $request): Response
    {
        $documentTypes = $this->documentTypeRepository->getAllForUser($request->user()->id);

        return Inertia::render('document-types/index', [
            'documentTypes' => $documentTypes,
        ]);
    }

    /**
     * Mostra o formulário de criação.
     */
    public function create(): Response
    {
        return Inertia::render('document-types/create');
    }

    /**
     * Armazena um novo tipo de documento.
     */
    public function store(StoreDocumentTypeRequest $request, string $locale): RedirectResponse
    {
        try {
            $fields = $request->getValidatedFields();
            
            $this->storeDocumentTypeAction->execute(
                userId: $request->user()->id,
                name: $request->validated('name'),
                description: $request->validated('description'),
                fields: $fields,
            );
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['fields' => $e->getMessage()]);
        }

        return redirect()->route('document-types.index', ['locale' => $locale]);
    }

    /**
     * Mostra o formulário de edição.
     */
    public function edit(string $locale, DocumentType $documentType): Response
    {
        $this->authorize('update', $documentType);

        return Inertia::render('document-types/edit', [
            'documentType' => $documentType,
            'locale' => $locale,
        ]);
    }

    /**
     * Atualiza um tipo de documento.
     */
    public function update(UpdateDocumentTypeRequest $request, string $locale, DocumentType $documentType): RedirectResponse
    {
        $this->authorize('update', $documentType);

        try {
            $fields = $request->getValidatedFields();
            
            $this->updateDocumentTypeAction->execute(
                documentType: $documentType,
                name: $request->validated('name'),
                description: $request->validated('description'),
                fields: $fields,
                isActive: $request->validated('is_active', true),
            );
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['fields' => $e->getMessage()]);
        }

        return redirect()->route('document-types.index', ['locale' => $locale]);
    }

    /**
     * Elimina um tipo de documento.
     */
    public function destroy(string $locale, DocumentType $documentType): RedirectResponse
    {
        $this->authorize('delete', $documentType);

        $this->documentTypeRepository->delete($documentType);

        return redirect()
            ->route('document-types.index', ['locale' => $locale])
            ->with('success', 'Tipo de documento eliminado com sucesso.');
    }
}
