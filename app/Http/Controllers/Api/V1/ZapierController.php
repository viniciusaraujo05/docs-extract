<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\DocumentType;
use App\Models\WebhookEndpoint;
use App\Repositories\DocumentTypeRepository;
use App\Services\DocumentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ZapierController extends Controller
{
    public function __construct(
        private readonly DocumentTypeRepository $documentTypeRepository,
        private readonly DocumentService $documentService
    ) {}

    /**
     * Return the authenticated user info for Zapier to test the connection.
     */
    public function me(): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::guard('passport')->user();

        if (! $user) {
            return response()->json(['error' => 'unauthorized'], 401);
        }

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
        ]);
    }

    /**
     * List all document types for the authenticated user.
     * Used to populate dropdowns in Zapier/Make.
     */
    public function listDocumentTypes(Request $request): JsonResponse
    {
        $documentTypes = DocumentType::query()
            ->forUser($request->user()->id)
            ->active()
            ->orderBy('created_at', 'desc')
            ->get(['id', 'name', 'slug', 'description', 'created_at']);

        return response()->json($documentTypes);
    }

    /**
     * Get all fields for a specific document type.
     * Used by Zapier to show dynamic fields ({{nif}}, {{total}}, etc.).
     */
    public function getDocumentTypeFields(DocumentType $documentType): JsonResponse
    {
        $this->authorize('view', $documentType);

        return response()->json([
            'document_type_id' => $documentType->id,
            'document_type_name' => $documentType->name,
            'fields' => $documentType->fields,
        ]);
    }

    /**
     * Add a custom field to an existing document type.
     */
    public function addCustomField(Request $request, DocumentType $documentType): JsonResponse
    {
        $this->authorize('update', $documentType);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:string,integer,number,boolean,datetime,text,dictionary,password',
            'required' => 'boolean',
        ]);

        $newField = [
            'name' => $validated['name'],
            'type' => $validated['type'],
            'source' => 'manual',
            'required' => $validated['required'] ?? false,
        ];

        $fields = $documentType->fields ?? [];
        $fields[] = $newField;

        $documentType->update(['fields' => $fields]);

        return response()->json($newField, 201);
    }

    /**
     * Process a PDF with a specific document type.
     * Main action for Zapier document extraction.
     */
    public function processDocument(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'document_type_id' => 'required|exists:document_types,id',
            'file' => 'required|file|mimes:pdf|max:10240',
        ]);

        $documentType = DocumentType::findOrFail($validated['document_type_id']);
        $this->authorize('view', $documentType);

        // Store file
        $filePath = $request->file('file')->store('documents', config('filesystems.default'));

        // Create document
        $document = Document::create([
            'user_id' => $request->user()->id,
            'document_type_id' => $documentType->id,
            'file_path' => $filePath,
            'original_name' => $request->file('file')->getClientOriginalName(),
            'mime_type' => 'application/pdf',
            'schema_used' => ['fields' => $documentType->fields],
            'status' => 'pending',
        ]);

        // Process using existing service
        $processed = $this->documentService->processDocument($document);

        return response()->json([
            'id' => $processed->id,
            'status' => $processed->status,
            'extracted_data' => $processed->extracted_data,
            'download_links' => [
                'excel' => route('api.v1.documents.export', ['document' => $processed->id, 'format' => 'xlsx']),
                'csv' => route('api.v1.documents.export', ['document' => $processed->id, 'format' => 'csv']),
                'json' => route('api.v1.documents.export', ['document' => $processed->id, 'format' => 'json']),
            ],
        ]);
    }

    /**
     * Subscribe to webhook notifications (Zapier Instant Trigger).
     */
    public function subscribeWebhook(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'target_url' => 'required|url|max:255',
            'event' => 'required|in:document.completed',
            'document_type_id' => 'nullable|exists:document_types,id',
        ]);

        // If document_type_id is provided, verify user owns it
        if (isset($validated['document_type_id'])) {
            $documentType = DocumentType::findOrFail($validated['document_type_id']);
            $this->authorize('view', $documentType);
        }

        $webhook = WebhookEndpoint::create([
            'user_id' => $request->user()->id,
            'url' => $validated['target_url'],
            'events' => [$validated['event']],
            'filters' => $validated['document_type_id']
                ? ['document_type_id' => $validated['document_type_id']]
                : null,
            'is_active' => true,
        ]);

        return response()->json([
            'id' => $webhook->id,
            'url' => $webhook->url,
            'events' => $webhook->events,
            'filters' => $webhook->filters,
        ], 201);
    }

    /**
     * Unsubscribe from webhook notifications.
     */
    public function unsubscribeWebhook(WebhookEndpoint $webhookEndpoint): JsonResponse
    {
        $this->authorize('delete', $webhookEndpoint);

        $webhookEndpoint->delete();

        return response()->json(['message' => 'Webhook unsubscribed successfully']);
    }

    /**
     * Export document data in JSON or CSV format.
     */
    public function exportDocument(Document $document, string $format): mixed
    {
        $this->authorize('view', $document);

        $data = $document->extracted_data ?? [];

        return match ($format) {
            'json' => response()->json($data),
            'csv' => $this->exportCsv($data, $document->original_name),
            default => response()->json(['error' => 'Invalid format. Supported: json, csv'], 400),
        };
    }

    private function exportCsv(array $data, string $filename): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="'.str_replace('.pdf', '.csv', $filename).'"',
        ];

        return response()->stream(function () use ($data) {
            $file = fopen('php://output', 'w');
            if (! empty($data)) {
                fputcsv($file, array_keys($data));
                fputcsv($file, array_values($data));
            }
            fclose($file);
        }, 200, $headers);
    }
}
