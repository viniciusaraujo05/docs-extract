<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\DocumentTypes\StoreDocumentTypeAction;
use App\Actions\DocumentTypes\UpdateDocumentTypeAction;
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
    ) {}
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
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'fields' => 'required|string',
        ]);

        $fields = json_decode($validated['fields'], true);
        
        if (!is_array($fields)) {
            return back()->withErrors(['fields' => 'Formato de campos inválido.']);
        }

        try {
            $this->storeDocumentTypeAction->execute(
                userId: $request->user()->id,
                name: $validated['name'],
                description: $validated['description'] ?? null,
                fields: $fields,
            );
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['fields' => $e->getMessage()]);
        }

        return redirect()->route('document-types.index');
    }

    /**
     * Mostra o formulário de edição.
     */
    public function edit(DocumentType $documentType): Response
    {
        $this->authorize('update', $documentType);

        return Inertia::render('document-types/edit', [
            'documentType' => $documentType,
        ]);
    }

    /**
     * Atualiza um tipo de documento.
     */
    public function update(Request $request, DocumentType $documentType): RedirectResponse
    {
        $this->authorize('update', $documentType);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'fields' => 'required|string',
            'is_active' => 'boolean',
        ]);

        $fields = json_decode($validated['fields'], true);
        
        if (!is_array($fields)) {
            return back()->withErrors(['fields' => 'Formato de campos inválido.']);
        }

        try {
            $this->updateDocumentTypeAction->execute(
                documentType: $documentType,
                name: $validated['name'],
                description: $validated['description'] ?? null,
                fields: $fields,
                isActive: $validated['is_active'] ?? true,
            );
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['fields' => $e->getMessage()]);
        }

        return redirect()->route('document-types.index');
    }

    /**
     * Elimina um tipo de documento.
     */
    public function destroy(DocumentType $documentType): RedirectResponse
    {
        $this->authorize('delete', $documentType);

        $this->documentTypeRepository->delete($documentType);

        return redirect()
            ->route('document-types.index')
            ->with('success', 'Tipo de documento eliminado com sucesso.');
    }
}
