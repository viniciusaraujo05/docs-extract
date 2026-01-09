<?php

declare(strict_types=1);

namespace App\Actions\Documents;

use App\Models\Document;
use App\Models\User;
use App\Repositories\DocumentRepository;
use App\Repositories\DocumentTypeRepository;
use App\Services\Demo\DocumentTextExtractor;
use App\Services\ExtractionService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Action para extrair e armazenar documento.
 *
 * Encapsula toda a lógica de:
 * - Extração de texto do documento
 * - Aplicação de schema
 * - Armazenamento do documento
 * - Validação de duplicatas
 */
final readonly class ExtractAndStoreDocumentAction
{
    public function __construct(
        private DocumentRepository $documentRepository,
        private DocumentTypeRepository $documentTypeRepository,
        private DocumentTextExtractor $textExtractor,
        private ExtractionService $extractionService,
    ) {}

    /**
     * Executa a ação de extrair e armazenar documento.
     */
    public function execute(
        User $user,
        UploadedFile $file,
        int $documentTypeId,
        bool $forceOverwrite = false,
    ): Document {
        // Verifica se já existe documento com mesmo nome
        $originalFilename = $file->getClientOriginalName();
        $displayName = pathinfo($originalFilename, PATHINFO_FILENAME);

        $exists = $this->documentRepository->existsByNameForUser($originalFilename, $user->id, $displayName);

        if ($exists) {
            if ($forceOverwrite) {
                // Se force_overwrite é true, deleta o antigo
                $existingDocument = $this->documentRepository->findByFilenameForUser($originalFilename, $user->id);
                if ($existingDocument) {
                    $this->documentRepository->delete($existingDocument);
                }
            } else {
                // Se não tem force_overwrite, retorna erro
                throw new \InvalidArgumentException(
                    "A document with the name '{$displayName}' already exists. Use force_overwrite=true to replace it."
                );
            }
        }

        // Get document type and validate ownership
        $documentType = $this->documentTypeRepository->findById($documentTypeId);

        if (! $documentType || $documentType->user_id !== $user->id) {
            throw new \InvalidArgumentException('Invalid document type or you do not have permission to use it.');
        }

        $tempPath = null;

        try {
            // Store temporarily for extraction
            $tempPath = $file->store('temp', 'local');

            // Extract text from document
            $text = $this->textExtractor->extract($file);

            // Get schema from document type
            $schema = $documentType->schema ?? ['fields' => []];

            // Extract data using schema
            $result = $this->extractionService->extract($text, $schema);

            $extractedData = $result['data'];
            if (isset($result['confidence']) && is_int($result['confidence'])) {
                $extractedData['confidence'] = $result['confidence'];
            }

            // Store file permanently
            $filePath = $this->storeFile($file, $user->id);

            // Delete temporary file
            if ($tempPath) {
                Storage::disk('local')->delete($tempPath);
            }

            // Create document with extracted data
            $document = $this->documentRepository->create([
                'user_id' => $user->id,
                'organization_id' => $user->organization_id,
                'document_type_id' => $documentTypeId,
                'name' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
                'original_filename' => $file->getClientOriginalName(),
                'file_path' => $filePath,
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'type' => 'predefined',
                'status' => 'completed',
                'schema_used' => $schema,
                'extracted_data' => $extractedData,
                'processed_at' => now(),
            ]);

            Log::info('Document extracted and stored', [
                'user_id' => $user->id,
                'document_id' => $document->id,
                'document_type_id' => $documentTypeId,
                'filename' => $file->getClientOriginalName(),
            ]);

            return $document;
        } catch (\Exception $e) {
            // Clean up temporary file on error
            if ($tempPath) {
                Storage::disk('local')->delete($tempPath);
            }

            Log::error('Document extraction and storage failed', [
                'user_id' => $user->id,
                'document_type_id' => $documentTypeId,
                'error' => $e->getMessage(),
                'filename' => $file->getClientOriginalName(),
            ]);

            throw $e;
        }
    }

    /**
     * Store file permanently
     */
    private function storeFile(UploadedFile $file, int $userId): string
    {
        $filename = Str::uuid()->toString().'.'.$file->getClientOriginalExtension();

        return $file->storeAs("documents/{$userId}", $filename, 'local') ?: '';
    }
}
