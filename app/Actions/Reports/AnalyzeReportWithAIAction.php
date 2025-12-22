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
     * Detecta o idioma da resposta da IA.
     */
    private function detectLocale(string $text): string
    {
        // Procura por marcadores em português
        if (stripos($text, 'RESUMO EXECUTIVO') !== false) {
            return 'pt';
        }

        // Procura por marcadores em inglês
        if (stripos($text, 'EXECUTIVE SUMMARY') !== false) {
            return 'en';
        }

        // Padrão: português
        return 'pt';
    }

    /**
     * Parseia a resposta da IA em estrutura organizada.
     */
    private function parseAnalysis(string $analysisText, array $reportData): array
    {
        $locale = $this->detectLocale($analysisText);

        // Extrai seções do texto
        $sections = [
            'user_response' => $this->extractSectionMultiLang($analysisText, 'RESPOSTA ÀS INSTRUÇÕES DO USUÁRIO', 'RESPONSE TO USER INSTRUCTIONS', 'RESUMO EXECUTIVO', 'EXECUTIVE SUMMARY'),
            'summary' => $this->extractSectionMultiLang($analysisText, 'RESUMO EXECUTIVO', 'EXECUTIVE SUMMARY', 'INSIGHTS PRINCIPAIS', 'KEY INSIGHTS'),
            'insights' => $this->extractSectionMultiLang($analysisText, 'INSIGHTS PRINCIPAIS', 'KEY INSIGHTS', 'PADRÕES E TENDÊNCIAS', 'PATTERNS AND TRENDS'),
            'patterns' => $this->extractSectionMultiLang($analysisText, 'PADRÕES E TENDÊNCIAS', 'PATTERNS AND TRENDS', 'RECOMENDAÇÕES ESTRATÉGICAS', 'STRATEGIC RECOMMENDATIONS'),
            'recommendations' => $this->extractSectionMultiLang($analysisText, 'RECOMENDAÇÕES ESTRATÉGICAS', 'STRATEGIC RECOMMENDATIONS', 'PONTOS DE ATENÇÃO', 'ATTENTION POINTS'),
            'warnings' => $this->extractSectionMultiLang($analysisText, 'PONTOS DE ATENÇÃO', 'ATTENTION POINTS', null, null),
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
     * Extrai uma seção específica do texto, considerando múltiplos idiomas.
     */
    private function extractSectionMultiLang(string $text, string $startMarkerPt, string $startMarkerEn, ?string $endMarkerPt = null, ?string $endMarkerEn = null): string
    {
        $patternPt = '/##\s*'.preg_quote($startMarkerPt, '/').'\s*\n(.*?)(?=##|$)/s';
        $patternEn = '/##\s*'.preg_quote($startMarkerEn, '/').'\s*\n(.*?)(?=##|$)/s';

        if (preg_match($patternPt, $text, $matchesPt)) {
            $contentPt = trim($matchesPt[1]);

            if ($endMarkerPt !== null) {
                $endPatternPt = '/##\s*'.preg_quote($endMarkerPt, '/').'/';
                if (preg_match($endPatternPt, $contentPt, $endMatchPt, PREG_OFFSET_CAPTURE)) {
                    $contentPt = substr($contentPt, 0, $endMatchPt[0][1]);
                }
            }

            return trim($contentPt);
        } elseif (preg_match($patternEn, $text, $matchesEn)) {
            $contentEn = trim($matchesEn[1]);

            if ($endMarkerEn !== null) {
                $endPatternEn = '/##\s*'.preg_quote($endMarkerEn, '/').'/';
                if (preg_match($endPatternEn, $contentEn, $endMatchEn, PREG_OFFSET_CAPTURE)) {
                    $contentEn = substr($contentEn, 0, $endMatchEn[0][1]);
                }
            }

            return trim($contentEn);
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
