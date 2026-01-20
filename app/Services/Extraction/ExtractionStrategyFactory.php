<?php

declare(strict_types=1);

namespace App\Services\Extraction;

use App\Models\Document;
use App\Services\Extraction\Contracts\ExtractionStrategyInterface;
use App\Services\Extraction\Strategies\SmartPdfStrategy;
use App\Services\Extraction\Strategies\TextStrategy;
use App\Services\Extraction\Strategies\VisionStrategy;
use RuntimeException;

class ExtractionStrategyFactory
{
    public function __construct(
        private readonly VisionStrategy $visionStrategy,
        private readonly TextStrategy $textStrategy,
        private readonly SmartPdfStrategy $smartPdfStrategy
    ) {}

    public function getStrategy(Document $document): ExtractionStrategyInterface
    {
        // 1. Images -> Vision
        if (str_starts_with($document->mime_type, 'image/')) {
            return $this->visionStrategy;
        }

        // 2. PDFs -> Smart Strategy (Text -> Vision fallback)
        if ($document->mime_type === 'application/pdf') {
            return $this->smartPdfStrategy;
        }

        // 3. Fallback/Text (Plain text, etc) -> TextStrategy
        if ($this->textStrategy->supports($document)) {
            return $this->textStrategy;
        }

        // 4. Last resort -> Vision (if supported)
        if ($this->visionStrategy->supports($document)) {
            return $this->visionStrategy;
        }

        throw new RuntimeException("No suitable extraction strategy found for document type: {$document->mime_type}");
    }
}
