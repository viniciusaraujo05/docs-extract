<?php

declare(strict_types=1);

namespace App\Services\Extraction\Contracts;

use App\Models\Document;

interface ExtractionStrategyInterface
{
    /**
     * Determine if this strategy supports the given document.
     */
    public function supports(Document $document): bool;

    /**
     * Extract data from the document.
     *
     * @return array{data: array<string, mixed>, confidence: int|null, raw_text?: string}
     */
    public function extract(Document $document, array $schema): array;
}
