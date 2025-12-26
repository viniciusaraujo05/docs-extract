<?php

declare(strict_types=1);

namespace App\Services;

use App\Contracts\TextExtractorInterface;
use Illuminate\Http\UploadedFile;
use RuntimeException;

/**
 * Manager para extração de texto de documentos.
 *
 * Gerencia múltiplos extractors e seleciona o apropriado
 * baseado no tipo de ficheiro (Strategy Pattern).
 */
final class TextExtractorManager
{
    /**
     * @var array<TextExtractorInterface>
     */
    private array $extractors = [];

    /**
     * Regista um extractor.
     *
     * @param  TextExtractorInterface  $extractor  Extractor a registar
     */
    public function addExtractor(TextExtractorInterface $extractor): self
    {
        $this->extractors[] = $extractor;

        return $this;
    }

    /**
     * Extrai texto de um ficheiro usando o extractor apropriado.
     *
     * @param  UploadedFile  $file  Ficheiro a processar
     * @return string Texto extraído
     *
     * @throws RuntimeException Se nenhum extractor suportar o ficheiro
     */
    public function extract(UploadedFile $file): string
    {
        foreach ($this->extractors as $extractor) {
            if ($extractor->supports($file)) {
                return $extractor->extract($file);
            }
        }

        $mimeType = $file->getMimeType() ?? 'unknown';
        throw new RuntimeException(
            "Tipo de ficheiro não suportado: {$mimeType}. ".
            'Formatos aceites: PDF, JPG, PNG, WEBP.'
        );
    }

    /**
     * Verifica se algum extractor suporta o ficheiro.
     *
     * @param  UploadedFile  $file  Ficheiro a verificar
     */
    public function canExtract(UploadedFile $file): bool
    {
        foreach ($this->extractors as $extractor) {
            if ($extractor->supports($file)) {
                return true;
            }
        }

        return false;
    }
}
