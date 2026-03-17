<?php

declare(strict_types=1);

namespace App\Actions\Documents;

use App\Jobs\ProcessDocumentJob;
use App\Models\Document;
use App\Models\User;
use App\Repositories\DocumentRepository;
use App\Repositories\DocumentTypeRepository;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

/**
 * Action para armazenar um novo documento.
 *
 * Encapsula toda a lógica de criação de documento, incluindo:
 * - Upload do arquivo
 * - Criação de novo tipo se necessário
 * - Criação do documento
 * - Dispatch do job de processamento
 */
final readonly class StoreDocumentAction
{
    public function __construct(
        private DocumentRepository $documentRepository,
        private DocumentTypeRepository $documentTypeRepository,
        private \App\Services\DocumentPageCounter $pageCounter,
    ) {}

    public function execute(
        User $user,
        UploadedFile $file,
        string $type,
        ?int $documentTypeId,
        ?string $newTypeName,
        ?array $schema,
        ?array $extractedData,
        bool $forceOverwrite = false,
        bool $dispatchJob = true,
    ): Document {
        $originalFilename = $file->getClientOriginalName();
        $existingDocument = $this->documentRepository->findByFilenameForUser($originalFilename, $user->id);

        if ($existingDocument && $forceOverwrite) {
            $this->documentRepository->delete($existingDocument);
        }

        if ($documentTypeId !== null) {
            $documentType = $this->documentTypeRepository->findById($documentTypeId);

            if (! $documentType || $documentType->user_id !== $user->id) {
                throw new \InvalidArgumentException('Invalid document type or you do not have permission to use it.');
            }
        }

        $pageCount = $this->pageCounter->count($file);
        $filePath = $this->storeFile($file, $user->id);

        if ($type === 'new_type' && ! empty($newTypeName) && isset($schema['fields'])) {
            $newDocumentType = $this->documentTypeRepository->create([
                'user_id' => $user->id,
                'name' => $newTypeName,
                'fields' => $schema['fields'],
            ]);
            $documentTypeId = $newDocumentType->id;
            $type = 'predefined';
        }

        $document = $this->documentRepository->create([
            'user_id' => $user->id,
            'organization_id' => $user->organization_id,
            'document_type_id' => $documentTypeId,
            'name' => pathinfo($originalFilename, PATHINFO_FILENAME),
            'original_filename' => $originalFilename,
            'file_path' => $filePath,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'page_count' => $pageCount,
            'type' => $type,
            'status' => $extractedData !== null ? 'completed' : 'pending',
            'schema_used' => $schema,
            'extracted_data' => $extractedData,
            'processed_at' => $extractedData !== null ? now() : null,
            'storage_disk' => config('filesystems.default'),
        ]);

        if ($extractedData === null && $dispatchJob) {
            ProcessDocumentJob::dispatch($document);
        }

        return $document;
    }

    private function storeFile(UploadedFile $file, int $userId): string
    {
        $mime = $file->getMimeType();

        $ext = match ($mime) {
            'application/pdf' => 'pdf',
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            default => throw new \RuntimeException('Unsupported file type.'),
        };

        $filename = Str::uuid()->toString().'.'.$ext;

        // Strip EXIF/metadata from images before storage
        if (str_starts_with($mime, 'image/')) {
            $this->stripImageMetadata($file->getPathname(), $mime);
        }

        $path = $file->storeAs("documents/{$userId}", $filename, config('filesystems.default'));

        if (! $path) {
            throw new \RuntimeException('Failed to store document file. Please check storage configuration.');
        }

        return $path;
    }

    private function stripImageMetadata(string $path, string $mime): void
    {
        // Re-encode via GD to drop all EXIF/metadata. Non-fatal on failure.
        try {
            $img = match ($mime) {
                'image/jpeg' => imagecreatefromjpeg($path),
                'image/png' => imagecreatefrompng($path),
                'image/webp' => imagecreatefromwebp($path),
                default => false,
            };

            if ($img === false) {
                return;
            }

            match ($mime) {
                'image/jpeg' => imagejpeg($img, $path, 95),
                'image/png' => (static function ($i, $p): void {
                    imagesavealpha($i, true);
                    imagepng($i, $p, 9);
                })($img, $path),
                'image/webp' => imagewebp($img, $path, 90),
                default => null,
            };

        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Failed to strip image metadata', [
                'mime' => $mime,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
