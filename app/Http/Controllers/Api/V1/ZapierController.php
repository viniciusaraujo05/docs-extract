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
     * Process a PDF or image file with optional document type.
     * Zapier Action: "Process Document"
     */
    public function processDocument(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file' => 'required|string', // URL from Zapier
            'document_type_id' => 'nullable|integer|exists:document_types,id',
            'save_as_template' => 'nullable|boolean',
            'template_name' => 'nullable|string|max:255',
        ]);

        // Verify document type ownership if provided
        $documentType = null;
        if (isset($validated['document_type_id'])) {
            $documentType = DocumentType::findOrFail($validated['document_type_id']);
            $this->authorize('view', $documentType);
        }

        // Download file from Zapier URL
        try {
            $fileUrl = $validated['file'];

            // Download file contents
            $fileContents = @file_get_contents($fileUrl);

            if ($fileContents === false) {
                return response()->json([
                    'error' => 'Failed to download file',
                    'message' => 'Could not download file from the provided URL. Please ensure the file is accessible.',
                ], 400);
            }

            // Detect MIME type
            $finfo = new \finfo(FILEINFO_MIME_TYPE);
            $mimeType = $finfo->buffer($fileContents);

            // Validate file type
            $allowedMimes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
            if (! in_array($mimeType, $allowedMimes)) {
                return response()->json([
                    'error' => 'Invalid file type',
                    'message' => 'Only PDF, PNG, and JPEG files are supported. Detected: '.$mimeType,
                ], 400);
            }

            // Get filename from URL or use default
            $urlPath = parse_url($fileUrl, PHP_URL_PATH);
            $filename = $urlPath ? basename($urlPath) : 'document.pdf';

            // If filename is too long (from Zapier URLs), use a cleaner name
            if (strlen($filename) > 100) {
                $extension = pathinfo($filename, PATHINFO_EXTENSION) ?: 'pdf';
                $filename = 'zapier_document_'.time().'.'.$extension;
            }

            // Create temporary file
            $tempPath = tempnam(sys_get_temp_dir(), 'zapier_');
            file_put_contents($tempPath, $fileContents);

            // Create UploadedFile instance
            $uploadedFile = new \Illuminate\Http\UploadedFile(
                $tempPath,
                $filename,
                $mimeType,
                null,
                true // test mode - don't validate file exists
            );

            // Store file
            $filePath = $uploadedFile->store('documents', config('filesystems.default'));

            // Get file size
            $fileSize = strlen($fileContents);

            // Detect page count for PDFs
            $pageCount = 1; // Default for images
            if ($mimeType === 'application/pdf') {
                try {
                    $parser = new \Smalot\PdfParser\Parser;
                    $pdf = $parser->parseFile($tempPath);
                    $pageCount = count($pdf->getPages());
                } catch (\Exception $e) {
                    // If PDF parsing fails, keep default
                    $pageCount = 1;
                }
            }

            // Get document type if provided
            $documentType = null;
            if (! empty($validated['document_type_id'])) {
                $documentType = DocumentType::where('user_id', $request->user()->id)
                    ->where('id', $validated['document_type_id'])
                    ->first();
            }

            // Determine document type category
            // type is just a category (invoice/receipt/custom/predefined)
            // The actual document type is stored in document_type_id
            $type = $documentType ? 'predefined' : 'custom';

            // Get schema (use document type fields or default schema)
            $schema = $documentType
                ? ['fields' => $documentType->fields]
                : $this->documentService->getDefaultSchema($type);

            // Create document (matching normal save process)
            $document = Document::create([
                'user_id' => $request->user()->id,
                'organization_id' => $request->user()->organization_id, // Required for frontend
                'document_type_id' => $documentType?->id,
                'name' => pathinfo($filename, PATHINFO_FILENAME), // Extract name without extension
                'file_path' => $filePath,
                'original_filename' => $filename,
                'mime_type' => $mimeType,
                'file_size' => $fileSize,
                'page_count' => $pageCount,
                'type' => $type,
                'schema_used' => $schema,
                'status' => 'pending',
                'storage_disk' => config('filesystems.default'), // Required for file access
            ]);

            // Process document using Action (BEFORE deleting temp file!)
            \Illuminate\Support\Facades\Log::info('ZapierController: calling Action', [
                'document_id' => $document->id,
                'has_document_type' => $documentType ? true : false,
                'document_type_id' => $documentType?->id,
                'temp_path_exists' => file_exists($tempPath),
                'temp_path_size' => file_exists($tempPath) ? filesize($tempPath) : 0,
            ]);

            /** @var \App\Actions\Zapier\ProcessZapierDocumentAction $action */
            $action = app(\App\Actions\Zapier\ProcessZapierDocumentAction::class);

            $result = $action->execute(
                $request,
                $document,
                $documentType, // Pass pre-selected document type
                $tempPath,
                $filename,
                $mimeType,
                $fileContents,
                $validated
            );

            $processed = $result['document'];
            $createdTemplate = $result['created_template'];

            \Illuminate\Support\Facades\Log::info('ZapierController: Action completed', [
                'processed_id' => $processed->id,
                'template_created' => $createdTemplate ? true : false,
                'created_template_name' => $createdTemplate?->name,
                'extracted_data_keys' => array_keys($processed->extracted_data ?? []),
            ]);

            // If a template was created, use it for the response
            if ($createdTemplate) {
                $documentType = $createdTemplate;
            }

            // Clean up temp file AFTER processing
            @unlink($tempPath);

            // Flatten extracted_data for Zapier compatibility
            // Zapier works better with flat structures instead of nested objects
            $response = [
                'id' => $processed->id,
                'status' => $processed->status,
                'document_type' => $documentType?->name,
                'created_at' => $processed->created_at?->toISOString(),
            ];

            // Add extracted data fields at root level
            if ($processed->extracted_data && is_array($processed->extracted_data)) {
                foreach ($processed->extracted_data as $key => $value) {
                    if (! is_array($value) && ! is_object($value)) {
                        // Simple scalar values - add directly
                        $response[$key] = $value;
                    } else {
                        // For arrays/objects, add as native array (Zapier handles this)
                        $response[$key] = $value;

                        // Also create a human-readable formatted version
                        if (is_array($value) && ! empty($value)) {
                            $formatted = $this->formatArrayForDisplay($value, $key);
                            if ($formatted) {
                                $response[$key.'_formatted'] = $formatted;
                            }
                        }
                    }
                }
            }

            // Add template creation info if applicable
            if ($createdTemplate) {
                $response['template_created'] = true;
                $response['template_id'] = $createdTemplate->id;
                $response['template_name'] = $createdTemplate->name;
            }

            return response()->json($response);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Processing failed',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Polling endpoint for "New Document Processed" REST Hook fallback.
     * Zapier Trigger: "New Document Processed" (polling URL)
     */
    public function listProcessedDocuments(Request $request): JsonResponse
    {
        $limit = max(1, min(50, (int) $request->input('limit', 10)));
        
        $documents = Document::with('documentType')
            ->where('user_id', $request->user()->id)
            ->where('status', 'completed')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        $responseList = [];

        foreach ($documents as $document) {
            $formattedData = [
                'id' => $document->id,
                'type' => 'document',
                'status' => $document->status,
                'original_name' => $document->original_name,
                'document_type' => $document->documentType ? [
                    'id' => $document->documentType->id,
                    'name' => $document->documentType->name,
                    'slug' => $document->documentType->slug,
                ] : null,
                'extracted_data' => $document->extracted_data,
                'download_links' => [
                    'csv' => route('api.v1.zapier.documents.export', [
                        'document' => $document->id,
                        'format' => 'csv',
                    ]),
                    'json' => route('api.v1.zapier.documents.export', [
                        'document' => $document->id,
                        'format' => 'json',
                    ]),
                ],
                // For polling we use created_at to represent the date it finished processing, 
                // matching webhook logic.
                'created_at' => $document->created_at?->toIso8601String(),
                'processed_at' => $document->updated_at?->toIso8601String() ?? now()->toIso8601String(),
            ];

            // Add flat extracted data for Zapier
            if ($document->extracted_data && is_array($document->extracted_data)) {
                foreach ($document->extracted_data as $key => $value) {
                    if (! is_array($value) && ! is_object($value)) {
                        $formattedData[$key] = $value;
                    } else {
                        $formattedData[$key] = $value;
                        if (is_array($value) && ! empty($value)) {
                            $formatted = $this->formatArrayForDisplay($value, $key);
                            if ($formatted) {
                                $formattedData[$key.'_formatted'] = $formatted;
                            }
                        }
                    }
                }
            }

            $responseList[] = $formattedData;
        }

        return response()->json($responseList);
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
     * Format an array field into a human-readable string for Zapier display.
     */
    private function formatArrayForDisplay(array $data, string $fieldName): ?string
    {
        if (empty($data)) {
            return null;
        }

        // Check if it's an array of objects (like line_items)
        $firstItem = reset($data);
        if (is_array($firstItem)) {
            $count = count($data);
            $items = [];

            foreach ($data as $item) {
                // Try to create a meaningful summary of each item
                $summary = [];

                // Common fields to include in summary
                $priorityFields = ['description', 'name', 'title', 'qty', 'quantity', 'total', 'amount', 'price'];

                foreach ($priorityFields as $field) {
                    if (isset($item[$field]) && $item[$field] !== null && $item[$field] !== '') {
                        $value = $item[$field];
                        // Format numbers as currency if it looks like money
                        if (in_array($field, ['total', 'amount', 'price', 'unit_price']) && is_numeric($value)) {
                            $value = '$'.number_format((float) $value, 2);
                        }
                        $summary[] = $value;
                    }
                }

                if (! empty($summary)) {
                    $items[] = implode(' - ', $summary);
                }
            }

            if (! empty($items)) {
                $label = ucfirst(str_replace('_', ' ', $fieldName));

                return "{$count} {$label}: ".implode(' | ', $items);
            }
        }

        return null;
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
