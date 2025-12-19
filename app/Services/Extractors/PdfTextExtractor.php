<?php

declare(strict_types=1);

namespace App\Services\Extractors;

use App\Contracts\TextExtractorInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Imagick;
use RuntimeException;
use Smalot\PdfParser\Parser;
use Throwable;

/**
 * Extractor de texto para ficheiros PDF.
 *
 * Utiliza a biblioteca smalot/pdfparser para extrair
 * texto de documentos PDF. Se falhar (PDF protegido),
 * tenta usar OCR via OpenAI Vision API.
 */
final class PdfTextExtractor implements TextExtractorInterface
{
    private const VISION_TIMEOUT = 120;

    private const MAX_TOKENS = 4096;

    private const MAX_PAGES_FOR_OCR = 5;

    /**
     * {@inheritdoc}
     */
    public function extract(UploadedFile $file): string
    {
        $path = $file->getRealPath();

        if ($path === false) {
            throw new RuntimeException('Não foi possível acessar o ficheiro PDF');
        }

        // Primeiro tenta extração normal
        try {
            $text = $this->extractWithParser($path, $file->getClientOriginalName());
            if (! empty(trim($text))) {
                return $text;
            }
        } catch (Throwable $e) {
            Log::warning('PDF parser failed, trying OCR fallback', [
                'file' => $file->getClientOriginalName(),
                'error' => $e->getMessage(),
            ]);
        }

        // Fallback: tenta OCR via OpenAI Vision
        return $this->extractWithOcr($path, $file->getClientOriginalName());
    }

    /**
     * Extrai texto usando o parser de PDF.
     */
    private function extractWithParser(string $path, string $filename): string
    {
        $parser = new Parser;
        $pdf = $parser->parseFile($path);
        $text = $pdf->getText();

        if (empty(trim($text))) {
            throw new RuntimeException('O PDF não contém texto extraível');
        }

        Log::info('PDF text extracted with parser', [
            'file' => $filename,
            'text_length' => mb_strlen($text),
        ]);

        return $text;
    }

    /**
     * Extrai texto usando OCR via OpenAI Vision API.
     * Converte páginas do PDF em imagens e envia para a API.
     */
    private function extractWithOcr(string $path, string $filename): string
    {
        $apiKey = config('services.openai.api_key', '');

        if ($apiKey === '') {
            throw new RuntimeException(
                'PDF protegido detectado. Para processar este documento, configure a API key da OpenAI (OPENAI_API_KEY) '.
                'ou remova a proteção do PDF antes de enviar.'
            );
        }

        // Verifica se Imagick está disponível
        if (! extension_loaded('imagick')) {
            throw new RuntimeException(
                'PDF protegido detectado. A extensão Imagick não está instalada para fazer OCR. '.
                'Por favor, remova a proteção do PDF antes de enviar, ou converta para imagem.'
            );
        }

        Log::info('Attempting OCR extraction for protected PDF', ['file' => $filename]);

        try {
            $images = $this->convertPdfToImages($path);

            if (empty($images)) {
                throw new RuntimeException('Não foi possível converter o PDF em imagens para OCR');
            }

            $allText = [];

            foreach ($images as $index => $imageData) {
                Log::info('Processing page with OCR', ['page' => $index + 1, 'file' => $filename]);

                $pageText = $this->extractTextFromImage($imageData, $apiKey, $index + 1);
                if (! empty(trim($pageText))) {
                    $allText[] = '--- Página '.($index + 1)." ---\n".$pageText;
                }
            }

            if (empty($allText)) {
                throw new RuntimeException('OCR não conseguiu extrair texto do PDF');
            }

            $text = implode("\n\n", $allText);

            Log::info('PDF OCR extraction successful', [
                'file' => $filename,
                'pages_processed' => count($images),
                'text_length' => mb_strlen($text),
            ]);

            return $text;
        } catch (Throwable $e) {
            Log::error('PDF OCR extraction failed', [
                'file' => $filename,
                'error' => $e->getMessage(),
            ]);

            throw new RuntimeException(
                'Não foi possível extrair texto do PDF. '.
                'O documento pode estar protegido ou corrompido. '.
                'Tente remover a proteção do PDF ou converter para imagem. '.
                'Erro: '.$e->getMessage()
            );
        }
    }

    /**
     * Converte páginas do PDF em imagens base64.
     *
     * @return array<string> Array de imagens em base64
     */
    private function convertPdfToImages(string $path): array
    {
        $images = [];

        try {
            $imagick = new Imagick;
            $imagick->setResolution(150, 150); // DPI para boa qualidade
            $imagick->readImage($path);

            $pageCount = min($imagick->getNumberImages(), self::MAX_PAGES_FOR_OCR);

            for ($i = 0; $i < $pageCount; $i++) {
                $imagick->setIteratorIndex($i);
                $imagick->setImageFormat('jpeg');
                $imagick->setImageCompressionQuality(85);

                $images[] = base64_encode($imagick->getImageBlob());
            }

            $imagick->clear();
            $imagick->destroy();

        } catch (Throwable $e) {
            Log::error('Failed to convert PDF to images', ['error' => $e->getMessage()]);
            throw new RuntimeException('Falha ao converter PDF para imagens: '.$e->getMessage());
        }

        return $images;
    }

    /**
     * Extrai texto de uma imagem usando OpenAI Vision API.
     */
    private function extractTextFromImage(string $base64Image, string $apiKey, int $pageNumber): string
    {
        $response = Http::withToken($apiKey)
            ->timeout(self::VISION_TIMEOUT)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => config('services.openai.model', 'gpt-4o-mini'),
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => [
                            [
                                'type' => 'text',
                                'text' => 'Extraia TODO o texto desta página de documento. Retorne apenas o texto bruto, preservando a estrutura e layout. Seja minucioso e extraia cada pedaço de texto visível. Mantenha números, datas e valores exatamente como aparecem.',
                            ],
                            [
                                'type' => 'image_url',
                                'image_url' => [
                                    'url' => "data:image/jpeg;base64,{$base64Image}",
                                    'detail' => 'high',
                                ],
                            ],
                        ],
                    ],
                ],
                'max_tokens' => self::MAX_TOKENS,
            ]);

        if (! $response->successful()) {
            $errorBody = $response->json() ?? [];
            $errorMessage = $errorBody['error']['message'] ?? $response->body();
            throw new RuntimeException("OpenAI Vision API falhou na página {$pageNumber}: {$errorMessage}");
        }

        return $response->json('choices.0.message.content') ?? '';
    }

    /**
     * {@inheritdoc}
     */
    public function supports(UploadedFile $file): bool
    {
        return $file->getMimeType() === 'application/pdf';
    }
}
