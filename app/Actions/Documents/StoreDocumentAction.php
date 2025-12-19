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
    ) {}

    /**
     * Executa a ação de armazenar documento.
     */
    public function execute(
        User $user,
        UploadedFile $file,
        string $type,
        ?int $documentTypeId,
        ?string $newTypeName,
        ?array $schema,
        ?array $extractedData,
    ): Document {
        // Upload do arquivo
        $filePath = $this->storeFile($file, $user->id);

        // Cria novo tipo se necessário
        if ($type === 'new_type' && ! empty($newTypeName) && isset($schema['fields'])) {
            $newDocumentType = $this->documentTypeRepository->create([
                'user_id' => $user->id,
                'name' => $newTypeName,
                'fields' => $schema['fields'],
            ]);
            $documentTypeId = $newDocumentType->id;
            $type = 'predefined';
        }

        // Cria o documento
        $document = $this->documentRepository->create([
            'user_id' => $user->id,
            'organization_id' => $user->organization_id,
            'document_type_id' => $documentTypeId,
            'name' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
            'original_filename' => $file->getClientOriginalName(),
            'file_path' => $filePath,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'type' => $type,
            'status' => $extractedData !== null ? 'completed' : 'pending',
            'schema_used' => $schema,
            'extracted_data' => $extractedData,
            'processed_at' => $extractedData !== null ? now() : null,
        ]);

        // Dispatch job de processamento se necessário
        if ($extractedData === null) {
            ProcessDocumentJob::dispatch($document);
        }

        return $document;
    }

    /**
     * Armazena o arquivo no disco.
     */
    private function storeFile(UploadedFile $file, int $userId): string
    {
        $filename = Str::uuid()->toString().'.'.$file->getClientOriginalExtension();

        return $file->storeAs("documents/{$userId}", $filename, 'local') ?: '';
    }
}
