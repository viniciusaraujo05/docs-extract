<?php

declare(strict_types=1);

namespace App\Services\Demo;

use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Infere schema de campos dinamicamente via OpenAI (versão simplificada para demo).
 */
final class SchemaInferenceService
{
    private const API_URL = 'https://api.openai.com/v1/chat/completions';

    private const TIMEOUT = 60;

    private const TEMPERATURE = 0.1;

    public function __construct(
        private readonly string $apiKey,
        private readonly string $model = 'gpt-4o-mini'
    ) {}

    /**
     * @return array{fields: array<int, array{name: string, type: string, label?: string}>}
     */
    public function infer(string $text): array
    {
        $prompt = $this->buildPrompt($text);

        $response = Http::withToken($this->apiKey)
            ->timeout(self::TIMEOUT)
            ->post(self::API_URL, [
                'model' => $this->model,
                'messages' => [
                    ['role' => 'system', 'content' => 'Você é um assistente de extração de campos. Responda SEMPRE em JSON válido, sem markdown.'],
                    ['role' => 'user', 'content' => $prompt],
                ],
                'temperature' => self::TEMPERATURE,
                'response_format' => ['type' => 'json_object'],
            ]);

        if (! $response->successful()) {
            throw new RuntimeException('Falha ao inferir schema: '.$response->status());
        }

        $content = $response->json('choices.0.message.content');
        if (! is_string($content) || $content === '') {
            throw new RuntimeException('Schema vazio retornado pela IA');
        }

        return $this->parseAndNormalize($content);
    }

    private function buildPrompt(string $text): string
    {
        return <<<PROMPT
            Analise o documento abaixo e devolva APENAS um JSON válido com um array "fields".

            Regras:
            1) Campo "name": snake_case, curto e descritivo
            2) Campo "type": um destes valores: string|number|date|boolean
            3) Campo "label": opcional (texto humano)
            4) Inclua SOMENTE campos que realmente existam no documento
            5) Não invente campos

            Documento:
            {$text}

            Formato:
            {"fields":[{"name":"invoice_number","type":"string","label":"Invoice number"}]}
            PROMPT;
    }

    /**
     * @return array{fields: array<int, array{name: string, type: string, label?: string}>}
     */
    private function parseAndNormalize(string $content): array
    {
        try {
            $decoded = json_decode($content, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException $e) {
            throw new RuntimeException('Schema inválido retornado pela IA');
        }

        $fields = $decoded['fields'] ?? [];
        if (! is_array($fields) || $fields === []) {
            return $this->fallbackSchema();
        }

        $normalized = [];
        foreach ($fields as $field) {
            if (! is_array($field)) {
                continue;
            }

            $name = $field['name'] ?? null;
            $type = $field['type'] ?? null;

            if (! is_string($name) || ! preg_match('/^[a-z][a-z0-9_]*$/', $name)) {
                continue;
            }

            if (! is_string($type) || ! in_array($type, ['string', 'number', 'date', 'boolean'], true)) {
                $type = 'string';
            }

            $normalizedField = ['name' => $name, 'type' => $type];

            $label = $field['label'] ?? null;
            if (is_string($label) && $label !== '') {
                $normalizedField['label'] = $label;
            }

            $normalized[] = $normalizedField;
        }

        return $normalized === [] ? $this->fallbackSchema() : ['fields' => $normalized];
    }

    /**
     * @return array{fields: array<int, array{name: string, type: string, label: string}>}
     */
    private function fallbackSchema(): array
    {
        return ['fields' => [['name' => 'document_type', 'type' => 'string', 'label' => 'Document type']]];
    }
}
