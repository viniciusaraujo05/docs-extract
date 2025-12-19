import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Download, Copy, CheckCircle2, AlertCircle, TrendingUp, Lightbulb, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface AIAnalysis {
    raw_text: string;
    sections: {
        summary: string;
        insights: string;
        patterns: string;
        recommendations: string;
        warnings: string;
    };
    metadata: {
        total_documents: number;
        analyzed_at: string;
        model: string;
    };
}

interface AIAnalysisModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    analysis: AIAnalysis | null;
    documentTypeName: string;
    loading?: boolean;
}

export function AIAnalysisModal({
    open,
    onOpenChange,
    analysis,
    documentTypeName,
    loading = false,
}: AIAnalysisModalProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast.success('Copiado para a área de transferência');
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast.error('Erro ao copiar texto');
        }
    };

    const handleExport = () => {
        if (!analysis) return;

        const content = `# Análise IA - ${documentTypeName}
Gerado em: ${new Date(analysis.metadata.analyzed_at).toLocaleString('pt-PT')}
Total de documentos analisados: ${analysis.metadata.total_documents}
Modelo: ${analysis.metadata.model}

---

${analysis.raw_text}
`;

        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analise-ia-${documentTypeName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success('Análise exportada com sucesso');
    };

    const formatSection = (text: string) => {
        if (!text) return null;
        
        // Split by lines and format
        const lines = text.split('\n').filter(line => line.trim());
        
        return lines.map((line, index) => {
            // Check if it's a list item
            if (line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().match(/^\d+\./)) {
                return (
                    <li key={index} className="ml-4 text-sm text-muted-foreground leading-relaxed">
                        {line.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '')}
                    </li>
                );
            }
            
            // Regular paragraph
            return (
                <p key={index} className="text-sm text-muted-foreground leading-relaxed">
                    {line}
                </p>
            );
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Sparkles className="h-6 w-6 text-purple-500" />
                        Análise IA - {documentTypeName}
                    </DialogTitle>
                    <DialogDescription>
                        Insights e recomendações geradas por inteligência artificial
                    </DialogDescription>
                </DialogHeader>

                {loading && (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
                        <p className="text-sm text-muted-foreground">Analisando dados com IA...</p>
                        <p className="text-xs text-muted-foreground">Isso pode levar alguns segundos</p>
                    </div>
                )}

                {!loading && analysis && (
                    <div className="space-y-6">
                        {/* Metadata */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground border-b pb-4">
                            <div className="flex items-center gap-4">
                                <span>📊 {analysis.metadata.total_documents} documentos</span>
                                <span>🤖 {analysis.metadata.model}</span>
                                <span>🕐 {new Date(analysis.metadata.analyzed_at).toLocaleString('pt-PT')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCopy(analysis.raw_text)}
                                >
                                    {copied ? (
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                    ) : (
                                        <Copy className="h-4 w-4 mr-2" />
                                    )}
                                    Copiar
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleExport}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Exportar
                                </Button>
                            </div>
                        </div>

                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="grid w-full grid-cols-5">
                                <TabsTrigger value="overview">Resumo</TabsTrigger>
                                <TabsTrigger value="insights">Insights</TabsTrigger>
                                <TabsTrigger value="patterns">Padrões</TabsTrigger>
                                <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
                                <TabsTrigger value="warnings">Atenção</TabsTrigger>
                            </TabsList>

                            {/* Overview Tab */}
                            <TabsContent value="overview" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Sparkles className="h-5 w-5 text-purple-500" />
                                            Resumo Executivo
                                        </CardTitle>
                                        <CardDescription>
                                            Visão geral dos dados analisados
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {formatSection(analysis.sections.summary)}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Insights Tab */}
                            <TabsContent value="insights" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Lightbulb className="h-5 w-5 text-yellow-500" />
                                            Insights Principais
                                        </CardTitle>
                                        <CardDescription>
                                            Descobertas importantes identificadas pela IA
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {formatSection(analysis.sections.insights)}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Patterns Tab */}
                            <TabsContent value="patterns" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5 text-blue-500" />
                                            Padrões e Tendências
                                        </CardTitle>
                                        <CardDescription>
                                            Comportamentos e tendências observadas nos dados
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {formatSection(analysis.sections.patterns)}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Recommendations Tab */}
                            <TabsContent value="recommendations" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                            Recomendações Estratégicas
                                        </CardTitle>
                                        <CardDescription>
                                            Ações sugeridas baseadas na análise dos dados
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {formatSection(analysis.sections.recommendations)}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Warnings Tab */}
                            <TabsContent value="warnings" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                                            Pontos de Atenção
                                        </CardTitle>
                                        <CardDescription>
                                            Áreas que requerem atenção ou possíveis problemas
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {formatSection(analysis.sections.warnings)}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                )}

                {!loading && !analysis && (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <AlertCircle className="h-12 w-12 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Nenhuma análise disponível</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
