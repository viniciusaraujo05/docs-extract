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
     * @param array $reportData Dados agregados do relatório
     * @param string $documentTypeName Nome do tipo de documento
     * @return array Análise estruturada com insights e recomendações
     * @throws RuntimeException Se a API falhar
     */
    public function execute(array $reportData, string $documentTypeName): array
    {
        $apiKey = $this->getApiKey();
        $prompt = $this->buildPrompt($reportData, $documentTypeName);

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(60)->post(self::API_URL, [
                'model' => self::MODEL,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'Você é um analista de dados especializado em análise de documentos financeiros e empresariais. Sua função é analisar dados agregados de relatórios e fornecer insights valiosos, identificar padrões, tendências e fazer recomendações estratégicas baseadas nos dados.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'temperature' => self::TEMPERATURE,
                'max_tokens' => self::MAX_TOKENS,
            ]);

            if (!$response->successful()) {
                throw new RuntimeException(
                    'Erro ao comunicar com OpenAI API: ' . $response->body()
                );
            }

            $result = $response->json();
            $analysisText = $result['choices'][0]['message']['content'] ?? '';

            return $this->parseAnalysis($analysisText, $reportData);

        } catch (\Exception $e) {
            throw new RuntimeException(
                'Falha ao analisar relatório com IA: ' . $e->getMessage()
            );
        }
    }

    /**
     * Constrói o prompt para a IA.
     */
    private function buildPrompt(array $reportData, string $documentTypeName): string
    {
        $totalDocuments = $reportData['totalDocuments'] ?? 0;
        $aggregated = $reportData['aggregated'] ?? [];
        
        $prompt = "Analise os seguintes dados de relatório do tipo '{$documentTypeName}':\n\n";
        $prompt .= "Total de documentos analisados: {$totalDocuments}\n\n";
        $prompt .= "Campos e dados agregados:\n";

        foreach ($aggregated as $fieldName => $field) {
            $label = $field['label'] ?? $fieldName;
            $type = $field['type'] ?? 'string';
            
            $prompt .= "\n**{$label}** (tipo: {$type}):\n";
            
            if ($type === 'number') {
                $prompt .= "- Soma total: " . ($field['sum'] ?? 0) . "\n";
                $prompt .= "- Média: " . ($field['avg'] ?? 0) . "\n";
                $prompt .= "- Mínimo: " . ($field['min'] ?? 0) . "\n";
                $prompt .= "- Máximo: " . ($field['max'] ?? 0) . "\n";
                $prompt .= "- Quantidade de valores: " . ($field['count'] ?? 0) . "\n";
            } elseif ($type === 'date') {
                if (!empty($field['byMonth'])) {
                    $prompt .= "- Distribuição por mês:\n";
                    foreach ($field['byMonth'] as $month => $count) {
                        $prompt .= "  * {$month}: {$count} documentos\n";
                    }
                }
            } else {
                $prompt .= "- Valores únicos: " . ($field['uniqueCount'] ?? 0) . "\n";
                if (!empty($field['distribution'])) {
                    $prompt .= "- Top valores:\n";
                    $count = 0;
                    foreach ($field['distribution'] as $value => $freq) {
                        if ($count++ >= 5) break;
                        $prompt .= "  * {$value}: {$freq} ocorrências\n";
                    }
                }
            }
        }

        $prompt .= "\n\nPor favor, forneça uma análise estruturada nos seguintes formatos:\n\n";
        $prompt .= "## RESUMO EXECUTIVO\n[Resumo geral dos dados em 2-3 frases]\n\n";
        $prompt .= "## INSIGHTS PRINCIPAIS\n[Liste 3-5 insights mais importantes identificados nos dados]\n\n";
        $prompt .= "## PADRÕES E TENDÊNCIAS\n[Descreva padrões, tendências ou anomalias observadas]\n\n";
        $prompt .= "## RECOMENDAÇÕES ESTRATÉGICAS\n[Liste 3-5 recomendações acionáveis baseadas nos dados]\n\n";
        $prompt .= "## PONTOS DE ATENÇÃO\n[Identifique possíveis problemas ou áreas que requerem atenção]\n\n";

        return $prompt;
    }

    /**
     * Parseia a resposta da IA em estrutura organizada.
     */
    private function parseAnalysis(string $analysisText, array $reportData): array
    {
        // Extrai seções do texto
        $sections = [
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
        $pattern = '/##\s*' . preg_quote($startMarker, '/') . '\s*\n(.*?)(?=##|$)/s';
        
        if (preg_match($pattern, $text, $matches)) {
            $content = trim($matches[1]);
            
            // Se há um marcador de fim, corta até ele
            if ($endMarker !== null) {
                $endPattern = '/##\s*' . preg_quote($endMarker, '/') . '/';
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
