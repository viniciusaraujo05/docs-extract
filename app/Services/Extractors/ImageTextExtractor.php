<?php

declare(strict_types=1);

namespace App\Services\Extractors;

use App\Contracts\TextExtractorInterface;
use Illuminate\Http\Client\Response;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Extractor de texto para imagens usando OpenAI Vision API.
 *
 * Utiliza a API de visão da OpenAI para fazer OCR
 * e extrair texto de imagens de documentos.
 */
final class ImageTextExtractor implements TextExtractorInterface
{
    private const SUPPORTED_MIMES = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
    ];

    private const TIMEOUT = 120;

    private const MAX_TOKENS = 4096;

    public function extract(UploadedFile $file): string
    {
        $apiKey = $this->getApiKey();
        $path = $file->getRealPath();
        $mimeType = $file->getMimeType() ?? 'image/jpeg';

        if ($path === false) {
            throw new RuntimeException('Não foi possível acessar o ficheiro de imagem');
        }

        $fileContent = file_get_contents($path);
        if ($fileContent === false) {
            throw new RuntimeException('Não foi possível ler o ficheiro de imagem');
        }

        $base64 = base64_encode($fileContent);

        /** @var Response $response */
        $response = Http::withToken($apiKey)
            ->timeout(self::TIMEOUT)
            ->withoutVerifying()
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => config('services.openai.model', 'gpt-4o-mini'),
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => [
                            [
                                'type' => 'text',
                                'text' => 'Extract ALL text from this document image. Return only the raw text content, preserving the structure and layout. Be thorough and extract every piece of text visible.',
                            ],
                            [
                                'type' => 'image_url',
                                'image_url' => [
                                    'url' => "data:{$mimeType};base64,{$base64}",
                                    'detail' => 'high',
                                ],
                            ],
                        ],
                    ],
                ],
                'max_tokens' => self::MAX_TOKENS,
            ]);

        if ($response->successful()) {
            $text = $response->json('choices.0.message.content') ?? '';

            return $text;
        }

        $errorBody = $response->json() ?? [];
        $errorMessage = $errorBody['error']['message'] ?? $response->body();

        throw new RuntimeException("OpenAI Vision API falhou: {$errorMessage}");
    }

    public function supports(UploadedFile $file): bool
    {
        return in_array($file->getMimeType(), self::SUPPORTED_MIMES, true);
    }

    /**
     * Obtém a API key da OpenAI.
     *
     * @throws RuntimeException Se a API key não estiver configurada
     */
    private function getApiKey(): string
    {
        $apiKey = config('services.openai.api_key', '');

        if ($apiKey === '') {
            throw new RuntimeException(
                'OpenAI API key não configurada. Configure OPENAI_API_KEY no .env'
            );
        }

        return $apiKey;
    }
}
