<?php

declare(strict_types=1);

namespace App\Services\Extraction\Strategies;

use App\Models\Document;
use App\Services\Extraction\Contracts\ExtractionStrategyInterface;
use Illuminate\Support\Facades\Log;

class SmartPdfStrategy implements ExtractionStrategyInterface
{
    public function __construct(
        private readonly TextStrategy $textStrategy,
        private readonly VisionStrategy $visionStrategy
    ) {}

    public function supports(Document $document): bool
    {
        return $document->mime_type === 'application/pdf';
    }

    public function extract(Document $document, array $schema): array
    {
        try {
            // 1. Try Text Strategy first (Cheaper, Faster)
            return $this->textStrategy->extract($document, $schema);

        } catch (\Exception $e) {
            // 2. Fallback to Vision Strategy if Text fails
            // Reasons: Secured PDF, Scanned PDF (empty text), Parsing Error

            Log::warning('SmartPdfStrategy: Text extraction failed, falling back to Vision', [
                'document_id' => $document->id ?? 'temp',
                'error' => $e->getMessage(),
            ]);

            if ($this->visionStrategy->supports($document)) {
                return $this->visionStrategy->extract($document, $schema);
            }

            // If Vision not supported (unlikely for PDF), rethrow original error as ExtractionException
            throw new \App\Exceptions\ExtractionException(
                'extraction.fallback_failed',
                [],
                $e->getMessage(),
                0,
                $e
            );
        } catch (\App\Exceptions\ExtractionException $e) {
            throw $e; // Re-throw specialized exceptions
        }
    }
}
