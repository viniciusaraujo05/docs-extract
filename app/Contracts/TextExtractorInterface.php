<?php

declare(strict_types=1);

namespace App\Contracts;

use Illuminate\Http\UploadedFile;

/**
 * Interface para extração de texto de documentos.
 * 
 * Implementações devem extrair texto de diferentes tipos de ficheiros
 * (PDF, imagens, etc.) de forma transparente.
 */
interface TextExtractorInterface
{
    /**
     * Extrai texto de um ficheiro uploaded.
     *
     * @param UploadedFile $file Ficheiro a processar
     * @return string Texto extraído do documento
     * @throws \RuntimeException Se não for possível extrair texto
     */
    public function extract(UploadedFile $file): string;

    /**
     * Verifica se este extractor suporta o tipo de ficheiro.
     *
     * @param UploadedFile $file Ficheiro a verificar
     * @return bool True se suporta, false caso contrário
     */
    public function supports(UploadedFile $file): bool;
}
