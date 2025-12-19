<?php

declare(strict_types=1);

namespace App\Services\Demo;

use App\Services\Extractors\ImageTextExtractor;
use App\Services\Extractors\PdfTextExtractor;
use Illuminate\Http\UploadedFile;

/**
 * Extrai texto de documentos (PDF ou Imagem) delegando para extractors específicos.
 */
final class DocumentTextExtractor
{
    public function __construct(
        private readonly PdfTextExtractor $pdfExtractor,
        private readonly ImageTextExtractor $imageExtractor
    ) {}

    public function extract(UploadedFile $file): string
    {
        $mime = $file->getMimeType();

        if ($mime === 'application/pdf') {
            return $this->pdfExtractor->extract($file);
        }

        return $this->imageExtractor->extract($file);
    }
}
