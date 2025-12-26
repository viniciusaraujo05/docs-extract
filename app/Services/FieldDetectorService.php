<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Service para detecção automática de campos em documentos.
 *
 * Utiliza a OpenAI para analisar o texto de um documento
 * e identificar campos que podem ser extraídos.
 */
final class FieldDetectorService
{
    private const TIMEOUT = 60;

    /**
     * Detecta campos extraíveis no texto do documento.
     *
     * @param  string  $text  Texto do documento a analisar
     * @return array<array{name: string, label: string, type: string}> Campos detectados
     *
     * @throws RuntimeException Se a detecção falhar
     */
    public function detect(string $text): array
    {
        $apiKey = $this->getApiKey();

        Log::info('Detecting fields with OpenAI', ['text_length' => mb_strlen($text)]);

        $response = Http::withToken($apiKey)
            ->timeout(self::TIMEOUT)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => config('services.openai.model', 'gpt-4o-mini'),
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => $this->getSystemPrompt(),
                    ],
                    [
                        'role' => 'user',
                        'content' => "Analise este documento e identifique todos os campos de dados que podem ser extraídos:\n\n{$text}",
                    ],
                ],
                'temperature' => 0.1,
                'response_format' => ['type' => 'json_object'],
            ]);

        if (! $response->successful()) {
            Log::error('OpenAI field detection failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            throw new RuntimeException("Falha ao detectar campos: {$response->status()}");
        }

        $content = $response->json('choices.0.message.content') ?? '{}';
        Log::info('OpenAI field detection response received');

        return $this->parseResponse($content);
    }

    /**
     * Retorna campos padrão quando a detecção não é possível.
     *
     * @return array<array{name: string, label: string, type: string}>
     */
    public function getDefaultFields(): array
    {
        return [
            ['name' => 'invoice_number', 'label' => 'Número do Documento', 'type' => 'string'],
            ['name' => 'date', 'label' => 'Data', 'type' => 'date'],
            ['name' => 'total', 'label' => 'Total', 'type' => 'number'],
            ['name' => 'description', 'label' => 'Descrição', 'type' => 'string'],
        ];
    }

    /**
     * Obtém o prompt do sistema para detecção de campos.
     */
    private function getSystemPrompt(): string
    {
        return <<<'PROMPT'
Você é um especialista em análise de documentos financeiros e administrativos portugueses/brasileiros.

Sua tarefa é identificar TODOS os campos de dados presentes no documento que podem ser extraídos de forma estruturada.

REGRAS IMPORTANTES:
1. Analise cuidadosamente o documento e identifique CADA campo de dado presente
2. Use nomes de campos (name) em snake_case, baseados no conteúdo real do documento
3. O label deve ser em Português, descritivo e legível
4. Identifique o tipo correto: string, number, date, boolean
5. Para valores monetários, use type "number"
6. Para datas em qualquer formato, use type "date"
7. Para campos como NIF, NISS, números de documento, use type "string"
8. Seja ABRANGENTE - capture todos os campos relevantes do documento
9. Preste atenção especial a: valores, datas, identificadores, nomes, endereços, totais, subtotais

EXEMPLOS de campos comuns em documentos portugueses:
- Recibos de vencimento: nome, nif, niss, vencimento_base, subsidio_alimentacao, irs, seguranca_social, total_bruto, total_liquido
- Faturas: numero_fatura, data_emissao, nif_cliente, nif_fornecedor, base_tributavel, iva, total
- Contratos: partes, data_inicio, data_fim, valor, clausulas

Retorne APENAS um objeto JSON válido com a estrutura:
{
  "fields": [
    {"name": "campo_exemplo", "label": "Campo Exemplo", "type": "string"},
    {"name": "valor_total", "label": "Valor Total", "type": "number"},
    {"name": "data_documento", "label": "Data do Documento", "type": "date"}
  ]
}
PROMPT;
    }

    /**
     * Faz parse da resposta da OpenAI.
     *
     * @param  string  $content  Conteúdo JSON da resposta
     * @return array<array{name: string, label: string, type: string}>
     */
    private function parseResponse(string $content): array
    {
        try {
            $data = json_decode($content, true, 512, JSON_THROW_ON_ERROR);
            $fields = $data['fields'] ?? $data;

            if (! is_array($fields) || count($fields) === 0) {
                return $this->getDefaultFields();
            }

            return array_map(fn ($f) => [
                'name' => $f['name'] ?? 'field',
                'label' => $f['label'] ?? $f['name'] ?? 'Campo',
                'type' => $f['type'] ?? 'string',
            ], $fields);
        } catch (\JsonException $e) {
            Log::warning('Failed to parse field detection response', ['error' => $e->getMessage()]);

            return $this->getDefaultFields();
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
