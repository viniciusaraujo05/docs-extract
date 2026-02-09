<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Imagick;
use RuntimeException;

class PdfToImageService
{
    /**
     * Converte PDF para imagens PNG (High Quality para OCR)
     */
    public function convertPdf(UploadedFile|string $file): array
    {
        if (! class_exists('Imagick')) {
            throw new RuntimeException('Imagick não está disponível');
        }

        $path = $file instanceof UploadedFile ? $file->getRealPath() : $file;

        if ($path === false || ! file_exists($path)) {
            throw new RuntimeException('Não foi possível acessar o arquivo');
        }

        \Illuminate\Support\Facades\Log::info('PdfToImageService: Starting conversion', [
            'path' => $path,
            'env_magick_path' => getenv('MAGICK_CONFIGURE_PATH'),
            'imagick_version' => \Imagick::getVersion()['versionString'] ?? 'unknown',
        ]);

        try {
            // 1. Contador Leve (Ping)
            $counter = new Imagick;
            $counter->pingImage($path);
            $pageCount = $counter->getNumberImages();
            $counter->clear();
            $counter->destroy();

            $images = [];

            for ($i = 0; $i < $pageCount; $i++) {
                try {
                    $imagick = new Imagick;

                    $imagick->setResolution(150, 150); // Optimized for Vision API (300dpi is too large)
                    $imagick->setColorspace(Imagick::COLORSPACE_SRGB);
                    $imagick->readImage($path.'['.$i.']');
                    $imagick->setImageBackgroundColor('white');
                    $imagick->setImageAlphaChannel(Imagick::ALPHACHANNEL_REMOVE);
                    $imagick->mergeImageLayers(Imagick::LAYERMETHOD_FLATTEN);

                    $imagick->setImageFormat('png');
                    $imagick->setImageCompressionQuality(90);

                    $tempPath = tempnam(sys_get_temp_dir(), 'pdf_img_').'.png';
                    $imagick->writeImage($tempPath);

                    if (! file_exists($tempPath) || filesize($tempPath) === 0) {
                        throw new RuntimeException("Generated image is empty or missing for page {$i}");
                    }

                    $images[] = $tempPath;

                    $imagick->clear();
                    $imagick->destroy();

                } catch (\Exception $e) {
                    throw new RuntimeException("Erro ao processar página {$i}: ".$e->getMessage());
                }
            }

            return $images;

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('PdfToImageService: Exception during conversion', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw new RuntimeException('Error converting PDF to images: '.$e->getMessage());
        }
    }

    /**
     * Cria UploadedFiles para PNG
     */
    public function createImageFiles(array $imagePaths): array
    {
        $files = [];

        foreach ($imagePaths as $index => $path) {
            if (! file_exists($path)) {
                continue;
            }

            $originalName = 'page_'.($index + 1).'.png';

            $file = new UploadedFile(
                $path,
                $originalName,
                'image/png',
                null,
                true
            );

            $files[] = $file;
        }

        return $files;
    }

    public function cleanup(array $paths): void
    {
        foreach ($paths as $path) {
            if (file_exists($path)) {
                @unlink($path);
            }
        }
    }
}
