<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use RuntimeException;

class PdfToImageService
{
    /**
     * Converte PDF para imagens JPG
     */
    public function convertPdf(UploadedFile $file): array
    {
        if (! class_exists('Imagick')) {
            throw new RuntimeException('Imagick não está disponível');
        }

        $path = $file->getRealPath();
        if ($path === false) {
            throw new RuntimeException('Não foi possível acessar o arquivo');
        }

        try {
            $imagick = new \Imagick;

            // Configurações de alta qualidade
            $imagick->setResolution(200, 200); // 200 DPI para bom equilíbrio
            $imagick->setColorspace(\Imagick::COLORSPACE_RGB);
            $imagick->setCompressionQuality(90);

            // Lê o PDF
            $imagick->readImage($path);

            // Converte cada página para imagem
            $images = [];
            $pageCount = $imagick->getNumberImages();

            foreach ($imagick as $index => $page) {
                $page->setImageFormat('jpg');
                $page->setImageBackgroundColor('white');
                $page->mergeImageLayers(\Imagick::LAYERMETHOD_FLATTEN);
                $page->setCompressionQuality(90);

                // Salva em arquivo temporário
                $tempPath = tempnam(sys_get_temp_dir(), 'pdf_img_').'.jpg';
                $page->writeImage($tempPath);

                $images[] = $tempPath;

                // Limita a 5 páginas para não sobrecarregar
                if ($index >= 4) {
                    break;
                }
            }

            $imagick->clear();
            $imagick->destroy();

            return $images;
        } catch (\Exception $e) {
            throw new RuntimeException('Falha ao converter PDF para imagens: '.$e->getMessage());
        }
    }

    /**
     * Cria UploadedFiles a partir dos caminhos das imagens
     */
    public function createImageFiles(array $imagePaths): array
    {
        $files = [];

        foreach ($imagePaths as $index => $path) {
            if (! file_exists($path)) {
                continue;
            }

            $fileInfo = pathinfo($path);
            $originalName = 'converted_page_'.($index + 1).'.jpg';

            $file = new UploadedFile(
                $path,
                $originalName,
                'image/jpeg',
                null,
                true
            );

            $files[] = $file;
        }

        return $files;
    }

    /**
     * Limpa arquivos temporários
     */
    public function cleanup(array $paths): void
    {
        foreach ($paths as $path) {
            if (file_exists($path)) {
                unlink($path);
            }
        }
    }
}
