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
     * Accepts file URL from Zapier (hydrated file from S3).
     *
     * Can optionally save extracted fields as a template for reuse.
     */
    public function processDocument(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'document_type_id' => 'nullable|exists:document_types,id',
            'file' => 'required|string', // URL from Zapier
            'save_as_template' => 'boolean',
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

            // Clean up temp file
            @unlink($tempPath);

            // Process using existing service
            $processed = $this->documentService->processDocument($document);

            // If no document type was provided, create schema from extracted data
            // This is needed for frontend to display the fields
            if (! $documentType && $processed->extracted_data) {
                $detectedFields = $this->createFieldsFromExtractedData($processed->extracted_data);
                $processed->update([
                    'schema_used' => ['fields' => $detectedFields],
                ]);
                $processed->refresh();
            }

            // Create template if requested
            $createdTemplate = null;
            if (($validated['save_as_template'] ?? false) && ! $documentType) {
                $createdTemplate = $this->createTemplateFromExtractedData(
                    $request->user(),
                    $processed->extracted_data,
                    $validated['template_name'] ?? null
                );

                // Associate document with the newly created template
                if ($createdTemplate) {
                    $processed->update([
                        'document_type_id' => $createdTemplate->id,
                        'type' => 'predefined',
                        'schema_used' => ['fields' => $createdTemplate->fields],
                    ]);
                    $processed->refresh();
                }
            }

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
     * Create field definitions from extracted data for schema_used.
     * This allows frontend to display fields even without a document type.
     */
    private function createFieldsFromExtractedData(array $extractedData): array
    {
        $fields = [];

        foreach ($extractedData as $key => $value) {
            $type = 'string'; // Default
            $items = null;

            if (is_array($value)) {
                $type = 'array';

                // Detect array item structure from first element
                // Only if it's an array of arrays (not a simple associative array)
                if (! empty($value) && isset($value[0]) && is_array($value[0])) {
                    $items = [];
                    foreach ($value[0] as $itemKey => $itemValue) {
                        $itemType = 'string';
                        if (is_numeric($itemValue)) {
                            $itemType = str_contains((string) $itemValue, '.') ? 'number' : 'integer';
                        } elseif (is_bool($itemValue)) {
                            $itemType = 'boolean';
                        }

                        $items[] = [
                            'name' => $itemKey,
                            'label' => ucwords(str_replace('_', ' ', $itemKey)),
                            'type' => $itemType,
                        ];
                    }
                }
            } elseif (is_numeric($value)) {
                $type = str_contains((string) $value, '.') ? 'number' : 'integer';
            } elseif (is_bool($value)) {
                $type = 'boolean';
            }

            $field = [
                'name' => $key,
                'label' => ucwords(str_replace('_', ' ', $key)),
                'type' => $type,
                'source' => 'ai',
                'required' => false,
            ];

            // Add items structure for arrays
            if ($items !== null) {
                $field['items'] = $items;
            }

            $fields[] = $field;
        }

        return $fields;
    }

    /**
     * Create a document type template from extracted data.
     */
    private function createTemplateFromExtractedData($user, ?array $extractedData, ?string $templateName): ?DocumentType
    {
        if (! $extractedData || empty($extractedData)) {
            return null;
        }

        // Generate template name if not provided
        if (! $templateName) {
            $templateName = 'Template '.now()->format('Y-m-d H:i');
        }

        // Extract field definitions from the extracted data
        $fields = [];
        foreach ($extractedData as $key => $value) {
            $type = 'string'; // Default
            $items = null;

            if (is_array($value)) {
                $type = 'array';

                // Detect array item structure from first element
                // Only if it's an array of arrays (not a simple associative array)
                if (! empty($value) && isset($value[0]) && is_array($value[0])) {
                    $items = [];
                    foreach ($value[0] as $itemKey => $itemValue) {
                        $itemType = 'string';
                        if (is_numeric($itemValue)) {
                            $itemType = str_contains((string) $itemValue, '.') ? 'number' : 'integer';
                        } elseif (is_bool($itemValue)) {
                            $itemType = 'boolean';
                        }

                        $items[] = [
                            'name' => $itemKey,
                            'label' => ucwords(str_replace('_', ' ', $itemKey)),
                            'type' => $itemType,
                        ];
                    }
                }
            } elseif (is_numeric($value)) {
                $type = str_contains((string) $value, '.') ? 'number' : 'integer';
            } elseif (is_bool($value)) {
                $type = 'boolean';
            }

            $field = [
                'name' => $key,
                'label' => ucwords(str_replace('_', ' ', $key)),
                'type' => $type,
                'source' => 'ai',
                'required' => false,
            ];

            // Add items structure for arrays
            if ($items !== null) {
                $field['items'] = $items;
            }

            $fields[] = $field;
        }

        // Create the document type
        return DocumentType::create([
            'user_id' => $user->id,
            'organization_id' => $user->organization_id,
            'name' => $templateName,
            'slug' => \Illuminate\Support\Str::slug($templateName).'-'.uniqid(),
            'description' => 'Auto-created from document processing via Zapier',
            'fields' => $fields,
            'is_active' => true,
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
