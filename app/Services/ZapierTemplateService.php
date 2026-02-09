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
            // Detect fields from document
            $detectedFields = $this->detectFields($tempPath, $filename, $mimeType, $fileContents);

            if (! $detectedFields) {
                return null;
            }

            // Create template
            return DocumentType::create([
                'user_id' => $user->id,
                'organization_id' => $user->organization_id,
                'name' => $templateName,
                'slug' => Str::slug($templateName).'-'.uniqid(),
                'description' => 'Auto-created from Zapier with AI field detection',
                'fields' => $detectedFields,
                'is_active' => true,
            ]);
        } catch (\Exception $e) {
            Log::warning('Template creation failed in Zapier', [
                'error' => $e->getMessage(),
                'template_name' => $templateName,
            ]);

            return null;
        }
    }

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
            return $this->detectFieldsFromPdf($tempPath, $filename, $mimeType);
        }

        return $this->detectFieldsFromImage($fileContents);
    }

    /**
     * Detect fields from PDF by converting to images.
     */
    private function detectFieldsFromPdf(string $tempPath, string $filename, string $mimeType): ?array
    {
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
}
