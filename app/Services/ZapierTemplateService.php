<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\DocumentType;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Service for managing Zapier templates.
 * Handles template lookup, creation, and field detection.
 */
class ZapierTemplateService
{
    public function __construct(
        private readonly FieldDetectorService $fieldDetector
    ) {}

    /**
     * Find existing template by name for user.
     */
    public function findByName(User $user, string $templateName): ?DocumentType
    {
        return DocumentType::where('user_id', $user->id)
            ->where('name', $templateName)
            ->first();
    }

    /**
     * Create template from document using AI field detection.
     *
     * @return DocumentType|null Created template or null if detection failed
     */
    public function createFromDocument(
        User $user,
        string $tempPath,
        string $filename,
        string $mimeType,
        string $fileContents,
        string $templateName
    ): ?DocumentType {
        try {
            Log::info('ZapierTemplateService: createFromDocument start', [
                'template_name' => $templateName,
                'mime_type' => $mimeType,
                'file_size' => strlen($fileContents),
                'temp_path' => $tempPath,
            ]);

            // Detect fields from document
            $detectedFields = $this->detectFields($tempPath, $filename, $mimeType, $fileContents);

            Log::info('ZapierTemplateService: fields detected', [
                'count' => $detectedFields ? count($detectedFields) : 0,
                'fields_sample' => $detectedFields ? array_slice($detectedFields, 0, 3) : null,
            ]);

            if (! $detectedFields) {
                Log::warning('ZapierTemplateService: No fields detected, aborting template creation');

                return null;
            }

            // Create template
            $template = DocumentType::create([
                'user_id' => $user->id,
                'organization_id' => $user->organization_id,
                'name' => $templateName,
                'slug' => Str::slug($templateName).'-'.uniqid(),
                'description' => 'Auto-created from Zapier with AI field detection',
                'fields' => $detectedFields,
                'is_active' => true,
            ]);

            Log::info('ZapierTemplateService: Template created', ['id' => $template->id]);

            return $template;
        } catch (\Exception $e) {
            Log::warning('Template creation failed in Zapier', [
                'error' => $e->getMessage(),
                'template_name' => $templateName,
                'trace' => $e->getTraceAsString(),
            ]);

            return null;
        }
    }

    /**
     * Detect fields from document using FieldDetectorService.
     */
    /**
     * Detect fields from document using FieldDetectorService.
     */
    private function detectFields(
        string $tempPath,
        string $filename,
        string $mimeType,
        string $fileContents
    ): ?array {
        if ($mimeType === 'application/pdf') {
            return $this->detectFieldsFromPdf($fileContents, $filename, $mimeType);
        }

        return $this->detectFieldsFromImage($fileContents);
    }

    /**
     * Detect fields from PDF by converting to images.
     */
    private function detectFieldsFromPdf(string $fileContents, string $filename, string $mimeType): ?array
    {
        // Create a dedicated temp file to ensure it exists and matches contents
        $tempPath = tempnam(sys_get_temp_dir(), 'zapier_tpl_');
        file_put_contents($tempPath, $fileContents);

        try {
            /** @var \App\Services\PdfToImageService $pdfService */
            $pdfService = app(\App\Services\PdfToImageService::class);

            $imagePaths = $pdfService->convertPdf(new UploadedFile(
                $tempPath,
                $filename,
                $mimeType,
                null,
                true
            ));

            if (empty($imagePaths)) {
                return null;
            }

            $imagesPayload = [];
            foreach ($imagePaths as $path) {
                $imagesPayload[] = [
                    'data' => base64_encode(file_get_contents($path)),
                    'mime' => 'image/png',
                ];
            }

            $pdfService->cleanup($imagePaths);

            return $this->fieldDetector->detectFromImage($imagesPayload);
        } finally {
            // Cleanup our local temp file
            @unlink($tempPath);
        }
    }

    /**
     * Detect fields from image.
     */
    private function detectFieldsFromImage(string $fileContents): ?array
    {
        $base64 = base64_encode($fileContents);

        return $this->fieldDetector->detectFromImage($base64);
    }

    /**
     * Create field definitions from extracted data for schema_used.
     * Used as fallback when no template is available.
     */
    public function createFieldsFromExtractedData(array $extractedData): array
    {
        $fields = [];

        foreach ($extractedData as $key => $value) {
            $type = 'string'; // Default
            $items = null;

            if (is_array($value)) {
                // Check if it's an indexed array (list) or associative array (object)
                $isIndexedArray = array_keys($value) === range(0, count($value) - 1);

                if ($isIndexedArray && ! empty($value) && is_array($value[0])) {
                    // It's an array of objects (like items) - use type 'array'
                    $type = 'array';
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

                    $field = [
                        'name' => $key,
                        'label' => ucwords(str_replace('_', ' ', $key)),
                        'type' => $type,
                        'source' => 'ai',
                        'required' => false,
                        'items' => $items,
                    ];

                    $fields[] = $field;
                } else {
                    // It's an associative array (object like seller, bill_to)
                    // Flatten it into individual fields
                    foreach ($value as $subKey => $subValue) {
                        $subType = 'string';
                        if (is_numeric($subValue)) {
                            $subType = str_contains((string) $subValue, '.') ? 'number' : 'integer';
                        } elseif (is_bool($subValue)) {
                            $subType = 'boolean';
                        }

                        $fields[] = [
                            'name' => $key.'_'.$subKey,
                            'label' => ucwords(str_replace('_', ' ', $key)).' '.ucwords(str_replace('_', ' ', $subKey)),
                            'type' => $subType,
                            'source' => 'ai',
                            'required' => false,
                        ];
                    }
                }

                continue; // Skip the default field creation below
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

            $fields[] = $field;
        }

        return $fields;
    }
}
