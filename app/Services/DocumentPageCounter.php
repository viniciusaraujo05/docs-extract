<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Smalot\PdfParser\Parser;
use Throwable;

class DocumentPageCounter
{
    public function __construct(
        private Parser $pdfParser,
    ) {}

    public function count(UploadedFile $file): int
    {
        $mimeType = $file->getMimeType();

        if ($mimeType === 'application/pdf') {
            try {
                $pdf = $this->pdfParser->parseFile($file->getPathname());

                return count($pdf->getPages());
            } catch (Throwable $e) {
                // If parsing fails (e.g. secured PDF), try counting via Image conversion
                try {
                    $pdfService = app(\App\Services\PdfToImageService::class);
                    // Convert only first page to check if it works? No, we need count.
                    // PdfToImageService uses Imagick to getNumberImages.

                    if (class_exists('Imagick')) {
                        $imagick = new \Imagick;
                        $imagick->pingImage($file->getPathname()); // efficient, doesn't read whole file

                        return $imagick->getNumberImages();
                    }
                } catch (Throwable $imageError) {
                    // Ignore image error and return default
                }

                return 1;
            }
        }

        // For images and other supported formats, count as 1 page
        return 1;
    }
}
