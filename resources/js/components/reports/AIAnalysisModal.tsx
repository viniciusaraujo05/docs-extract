import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ExportDataButton } from '@/components/export-data-button';
import { Sparkles, Download, Copy, CheckCircle2, AlertCircle, TrendingUp, Lightbulb, AlertTriangle, SquarePen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface AIAnalysis {
    raw_text: string;
    sections: {
        user_response?: string;
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
    onReanalyze?: () => void;
    onAnalyze?: (instructions: string) => void;
    instructions?: string;
}

const MAX_INSTRUCTIONS_LENGTH = 400;

export function AIAnalysisModal({
    open,
    onOpenChange,
    analysis,
    documentTypeName,
    loading = false,
    onReanalyze,
    onAnalyze,
    instructions = '',
}: AIAnalysisModalProps) {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);
    const [localInstructions, setLocalInstructions] = useState(instructions);
    const [showInstructionsForm, setShowInstructionsForm] = useState(false);

    useEffect(() => {
        setLocalInstructions(instructions ?? '');
    }, [instructions]);

    useEffect(() => {
        // Show instructions form only if no analysis AND not loading
        if (!analysis && !loading) {
            setShowInstructionsForm(true);
        } else if (analysis) {
            setShowInstructionsForm(false);
        }
    }, [analysis, loading]);

    const handleReanalyze = () => {
        setShowInstructionsForm(true);
        if (onReanalyze) {
            onReanalyze();
        }
    };

    const handleCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast.success(t('Copied to clipboard'));
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast.error(t('Error copying text'));
        }
    };

    const handleExport = () => {
        if (!analysis) return;

        const content = `# ${t('Intelligent Analysis')}: ${documentTypeName}
${t('Updated on')}: ${new Date(analysis.metadata.analyzed_at).toLocaleString()}
${analysis.metadata.total_documents} ${t('documents analyzed')}

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
        
        toast.success(t('Analysis exported successfully'));
    };

    const formatSection = (text: string) => {
        if (!text) return null;
        
        return text.split('\n').map((line, index) => {
            if (!line.trim()) return null;
            
            // Convert markdown bold (**text**) to HTML
            const formattedLine = line
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.+?)\*/g, '<em>$1</em>');
            
            return (
                <p 
                    key={index} 
                    className="text-base text-foreground leading-relaxed mb-2"
                    dangerouslySetInnerHTML={{ __html: formattedLine }}
                />
            );
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[50vw] w-[50vw] h-[97vh] max-h-[97vh] overflow-hidden flex flex-col p-0 gap-0">
                <DialogHeader className="px-10 pt-8 pb-6 border-b bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-950/30 dark:via-blue-950/30 dark:to-indigo-950/30 shadow-sm">
                    <div className="flex items-start justify-between">
                        <DialogTitle className="flex flex-col gap-2">
                            <span className="flex items-center gap-3 text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                <Sparkles className="h-8 w-8 text-purple-500" />
                                {t('Intelligent Analysis')}
                            </span>
                            <div className="flex flex-col gap-1">
                                <span className="text-xl font-semibold text-foreground">{documentTypeName}</span>
                                <span className="text-sm text-muted-foreground font-normal">
                                    {t('Executive report generated by AI with strategic insights')}
                                </span>
                            </div>
                        </DialogTitle>
                        {onReanalyze && !loading && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleReanalyze}
                                className="ml-4"
                            >
                                <Sparkles className="h-4 w-4 mr-2" />
                                {t('New Analysis')}
                            </Button>
                        )}
                    </div>
                </DialogHeader>

                {loading && (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
                        <p className="text-sm text-muted-foreground">{t('Analyzing data with AI')}</p>
                        <p className="text-xs text-muted-foreground">{t('This may take a few seconds')}</p>
                    </div>
                )}

                {!loading && !analysis && showInstructionsForm && onAnalyze && (
                    <div className="flex-1 overflow-y-auto px-10 py-8">
                        <Card className="border-2 border-dashed border-purple-200 dark:border-purple-800 shadow-lg">
                            <CardHeader className="space-y-3">
                                <CardTitle className="flex items-center gap-3 text-2xl">
                                    <Sparkles className="h-6 w-6 text-purple-500" />
                                    {t('Direct AI Analysis')}
                                </CardTitle>
                                <CardDescription className="text-base leading-relaxed">
                                    {t('Describe what you would like the AI to investigate')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <Textarea
                                    value={localInstructions}
                                    onChange={(e) =>
                                        setLocalInstructions(
                                            e.target.value.slice(0, MAX_INSTRUCTIONS_LENGTH)
                                        )
                                    }
                                    placeholder={t('Describe what you would like the AI to investigate')}
                                    className="min-h-[240px] text-base leading-relaxed resize-none"
                                    maxLength={MAX_INSTRUCTIONS_LENGTH}
                                />
                                <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                                    <p className="text-sm text-muted-foreground">
                                        {t('Be specific to get more relevant insights')}
                                    </p>
                                    <span className="text-sm font-medium text-muted-foreground">
                                        {localInstructions.length}/{MAX_INSTRUCTIONS_LENGTH}
                                    </span>
                                </div>
                                <div className="flex justify-end gap-3 pt-6">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={() => onOpenChange(false)}
                                    >
                                        {t('Cancel')}
                                    </Button>
                                    <Button
                                        size="lg"
                                        onClick={() => onAnalyze(localInstructions.trim())}
                                        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg"
                                    >
                                        <Sparkles className="h-5 w-5 mr-2" />
                                        {t('Start Intelligent Analysis')}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {!loading && analysis && !showInstructionsForm && (
                    <div className="flex-1 overflow-y-auto px-10 py-8 space-y-8">
                        {/* Metadata */}
                        <div className="flex flex-wrap items-center justify-between gap-6 text-sm bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl p-6 shadow-sm border">
                            <div className="flex flex-wrap items-center gap-6">
                                <span className="inline-flex items-center gap-2 font-medium">
                                    <SquarePen className="h-5 w-5 text-purple-500" />
                                    {analysis.metadata.total_documents} {t('documents analyzed')}
                                </span>
                                <span className="text-muted-foreground">{t('Updated on')} {new Date(analysis.metadata.analyzed_at).toLocaleString('pt-PT')}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => handleCopy(analysis.raw_text)}
                                    className="shadow-sm"
                                >
                                    {copied ? (
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                    ) : (
                                        <Copy className="h-4 w-4 mr-2" />
                                    )}
                                    {t('Copy')}
                                </Button>
                                <ExportDataButton
                                    data={{
                                        summary: analysis.sections.summary,
                                        insights: analysis.sections.insights,
                                        patterns: analysis.sections.patterns,
                                        recommendations: analysis.sections.recommendations,
                                        warnings: analysis.sections.warnings,
                                        ...(analysis.sections.user_response && { user_response: analysis.sections.user_response }),
                                    }}
                                    filename={`analysis_${documentTypeName.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`}
                                    variant="outline"
                                    size="default"
                                />
                                <Button
                                    variant="outline"
                                    onClick={handleExport}
                                    className="shadow-sm"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    {t('Export as Markdown')}
                                </Button>
                            </div>
                        </div>

                        <Tabs defaultValue={analysis.sections.user_response ? "user-response" : "overview"} className="w-full flex-1">
                            <TabsList className={`grid w-full h-auto bg-muted/50 p-1.5 gap-1.5 ${analysis.sections.user_response ? 'grid-cols-6' : 'grid-cols-5'}`}>
                                {analysis.sections.user_response && (
                                    <TabsTrigger value="user-response" className="text-xs px-2 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium whitespace-nowrap">
                                        🗨️ {t('Your Request')}
                                    </TabsTrigger>
                                )}
                                <TabsTrigger value="overview" className="text-xs px-2 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium whitespace-nowrap">
                                    📊 {t('Summary')}
                                </TabsTrigger>
                                <TabsTrigger value="insights" className="text-xs px-2 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium whitespace-nowrap">
                                    💡 {t('Insights')}
                                </TabsTrigger>
                                <TabsTrigger value="patterns" className="text-xs px-2 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium whitespace-nowrap">
                                    📈 {t('Patterns')}
                                </TabsTrigger>
                                <TabsTrigger value="recommendations" className="text-xs px-2 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium whitespace-nowrap">
                                    ✅ {t('Actions')}
                                </TabsTrigger>
                                <TabsTrigger value="warnings" className="text-xs px-2 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium whitespace-nowrap">
                                    ⚠️ {t('Attention')}
                                </TabsTrigger>
                            </TabsList>

                            {/* User Response Tab */}
                            {analysis.sections.user_response && (
                                <TabsContent value="user-response" className="space-y-6 mt-8">
                                    <Card className="border-2 border-purple-200 dark:border-purple-800 shadow-lg">
                                        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
                                            <CardTitle className="flex items-center gap-3 text-2xl">
                                                <Sparkles className="h-6 w-6 text-purple-500" />
                                                {t('Response to Your Request')}
                                            </CardTitle>
                                            <CardDescription className="text-base">
                                                {t('Specific analysis based on your instructions')}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-6 space-y-4">
                                            <div className="prose prose-sm max-w-none text-base leading-relaxed">
                                                {formatSection(analysis.sections.user_response)}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            )}

                            {/* Overview Tab */}
                            <TabsContent value="overview" className="space-y-6 mt-8">
                                <Card className="shadow-md">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-3 text-xl">
                                            <Sparkles className="h-6 w-6 text-purple-500" />
                                            {t('Executive Summary')}
                                        </CardTitle>
                                        <CardDescription className="text-base">
                                            {t('Overview of analyzed data')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-4">
                                        <div className="prose prose-sm max-w-none text-base leading-relaxed">
                                            {formatSection(analysis.sections.summary)}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Insights Tab */}
                            <TabsContent value="insights" className="space-y-6 mt-8">
                                <Card className="shadow-md">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-3 text-xl">
                                            <Lightbulb className="h-6 w-6 text-yellow-500" />
                                            {t('Key Insights')}
                                        </CardTitle>
                                        <CardDescription className="text-base">
                                            {t('Important discoveries identified by AI')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-4">
                                        <div className="prose prose-sm max-w-none text-base leading-relaxed">
                                            {formatSection(analysis.sections.insights)}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Patterns Tab */}
                            <TabsContent value="patterns" className="space-y-6 mt-8">
                                <Card className="shadow-md">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-3 text-xl">
                                            <TrendingUp className="h-6 w-6 text-blue-500" />
                                            {t('Identified Patterns')}
                                        </CardTitle>
                                        <CardDescription className="text-base">
                                            {t('Trends and behaviors in the data')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-4">
                                        <div className="prose prose-sm max-w-none text-base leading-relaxed">
                                            {formatSection(analysis.sections.patterns)}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Recommendations Tab */}
                            <TabsContent value="recommendations" className="space-y-6 mt-8">
                                <Card className="shadow-md">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-3 text-xl">
                                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                                            {t('Recommended Actions')}
                                        </CardTitle>
                                        <CardDescription className="text-base">
                                            {t('Actions suggested based on the analysis of the data')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-4">
                                        <div className="prose prose-sm max-w-none text-base leading-relaxed">
                                            {formatSection(analysis.sections.recommendations)}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Warnings Tab */}
                            <TabsContent value="warnings" className="space-y-6 mt-8">
                                <Card className="shadow-md border-l-4 border-l-orange-500">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-3 text-xl">
                                            <AlertTriangle className="h-6 w-6 text-orange-500" />
                                            {t('Points of Attention')}
                                        </CardTitle>
                                        <CardDescription className="text-base">
                                            {t('Risks and anomalies that require attention')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-4">
                                        <div className="prose prose-sm max-w-none text-base leading-relaxed">
                                            {formatSection(analysis.sections.warnings)}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                )}

            </DialogContent>
        </Dialog>
    );
}
