<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use JsonException;
use RuntimeException;

/**
 * Service para extração de dados estruturados de documentos.
 *
 * Utiliza a OpenAI para extrair valores de campos específicos
 * a partir do texto de um documento.
 */
final class ExtractionService
{
    private const API_URL = 'https://api.openai.com/v1/chat/completions';

    private const TEMPERATURE = 0.1;

    private const TIMEOUT = 120;

    /**
     * Extrai dados estruturados do texto de um documento.
     *
     * @param  string  $text  Texto do documento
     * @param  array{fields: array<array{name: string, type: string, label?: string}>}  $schema  Schema com campos a extrair
     * @return array{data: array<string, mixed>, confidence: int|null} Dados extraídos e confiança
     *
     * @throws RuntimeException Se a extração falhar
     */
    public function extract(string $text, array $schema): array
    {
        $apiKey = $this->getApiKey();
        $model = config('services.openai.model', 'gpt-4o-mini');
        $prompt = $this->buildPrompt($text, $schema);

        /** @var Response $response */
        $response = Http::withToken($apiKey)
            ->timeout(self::TIMEOUT)
            ->post(self::API_URL, [
                'model' => $model,
                'messages' => [
                    ['role' => 'system', 'content' => $this->getSystemPrompt()],
                    ['role' => 'user', 'content' => $prompt],
                ],
                'temperature' => self::TEMPERATURE,
                'response_format' => ['type' => 'json_object'],
            ]);

        if (! $response->successful()) {
            throw new RuntimeException(
                'OpenAI API error: '.$response->status().' '.$response->body()
            );
        }

        $content = $response->json('choices.0.message.content') ?? '';

        try {
            $data = json_decode($content, true, 512, JSON_THROW_ON_ERROR);

            return [
                'data' => $data['extracted_data'] ?? $data,
                'confidence' => $data['confidence'] ?? null,
            ];
        } catch (JsonException $e) {
            throw new RuntimeException('Resposta da IA não é JSON válido');
        }
    }

    /**
     * Obtém o prompt do sistema para extração.
     */
    private function getSystemPrompt(): string
    {
        return 'Você é um assistente especializado em extrair dados estruturados de documentos multilíngues. '.
            'PRIMEIRO identifique o idioma do documento. '.
            'Extraia os valores exatos e mantenha os dados no mesmo idioma do documento original. '.
            'Se o documento está em inglês, extraia os valores em inglês. '.
            'Se está em português, extraia em português. '.
            'Sempre responda em JSON válido, sem markdown ou texto adicional.';
    }

    /**
     * Constrói o prompt para extração de campos.
     *
     * @param  string  $text  Texto do documento
     * @param  array{fields: array<array{name: string, type: string, label?: string}>}  $schema  Schema com campos
     */
    private function buildPrompt(string $text, array $schema): string
    {
        $fieldsDescription = collect($schema['fields'] ?? [])
            ->map(fn (array $field): string => sprintf(
                '- %s (%s)%s',
                $field['name'],
                $field['type'],
                isset($field['label']) ? ": {$field['label']}" : ''
            ))
            ->implode("\n");

        return <<<PROMPT
            Extraia os seguintes campos do documento:

            CAMPOS A EXTRAIR:
            {$fieldsDescription}

            DOCUMENTO:
            {$text}

            INSTRUÇÕES:
            1. Retorne APENAS um objeto JSON válido
            2. Use null para campos não encontrados
            3. Formate datas como YYYY-MM-DD
            4. Formate números sem símbolos de moeda (ex: 1234.56)
            5. Extraia os valores EXATOS do documento
            6. MANTENHA O IDIOMA ORIGINAL: Se o documento está em inglês, os valores extraídos devem estar em inglês
            7. MANTENHA O IDIOMA ORIGINAL: Se o documento está em português, os valores extraídos devem estar em português
            8. Inclua um campo "confidence" de 0 a 100

            FORMATO DE RESPOSTA:
            {"extracted_data": {...}, "confidence": 85}
            PROMPT;
    }

    /**
     * Faz parse da resposta da OpenAI.
     *
     * @param  string|null  $content  Conteúdo JSON da resposta
     * @return array{data: array<string, mixed>, confidence: int|null}
     *
     * @throws RuntimeException Se o JSON for inválido
     */
    private function parseResponse(?string $content): array
    {
        if ($content === null) {
            throw new RuntimeException('Resposta vazia da OpenAI');
        }

        try {
            $data = json_decode($content, true, 512, JSON_THROW_ON_ERROR);

            return [
                'data' => $data['extracted_data'] ?? $data,
                'confidence' => $data['confidence'] ?? null,
            ];
        } catch (JsonException $e) {
            throw new RuntimeException('Resposta da IA não é JSON válido');
        }
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
