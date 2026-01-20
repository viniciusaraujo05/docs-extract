<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Service para detecção automática de campos em documentos.
 *
 * Utiliza a OpenAI para analisar o texto de um documento
 * e identificar campos que podem ser extraídos.
 */
class FieldDetectorService
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
        return $this->callOpenAi([
            [
                'role' => 'system',
                'content' => $this->getSystemPrompt(),
            ],
            [
                'role' => 'user',
                'content' => "Analise este documento e identifique todos os campos de dados que podem ser extraídos:\n\n{$text}",
            ],
        ]);
    }

    /**
     * Detecta campos extraíveis a partir de uma imagem.
     *
     * @param  string  $base64Image  Imagem em Base64
     */
    /**
     * Detecta campos extraíveis a partir de uma ou mais imagens.
     *
     * @param  string|array<string|array{data: string, mime: string}>  $images  Imagem em Base64 ou array de imagens
     */
    public function detectFromImage(string|array $images): array
    {
        $content = [
            [
                'type' => 'text',
                'text' => 'Analise estas imagens de documento e identifique todos os campos de dados que podem ser extraídos. Se houver múltiplas páginas, combine as informações.',
            ],
        ];

        $imgs = is_array($images) ? $images : [$images];

        foreach ($imgs as $img) {
            if (is_array($img) && isset($img['data'], $img['mime'])) {
                $url = "data:{$img['mime']};base64,{$img['data']}";
            } else {
                // Backward compatibility or simple string
                $b64 = is_array($img) ? ($img['data'] ?? '') : $img;
                $url = "data:image/jpeg;base64,{$b64}";
            }

            $content[] = [
                'type' => 'image_url',
                'image_url' => [
                    'url' => $url,
                ],
            ];
        }

        return $this->callOpenAi([
            [
                'role' => 'system',
                'content' => $this->getSystemPrompt(),
            ],
            [
                'role' => 'user',
                'content' => $content,
            ],
        ]);
    }

    private function callOpenAi(array $messages): array
    {
        $apiKey = $this->getApiKey();

        /** @var Response $response */
        $response = Http::withToken($apiKey)
            ->timeout(self::TIMEOUT)
            ->withoutVerifying()
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => config('services.openai.model', 'gpt-4o'), // Use capable model
                'messages' => $messages,
                'temperature' => 0.1,
                'response_format' => ['type' => 'json_object'],
            ]);

        if (! $response->successful()) {
            throw new RuntimeException(
                'OpenAI API error: '.$response->status().' '.$response->body()
            );
        }

        $content = $response->json('choices.0.message.content') ?? '{}';

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
Você é um especialista em análise de documentos financeiros e administrativos multilíngue.

Sua tarefa é identificar TODOS os campos de dados presentes no documento que podem ser extraídos de forma estruturada.

REGRAS IMPORTANTES:
1. PRIMEIRO, identifique o idioma principal do documento (português, inglês, espanhol, etc.)
2. CRITICAL: Use field names (name) EXACTLY as they appear in the document logic (snake_case). Do NOT normalize or translate.
   - If document says "Qty", name MUST be "qty" (not "quantity")
   - If document says "Nr.", name MUST be "nr" (not "number")
   - If document says "Valor", name MUST be "valor" (not "value")
3. The label MUST be EXACTLY as displayed in the document
4. Identifique o tipo correto: string, number, date, boolean, **array**
5. Para valores monetários, use type "number"
6. Para datas em qualquer formato, use type "date"
7. Para campos como NIF, NISS, números de documento, use type "string"
8. Seja ABRANGENTE - capture todos os campos relevantes do documento
9. Preste atenção especial a: valores, datas, identificadores, nomes, endereços, totais, subtotais

**DETECÇÃO DE TABELAS/LISTAS (MUITO IMPORTANTE):**
10. Se o documento contém TABELAS ou LISTAS REPETIDAS (ex: itens de fatura, produtos, serviços), identifique-as como campos do tipo "array"
11. Para campos do tipo "array", SEMPRE inclua a propriedade "items" com a estrutura das colunas
12. Cada item dentro de "items" deve ter: name, label, type
13. IMPORTANT: Use EXACT column headers as names. If column is "Qty", use "qty".

EXEMPLOS de campos comuns:
- Documentos em PORTUGUÊS: numero_fatura, data_emissao, nif_cliente, total_liquido
- Documentos em INGLÊS: invoice_number, issue_date, customer_id, net_total
- Documentos em ESPANHOL: numero_factura, fecha_emision, nif_cliente, total_neto

IMPORTANTE: Responda com labels NO IDIOMA DO DOCUMENTO ORIGINAL. Se o documento está em inglês, todos os labels devem estar em inglês.

Retorne APENAS um objeto JSON válido com a estrutura:
{
  "fields": [
    {"name": "campo_exemplo", "label": "Campo Exemplo", "type": "string"},
    {"name": "valor_total", "label": "Valor Total", "type": "number"},
    {"name": "data_documento", "label": "Data do Documento", "type": "date"},
    {
      "name": "line_items",
      "label": "Itens da Fatura",
      "type": "array",
      "items": [
        {"name": "description", "label": "Descrição", "type": "string"},
        {"name": "qty", "label": "Quantidade", "type": "number"},
        {"name": "unit_price", "label": "Preço Unitário", "type": "number"},
        {"name": "total", "label": "Total", "type": "number"}
      ]
    }
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

            return array_map(function ($f) {
                $field = [
                    'name' => $f['name'] ?? 'field',
                    'label' => $f['label'] ?? $f['name'] ?? 'Campo',
                    'type' => $f['type'] ?? 'string',
                ];

                // If type is array, include items structure
                if ($field['type'] === 'array' && isset($f['items']) && is_array($f['items'])) {
                    $field['items'] = array_map(fn ($item) => [
                        'name' => $item['name'] ?? 'field',
                        'label' => $item['label'] ?? $item['name'] ?? 'Field',
                        'type' => $item['type'] ?? 'string',
                    ], $f['items']);
                }

                return $field;
            }, $fields);
        } catch (\JsonException $e) {
            Log::warning('Failed to parse field detector response', [
                'error' => $e->getMessage(),
                'content_preview' => mb_substr($content, 0, 200),
            ]);

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
