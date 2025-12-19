<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Document;
use App\Models\ExtractionSchema;
use App\Models\User;
use App\Repositories\DocumentRepository;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Serviço para processamento de documentos.
 * 
 * Refatorado para usar Repository Pattern.
 */
final class DocumentService
{
    public function __construct(
        private readonly DocumentRepository $documentRepository,
        private readonly ExtractionService $extractionService,
    ) {}

    public function upload(UploadedFile $file, User $user, string $type = 'invoice', ?array $schema = null): Document
    {
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('documents/' . $user->id, $filename, 'local');

        $schemaToUse = $schema ?? $this->getDefaultSchema($type);

        $document = $this->documentRepository->create([
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

        return $document;
    }

    public function getDefaultSchema(string $type): array
    {
        return match ($type) {
            'invoice' => ExtractionSchema::getDefaultInvoiceSchema(),
            'receipt' => ExtractionSchema::getDefaultReceiptSchema(),
            default => ['fields' => []],
        };
    }

    public function processDocument(Document $document): Document
    {
        $document->markAsProcessing();

        try {
            $rawText = $this->extractText($document);
            $this->documentRepository->update($document, ['raw_text' => $rawText]);

            $result = $this->extractionService->extract(
                $rawText,
                $document->schema_used ?? $this->getDefaultSchema($document->type)
            );

            $document->markAsCompleted(
                $result['data'],
                $result['confidence'] ?? null
            );

            $document->increment('credits_used');

        } catch (\Exception $e) {
            $document->markAsFailed($e->getMessage());
        }

        return $document->fresh();
    }

    public function extractText(Document $document): string
    {
        $path = Storage::disk('local')->path($document->file_path);
        
        if (str_contains($document->mime_type, 'pdf')) {
            return $this->extractTextFromPdf($path);
        }

        if (str_starts_with($document->mime_type, 'image/')) {
            return $this->extractTextFromImage($path);
        }

        return '';
    }

    private function extractTextFromPdf(string $path): string
    {
        // MVP: Usar biblioteca simples ou mock
        // Em produção, usar Smalot/PdfParser ou serviço OCR
        if (class_exists(\Smalot\PdfParser\Parser::class)) {
            $parser = new \Smalot\PdfParser\Parser();
            $pdf = $parser->parseFile($path);
            return $pdf->getText();
        }

        // Mock para desenvolvimento
        return "Texto extraído do PDF (mock).\nFatura nº 2024/001\nData: 15/12/2024\nFornecedor: Empresa ABC Lda\nNIF: 123456789\nTotal: 1230.00 EUR\nIVA: 230.00 EUR";
    }

    private function extractTextFromImage(string $path): string
    {
        // MVP: Mock - em produção usar Tesseract OCR ou serviço cloud
        return "Texto extraído da imagem (mock).\nRecibo de compra\nData: 15/12/2024\nTotal: 45.50 EUR";
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
}
