<?php

declare(strict_types=1);

namespace App\Actions\Reports;

use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Action para análise de dados de relatório usando IA.
 *
 * Envia dados agregados para a OpenAI e recebe insights,
 * percepções e recomendações baseadas nos dados.
 */
final class AnalyzeReportWithAIAction
{
    private const API_URL = 'https://api.openai.com/v1/chat/completions';

    private const MODEL = 'gpt-4o-mini';

    private const MAX_TOKENS = 2000;

    private const TEMPERATURE = 0.7;

    /**
     * Analisa os dados do relatório usando IA.
     *
     * @param  array  $reportData  Dados agregados do relatório
     * @param  string  $documentTypeName  Nome do tipo de documento
     *
     * @return array Análise estruturada com insights e recomendações
     *
     * @throws RuntimeException Se a API falhar
     */
    public function execute(array $reportData, string $documentTypeName, ?string $customInstructions = null, ?string $locale = null): array
    {
        $apiKey = $this->getApiKey();
        $locale = $locale ?? app()->getLocale();
        $prompt = $this->buildPrompt($reportData, $documentTypeName, $customInstructions, $locale);

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.$apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(60)->post(self::API_URL, [
                'model' => self::MODEL,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => $this->getSystemPrompt($locale),
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt,
                    ],
                ],
                'temperature' => self::TEMPERATURE,
                'max_tokens' => self::MAX_TOKENS,
            ]);

            if (! $response->successful()) {
                throw new RuntimeException(
                    'Erro ao comunicar com OpenAI API: '.$response->body()
                );
            }

            $result = $response->json();
            $analysisText = $result['choices'][0]['message']['content'] ?? '';

            return $this->parseAnalysis($analysisText, $reportData);
        } catch (\Exception $e) {
            throw new RuntimeException(
                'Falha ao analisar relatório com IA: '.$e->getMessage()
            );
        }
    }

    /**
     * Obtém o prompt do sistema no idioma correto.
     */
    private function getSystemPrompt(string $locale): string
    {
        $prompts = [
            'pt' => 'Você é um analista de dados especializado em análise de documentos financeiros e empresariais. Sua função é analisar dados agregados de relatórios e fornecer insights valiosos, identificar padrões, tendências e fazer recomendações estratégicas baseadas nos dados. IMPORTANTE: Responda SEMPRE em português (pt-BR).',
            'en' => 'You are a data analyst specialized in analyzing financial and business documents. Your role is to analyze aggregated report data and provide valuable insights, identify patterns, trends, and make strategic recommendations based on the data. IMPORTANT: Always respond in English.',
        ];

        return $prompts[$locale] ?? $prompts['pt'];
    }

    /**
     * Obtém a estrutura do prompt no idioma correto.
     */
    private function getStructurePrompt(string $locale, ?string $customInstructions = null): string
    {
        $structures = [
            'pt' => [
                'intro' => "\n\nForneça análise estruturada:\n\n",
                'user_response' => "## RESPOSTA ÀS INSTRUÇÕES DO USUÁRIO\nO usuário solicitou: {instructions}\nResponda diretamente a esta solicitação com base nos dados fornecidos.\n\n",
                'summary' => "## RESUMO EXECUTIVO\n[2-3 frases sobre os dados]\n\n",
                'insights' => "## INSIGHTS PRINCIPAIS\n[Liste 4-6 insights importantes com dados específicos]\n\n",
                'patterns' => "## PADRÕES E TENDÊNCIAS\n[Identifique padrões com números e percentuais]\n\n",
                'recommendations' => "## RECOMENDAÇÕES ESTRATÉGICAS\n[4-6 ações práticas baseadas nos dados]\n\n",
                'warnings' => "## PONTOS DE ATENÇÃO\n[Problemas críticos que requerem ação imediata]\n\n",
            ],
            'en' => [
                'intro' => "\n\nProvide structured analysis:\n\n",
                'user_response' => "## RESPONSE TO USER INSTRUCTIONS\nThe user requested: {instructions}\nRespond directly to this request based on the provided data.\n\n",
                'summary' => "## EXECUTIVE SUMMARY\n[2-3 sentences about the data]\n\n",
                'insights' => "## KEY INSIGHTS\n[List 4-6 important insights with specific data]\n\n",
                'patterns' => "## PATTERNS AND TRENDS\n[Identify patterns with numbers and percentages]\n\n",
                'recommendations' => "## STRATEGIC RECOMMENDATIONS\n[4-6 practical actions based on the data]\n\n",
                'warnings' => "## ATTENTION POINTS\n[Critical problems that require immediate action]\n\n",
            ],
        ];

        $structure = $structures[$locale] ?? $structures['pt'];
        $prompt = $structure['intro'];

        if ($customInstructions) {
            $prompt .= str_replace('{instructions}', $customInstructions, $structure['user_response']);
        }

        $prompt .= $structure['summary'];
        $prompt .= $structure['insights'];
        $prompt .= $structure['patterns'];
        $prompt .= $structure['recommendations'];
        $prompt .= $structure['warnings'];

        return $prompt;
    }

    /**
     * Constrói o prompt para a IA.
     */
    private function buildPrompt(array $reportData, string $documentTypeName, ?string $customInstructions = null, string $locale = 'pt'): string
    {
        $totalDocuments = $reportData['totalDocuments'] ?? 0;
        $aggregated = $reportData['aggregated'] ?? [];

        $prompt = "Analise o relatório '{$documentTypeName}'. Use apenas os dados fornecidos, sem inventar campos.\n\n";
        $prompt .= "Total de documentos analisados: {$totalDocuments}\n\n";
        $prompt .= "Campos e dados agregados:\n";

        foreach ($aggregated as $fieldName => $field) {
            $label = $field['label'] ?? $fieldName;
            $type = $field['type'] ?? 'string';

            $prompt .= "\n**{$label}** (tipo: {$type}):\n";

            if ($type === 'number') {
                $prompt .= '- Soma total: '.($field['sum'] ?? 0)."\n";
                $prompt .= '- Média: '.($field['avg'] ?? 0)."\n";
                $prompt .= '- Mínimo: '.($field['min'] ?? 0)."\n";
                $prompt .= '- Máximo: '.($field['max'] ?? 0)."\n";
                $prompt .= '- Quantidade de valores: '.($field['count'] ?? 0)."\n";
            } elseif ($type === 'date') {
                if (! empty($field['byMonth'])) {
                    $prompt .= "- Distribuição por mês:\n";
                    foreach ($field['byMonth'] as $month => $count) {
                        $prompt .= "  * {$month}: {$count} documentos\n";
                    }
                }
            } else {
                $prompt .= '- Valores únicos: '.($field['uniqueCount'] ?? 0)."\n";
                if (! empty($field['distribution'])) {
                    $prompt .= "- Top valores:\n";
                    $count = 0;
                    foreach ($field['distribution'] as $value => $freq) {
                        if ($count++ >= 5) {
                            break;
                        }
                        $prompt .= "  * {$value}: {$freq} ocorrências\n";
                    }
                }
            }
        }

        return $prompt . $this->getStructurePrompt($locale, $customInstructions);
    }

    /**
     * Parseia a resposta da IA em estrutura organizada.
     */
    private function parseAnalysis(string $analysisText, array $reportData): array
    {
        // Extrai seções do texto
        $sections = [
            'user_response' => $this->extractSection($analysisText, 'RESPOSTA ÀS INSTRUÇÕES DO USUÁRIO', 'RESUMO EXECUTIVO'),
            'summary' => $this->extractSection($analysisText, 'RESUMO EXECUTIVO', 'INSIGHTS PRINCIPAIS'),
            'insights' => $this->extractSection($analysisText, 'INSIGHTS PRINCIPAIS', 'PADRÕES E TENDÊNCIAS'),
            'patterns' => $this->extractSection($analysisText, 'PADRÕES E TENDÊNCIAS', 'RECOMENDAÇÕES ESTRATÉGICAS'),
            'recommendations' => $this->extractSection($analysisText, 'RECOMENDAÇÕES ESTRATÉGICAS', 'PONTOS DE ATENÇÃO'),
            'warnings' => $this->extractSection($analysisText, 'PONTOS DE ATENÇÃO', null),
        ];

        return [
            'raw_text' => $analysisText,
            'sections' => $sections,
            'metadata' => [
                'total_documents' => $reportData['totalDocuments'] ?? 0,
                'analyzed_at' => now()->toISOString(),
                'model' => self::MODEL,
            ],
        ];
    }

    /**
     * Extrai uma seção específica do texto.
     */
    private function extractSection(string $text, string $startMarker, ?string $endMarker): string
    {
        $pattern = '/##\s*'.preg_quote($startMarker, '/').'\s*\n(.*?)(?=##|$)/s';

        if (preg_match($pattern, $text, $matches)) {
            $content = trim($matches[1]);

            // Se há um marcador de fim, corta até ele
            if ($endMarker !== null) {
                $endPattern = '/##\s*'.preg_quote($endMarker, '/').'/';
                if (preg_match($endPattern, $content, $endMatch, PREG_OFFSET_CAPTURE)) {
                    $content = substr($content, 0, $endMatch[0][1]);
                }
            }

            return trim($content);
        }

        return '';
    }

    /**
     * Obtém a API key do OpenAI.
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
