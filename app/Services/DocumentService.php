<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Document;
use App\Models\ExtractionSchema;
use App\Models\User;
use App\Repositories\DocumentRepository;
use App\Services\Extraction\ExtractionStrategyFactory;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

/**
 * Service for document processing.
 *
 * Updated to use Extraction Strategies (Vision/Text).
 */
final class DocumentService
{
    public function __construct(
        private readonly DocumentRepository $documentRepository,
        private readonly ExtractionStrategyFactory $extractionStrategyFactory
    ) {}

    public function upload(UploadedFile $file, User $user, string $type = 'invoice', ?array $schema = null): Document
    {
        $filename = Str::uuid().'.'.$file->getClientOriginalExtension();
        $path = $file->storeAs('documents/'.$user->id, $filename, 'local');

        $schemaToUse = $schema ?? $this->getDefaultSchema($type);

        return $this->documentRepository->create([
            'user_id' => $user->id,
            'organization_id' => $user->organization_id,
            'name' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
            'original_filename' => $file->getClientOriginalName(),
            'file_path' => $path,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'type' => $type,
            'status' => 'pending',
            'schema_used' => $schemaToUse,
        ]);
    }

    public function getDefaultSchema(string $type): array
    {
        return match ($type) {
            'invoice' => ExtractionSchema::getDefaultInvoiceSchema(),
            'receipt' => ExtractionSchema::getDefaultReceiptSchema(),
            'market_report' => ExtractionSchema::getDefaultMarketReportSchema(),
            default => ['fields' => []],
        };
    }

    public function processDocument(Document $document): Document
    {
        $document->markAsProcessing();

        try {
            // Get appropriate strategy
            $strategy = $this->extractionStrategyFactory->getStrategy($document);
            
            Log::info("Processing document {$document->id} using " . get_class($strategy));

            $result = $strategy->extract(
                $document, 
                $document->schema_used ?? $this->getDefaultSchema($document->type)
            );

            // Save raw text if available
            if (!empty($result['raw_text'])) {
                $this->documentRepository->update($document, ['raw_text' => $result['raw_text']]);
            }

            $document->markAsCompleted(
                $result['data']
            );

            $document->increment('credits_used');
        } catch (\Exception $e) {
            Log::error("Document processing failed: " . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            $document->markAsFailed($e->getMessage());
        }

        return $document->fresh();
    }

    public function updateExtractedData(Document $document, array $data): Document
    {
        $this->documentRepository->update($document, [
            'extracted_data' => $data,
        ]);

        return $document->fresh();
    }

    public function reprocess(Document $document, ?array $newSchema = null): Document
    {
        if ($newSchema) {
            $this->documentRepository->update($document, ['schema_used' => $newSchema]);
        }

        return $this->processDocument($document);
    }

    public function delete(Document $document): bool
    {
        Storage::disk('local')->delete($document->file_path);

        return $this->documentRepository->delete($document);
    }
    
    // Kept for backward compatibility if needed, but should be deprecated
    public function extractText(Document $document): string
    {
        // This method is now legacy as extraction is handled by strategies which might not just produce text
        // But for UI "preview" purposes, we might still want it.
        // For now, return empty or implement a simple reader.
        return ""; 
    }
}
