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
        Log::info('DocumentService::processDocument START', [
            'document_id' => $document->id,
            'mime_type' => $document->mime_type,
            'status' => $document->status
        ]);
        
        $document->markAsProcessing();

        try {
            // Get appropriate strategy
            $strategy = $this->extractionStrategyFactory->getStrategy($document);
            
            Log::info("Processing document {$document->id} using " . get_class($strategy), [
                'strategy' => get_class($strategy),
                'schema_fields_count' => count($document->schema_used['fields'] ?? [])
            ]);

            $result = $strategy->extract(
                $document, 
                $document->schema_used ?? $this->getDefaultSchema($document->type)
            );

            Log::info('DocumentService: Extraction result received', [
                'document_id' => $document->id,
                'has_data' => !empty($result['data']),
                'has_raw_text' => !empty($result['raw_text']),
                'data_keys' => array_keys($result['data'] ?? [])
            ]);

            // Save raw text if available
            if (!empty($result['raw_text'])) {
                $this->documentRepository->update($document, ['raw_text' => $result['raw_text']]);
            }

            $document->markAsCompleted(
                $result['data']
            );

            $document->increment('credits_used');
            
            Log::info('DocumentService::processDocument COMPLETED', [
                'document_id' => $document->id,
                'final_status' => $document->fresh()->status
            ]);
        } catch (\Exception $e) {
            Log::error("Document processing failed: " . $e->getMessage(), [
                'document_id' => $document->id,
                'trace' => $e->getTraceAsString()
            ]);
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
        Storage::disk(config('filesystems.default'))->delete($document->file_path);

        return $this->documentRepository->delete($document);
    }
}
