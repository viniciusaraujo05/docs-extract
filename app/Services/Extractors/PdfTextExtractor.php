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
            // Continue to OCR if parser fails
        }

        // Fallback: tenta OCR via OpenAI Vision
        return $this->extractWithOcr($path, $file->getClientOriginalName());
    }

    public function supports(UploadedFile $file): bool
    {
        return $file->getMimeType() === 'application/pdf';
    }

    /**
     * Extrai texto usando o parser de PDF.
     */
    private function extractWithParser(string $path, string $filename): string
    {
        try {
            $parser = new Parser;
            $pdf = $parser->parseFile($path);
            $text = $pdf->getText();

            // Se não conseguiu extrair texto, pode ser PDF baseado em imagem
            // Vamos tentar OCR sem tratar como erro
            if (empty(trim($text))) {
                throw new RuntimeException('PDF baseado em imagem');
            }

            return $text;
        } catch (Throwable $e) {
            // Captura erros específicos do parser
            $errorMsg = $e->getMessage();

            if (str_contains($errorMsg, 'Secured') || str_contains($errorMsg, 'password')) {
                throw new RuntimeException('PDF protegido com senha. Por favor, remova a proteção antes de enviar.');
            }

            if (str_contains($errorMsg, 'Invalid') || str_contains($errorMsg, 'corrupt')) {
                throw new RuntimeException('PDF corrompido ou inválido. Por favor, tente outro arquivo.');
            }

            // Se for erro de "PDF baseado em imagem", repassa para tentar OCR
            if (str_contains($errorMsg, 'image-based')) {
                throw $e;
            }

            // Outros erros
            throw new RuntimeException('Erro ao processar PDF: ' . $errorMsg);
        }
    }

    /**
     * Extrai texto usando OCR via OpenAI Vision API.
     * Converte páginas do PDF em imagens e envia para a API.
     */
    private function extractWithOcr(string $path, string $filename): string
    {
        $apiKey = config('services.openai.api_key', '');

        if ($apiKey === '') {
            // Se não tem OpenAI, tenta usar Imagick para extrair texto básico
            return $this->extractWithImagick($path, $filename);
        }

        // Verifica se Imagick está disponível
        if (! class_exists('Imagick')) {
            throw new RuntimeException(
                'Extensão Imagick não está instalada. Instale com: apt-get install php-imagick ou peça ao administrador.'
            );
        }

        try {
            $images = $this->convertPdfToImages($path);

            if (empty($images)) {
                throw new RuntimeException('Não foi possível converter o PDF em imagens');
            }

            $allText = [];

            foreach ($images as $index => $imageData) {
                $pageText = $this->extractTextFromImage($imageData, $apiKey, $index + 1);
                if (! empty(trim($pageText))) {
                    $allText[] = '--- Página '.($index + 1)." ---\n".$pageText;
                }
            }

            if (empty($allText)) {
                // Retorna texto básico do Imagick como último recurso
                return $this->extractWithImagick($path, $filename);
            }

            return implode("\n\n", $allText);
        } catch (Throwable $e) {
            // Tenta extrair com Imagick como fallback
            try {
                return $this->extractWithImagick($path, $filename);
            } catch (Throwable $imagickError) {
                throw new RuntimeException(
                    'Não foi possível extrair texto do PDF. Tente converter para imagem (JPG/PNG) manualmente.'
                );
            }
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
            if (!class_exists('Imagick')) {
                throw new RuntimeException('Imagick class not available');
            }
            
            $imagick = new \Imagick;
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
            throw new RuntimeException('Falha ao converter PDF para imagens: '.$e->getMessage());
        }

        return $images;
    }

    /**
     * Extrai texto de uma imagem usando OpenAI Vision API.
     */
    private function extractTextFromImage(string $base64Image, string $apiKey, int $pageNumber): string
    {
        /** @var \Illuminate\Http\Client\Response $response */
        $response = Http::withToken($apiKey)
            ->timeout(self::VISION_TIMEOUT)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => config('services.openai.model', 'gpt-4o-mini'),
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'Você é um assistente especializado em OCR (Optical Character Recognition) para extração de texto de documentos administrativos, financeiros e comerciais. Sua função é extrair TODO o texto visível de forma precisa e estruturada, independentemente do tipo de documento.',
                    ],
                    [
                        'role' => 'user',
                        'content' => [
                            [
                                'type' => 'text',
                                'text' => 'Por favor, realize OCR nesta imagem de documento e extraia TODO o texto visível. Inclua:\n\n- Todos os campos, labels e valores\n- Números de identificação (NIF, NISS, etc)\n- Datas em qualquer formato\n- Valores monetários\n- Nomes, endereços e outras informações\n- Tabelas e listas\n\nRetorne o texto bruto preservando a estrutura original. Seja extremamente detalhado e não omita nenhuma informação visível.',
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

        if ($response->failed()) {
            $errorBody = $response->json() ?? [];
            $errorMessage = $errorBody['error']['message'] ?? $response->body();
            throw new RuntimeException("OpenAI Vision API falhou na página {$pageNumber}: {$errorMessage}");
        }

        return $response->json('choices.0.message.content') ?? '';
    }

    /**
     * Extrai texto básico usando Imagick OCR (fallback quando OpenAI não está disponível)
     */
    private function extractWithImagick(string $path, string $filename): string
    {
        if (!class_exists('Imagick')) {
            throw new RuntimeException('Imagick não está disponível');
        }

        try {
            $imagick = new \Imagick;
            $imagick->setResolution(300, 300);
            $imagick->readImage($path);
            
            // Tenta OCR básico se disponível
            if (method_exists($imagick, 'setImageAlphaChannel')) {
                $imagick->setImageAlphaChannel(\Imagick::ALPHACHANNEL_REMOVE);
            }
            
            $imagick->setImageFormat('txt');
            $text = $imagick->getImagesBlob();
            
            // Se não conseguiu extrair texto, retorna mensagem informativa
            if (empty(trim($text)) || mb_strlen(trim($text)) < 10) {
                return "Documento: {$filename}\n\n[PDF baseado em imagem - não foi possível extrair texto automaticamente]\n\nSugestão: Converta o PDF para imagem (JPG/PNG) e tente novamente.";
            }
            
            return $text;
        } catch (Throwable $e) {
            throw new RuntimeException(
                'Não foi possível processar este PDF. Converta para imagem (JPG/PNG) e tente novamente.'
            );
        } finally {
            if (isset($imagick)) {
                $imagick->clear();
                $imagick->destroy();
            }
        }
    }
}
