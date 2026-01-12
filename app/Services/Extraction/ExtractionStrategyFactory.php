<?php

declare(strict_types=1);

namespace App\Services\Extraction;

use App\Models\Document;
use App\Services\Extraction\Contracts\ExtractionStrategyInterface;
use App\Services\Extraction\Strategies\TextStrategy;
use App\Services\Extraction\Strategies\VisionStrategy;
use RuntimeException;

final class ExtractionStrategyFactory
{
    public function __construct(
        private readonly VisionStrategy $visionStrategy,
        private readonly TextStrategy $textStrategy
    ) {}

    public function getStrategy(Document $document): ExtractionStrategyInterface
    {
        // Priority: Vision -> Text
        
        // Priority: Text (Legacy/PDF) -> Vision (Image)
        // User requested: "when pdf follow flow that was before" -> TextStrategy
        
        if ($this->textStrategy->supports($document) && !str_starts_with($document->mime_type, 'image/')) {
             return $this->textStrategy;
        }

        if ($this->visionStrategy->supports($document)) {
            return $this->visionStrategy;
        }

        throw new RuntimeException("No suitable extraction strategy found for document type: {$document->mime_type}");
    }
}
