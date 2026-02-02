// Force rebuild
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChartCard, StatsCard, type ChartType } from '@/components/charts';
import { ReportConfigurator } from '@/components/reports/ReportConfigurator';
import { CalculatedFieldBuilder, type CalculatedField } from '@/components/reports/CalculatedFieldBuilder';
import { ReportTableView } from '@/components/reports/ReportTableView';
import { AIAnalysisModal } from '@/components/reports/AIAnalysisModal';
import { TablesView } from '@/components/reports/TablesView';
import { ExportChartsPDFButton } from '@/components/export-charts-pdf-button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Download, FileText, BarChart3, Calculator, Loader2, Settings2, Table2, PieChart, Palette, Sparkles, Database } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import { extractTableFields } from '@/utils/tableFieldProcessor';
import { flattenReportData, groupFlattenedData } from '@/utils/reportDataFlattener';
import { Badge } from '@/components/ui/badge';

import { FirstExtractionModal } from '@/components/first-extraction-modal';
import { usePage } from '@inertiajs/react';

interface SchemaField {
    name: string;
    label: string;
    type: 'string' | 'number' | 'date' | 'boolean' | 'array';
    items?: SchemaField[]; // For array fields
}

interface DocumentType {
    id: number;
    name: string;
    slug: string;
    fields: SchemaField[];
    documents_count: number;
}

interface AggregatedField {
    label: string;
    type: string;
    count: number;
    sum?: number;
    avg?: number;
    min?: number;
    max?: number;
    values?: number[];
    distribution?: Record<string, number>;
    uniqueCount?: number;
    byMonth?: Record<string, number>;
}

interface ReportData {
    documentType: {
        id: number;
        name: string;
        fields: SchemaField[];
    };
    documents: Array<{
        id: number;
        name: string;
        data: Record<string, unknown>;
        created_at: string;
    }>;
    aggregated: Record<string, AggregatedField>;
    totalDocuments: number;
}

interface ReportsIndexProps {
    documentTypes: DocumentType[];
}

// Breadcrumbs will be translated in component

const COLOR_PRESETS = [
    { name: 'Azul', value: 'hsl(var(--chart-1))' },
    { name: 'Verde', value: 'hsl(var(--chart-2))' },
    { name: 'Laranja', value: 'hsl(var(--chart-3))' },
    { name: 'Roxo', value: 'hsl(var(--chart-4))' },
    { name: 'Rosa', value: 'hsl(var(--chart-5))' },
    { name: 'Azul Escuro', value: '#8884d8' },
    { name: 'Verde Água', value: '#82ca9d' },
    { name: 'Amarelo', value: '#ffc658' },
    { name: 'Laranja Forte', value: '#ff7300' },
    { name: 'Turquesa', value: '#00C49F' },
    { name: 'Vermelho', value: '#ef4444' },
    { name: 'Índigo', value: '#6366f1' },
];

function formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-PT', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value);
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR',
    }).format(value);
}

interface FieldConfig {
    visible: boolean;
    aggregation: 'sum' | 'avg' | 'count' | 'growth' | null;
    chartType: 'bar' | 'pie' | 'line' | 'area';
}

function getDefaultConfig(fields: SchemaField[]): ReportConfig {
    const fieldConfig: Record<string, FieldConfig> = {};
    fields.forEach(field => {
        fieldConfig[field.name] = {
            visible: field.type !== 'array', // Hide arrays from main charts by default
            aggregation: field.type === 'number' ? 'sum' : null,
            chartType: field.type === 'number' ? 'bar' : field.type === 'date' ? 'line' : 'pie',
        };
    });

    return {
        fieldConfig,
        selectionMode: 'all',
        dateFrom: null,
        dateTo: null,
        selectedDocumentIds: [],
        dateGrouping: null,
        dateField: null,
        analysisMode: 'documents'
    };
}

interface ReportConfig {
    fieldConfig: Record<string, FieldConfig>;
    selectionMode: 'all' | 'filtered' | 'manual';
    dateFrom: string | null;
    dateTo: string | null;
    selectedDocumentIds: number[];
    dateGrouping: 'day' | 'month' | 'year' | null;
    dateField: string | null;
    analysisMode: string;
}

export default function ReportsIndex({ documentTypes }: ReportsIndexProps) {
    const { t } = useTranslation();
    const { auth, locale: pageLocale } = usePage<{ auth: { user: { email: string; email_verified_at: string | null } | null }; locale?: string }>().props;
    const currentLocale = pageLocale || 'en';
    
    // Check for pending subscription from registration
    useEffect(() => {
        // Only run in browser (not during SSR)
        if (typeof window === 'undefined') return;
        
        const pendingPlan = localStorage.getItem('pending_plan');
        const pendingPriceId = localStorage.getItem('pending_price_id');
        const pendingPlanName = localStorage.getItem('pending_plan_name');
        
        if (pendingPlan) {
            // Clear immediately
            localStorage.removeItem('pending_plan');
            localStorage.removeItem('pending_price_id');
            localStorage.removeItem('pending_plan_name');
            
            if (pendingPlan !== 'free' && pendingPriceId) {
                const currentPath = window.location.pathname;
                const localeMatch = currentPath.match(/^\/([a-z]{2}(?:-[A-Z]{2})?)/);
                const currentLocale = localeMatch ? localeMatch[1] : 'en';
                
                toast.info(t('Continuing to checkout...'));
                router.visit(`/${currentLocale}/subscription/checkout?price_id=${pendingPriceId}&plan_name=${pendingPlanName || ''}`);
            }
        }
    }, [t]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('Reports'), href: '/dashboard' },
    ];
    const [selectedTypeId, setSelectedTypeId] = useState<string>('');
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(false);
    const [chartTypes, setChartTypes] = useState<Record<string, ChartType>>({});
    const [chartColors, setChartColors] = useState<Record<string, string>>({});
    const [globalColor, setGlobalColor] = useState<string>(() => {
        // Load from localStorage (only in browser)
        if (typeof window === 'undefined') return 'hsl(var(--chart-1))';
        return localStorage.getItem('report-global-color') || 'hsl(var(--chart-1))';
    });
    const [showConfigurator, setShowConfigurator] = useState(false);
    const [currentConfig, setCurrentConfig] = useState<ReportConfig | null>(null);
    const [activeView, setActiveView] = useState<'charts' | 'table' | 'tables'>('charts');
    const [calculatedFields, setCalculatedFields] = useState<CalculatedField[]>([]);
    const [showAIAnalysis, setShowAIAnalysis] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<any>(null);
    const [analyzingAI, setAnalyzingAI] = useState(false);
    const [aiInstructions, setAiInstructions] = useState('');
    const [hasSavedAnalysis, setHasSavedAnalysis] = useState(false);
    const [loadingAnalysis, setLoadingAnalysis] = useState(false);

    const selectedType = documentTypes.find(t => t.id.toString() === selectedTypeId);

    // Extract table fields from documents
    const tableFields = useMemo(() => {
        if (!reportData || !selectedType) return [];
        return extractTableFields(reportData.documents, selectedType.fields);
    }, [reportData, selectedType]);

    // Auto-save global color to localStorage
    useEffect(() => {
        if (typeof window === 'undefined') return;
        localStorage.setItem('report-global-color', globalColor);
    }, [globalColor]);

    // Auto-save chart colors to localStorage
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (selectedTypeId && Object.keys(chartColors).length > 0) {
            localStorage.setItem(`report-colors-${selectedTypeId}`, JSON.stringify(chartColors));
        }
    }, [chartColors, selectedTypeId]);

    // Load chart colors from localStorage when type changes
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (selectedTypeId) {
            const saved = localStorage.getItem(`report-colors-${selectedTypeId}`);
            if (saved) {
                try {
                    setChartColors(JSON.parse(saved));
                } catch {
                    setChartColors({});
                }
            } else {
                setChartColors({});
            }
        }
    }, [selectedTypeId]);

    // Apply global color to all charts
    const handleApplyGlobalColor = useCallback(() => {
        if (!reportData) return;
        const newColors: Record<string, string> = {};
        Object.keys(reportData.aggregated).forEach(fieldName => {
            newColors[fieldName] = globalColor;
        });
        setChartColors(newColors);
        toast.success(t('Global color applied to all charts'));
    }, [reportData, globalColor]);

    // Open saved analysis or start new one
    const handleOpenAnalysis = useCallback(() => {
        if (hasSavedAnalysis && aiAnalysis) {
            setShowAIAnalysis(true);
        } else {
            // Just open modal, user will provide instructions there
            setShowAIAnalysis(true);
        }
    }, [hasSavedAnalysis, aiAnalysis]);

    // Analyze report with AI
    const handleAnalyzeWithAI = useCallback(async (instructionsToUse?: string) => {
        if (!selectedTypeId || !reportData) return;

        const finalInstructions = instructionsToUse !== undefined ? instructionsToUse : aiInstructions;

        setAnalyzingAI(true);

        try {
            const csrfToken = typeof document !== 'undefined'
                ? document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? ''
                : '';

            const response = await fetch(`/api/reports/${selectedTypeId}/analyze-ai`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    instructions: finalInstructions.trim() || null,
                }),
            });

            if (!response.ok) {
                throw new Error('Falha ao analisar relatório');
            }

            const result = await response.json();
            
            if (result.success) {
                setAiAnalysis(result.analysis);
                setHasSavedAnalysis(true);
                toast.success(t('Analysis completed successfully!'));
            } else {
                throw new Error(result.error || 'Erro desconhecido');
            }
        } catch (error: any) {
            toast.error(error.message || 'Erro ao analisar relatório com IA');
        } finally {
            setAnalyzingAI(false);
        }
    }, [selectedTypeId, reportData, aiInstructions]);

    // Get visible fields from config
    const visibleFields = useMemo(() => {
        if (!currentConfig) {
            return selectedType?.fields.map(f => f.name) || [];
        }
        return Object.entries(currentConfig.fieldConfig)
            .filter(([_, config]) => config.visible)
            .map(([name]) => name);
    }, [currentConfig, selectedType]);

    const reportExportPayload = useMemo(() => {
        if (!reportData) return null;

        const fieldLabelMap = reportData.documentType.fields.reduce<Record<string, string>>((acc, field) => {
            acc[field.name] = field.label;
            return acc;
        }, {});

        return {
            document_type: reportData.documentType.name,
            total_documents: reportData.totalDocuments,
            generated_at: new Date().toISOString(),
            filters: currentConfig
                ? {
                    date_from: currentConfig.dateFrom,
                    date_to: currentConfig.dateTo,
                    selection_mode: currentConfig.selectionMode,
                    date_grouping: currentConfig.dateGrouping,
                    date_field: currentConfig.dateField,
                    selected_document_ids: currentConfig.selectedDocumentIds,
                }
                : null,
            aggregated: reportData.aggregated,
            documents: reportData.documents.map((doc) => ({
                id: doc.id,
                name: doc.name,
                created_at: doc.created_at,
                data: visibleFields.reduce<Record<string, unknown>>((acc, fieldName) => {
                    const label = fieldLabelMap[fieldName] || fieldName;
                    acc[label] = doc.data[fieldName] ?? '';
                    return acc;
                }, {}),
            })),
        };
    }, [reportData, currentConfig, visibleFields]);

    const handleAddCalculatedField = useCallback((field: CalculatedField) => {
        setCalculatedFields(prev => [...prev, field]);
    }, []);

    const handleRemoveCalculatedField = useCallback((id: string) => {
        setCalculatedFields(prev => prev.filter(f => f.id !== id));
    }, []);

    const fetchReportData = useCallback(async (typeId: string, config?: ReportConfig) => {
        if (!typeId) return;
        
        setLoading(true);
        try {
            let url = `/api/reports/${typeId}/data`;
            let options: RequestInit = {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            };

            // If we have a config, use preview endpoint with POST
            if (config) {
                url = `/api/reports/${typeId}/preview`;
                options = {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': typeof document !== 'undefined' 
                            ? document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                            : '',
                    },
                    body: JSON.stringify({
                        field_config: config.fieldConfig,
                        selection_mode: config.selectionMode,
                        date_from: config.dateFrom,
                        date_to: config.dateTo,
                        selected_document_ids: config.selectedDocumentIds.length > 0 ? config.selectedDocumentIds : null,
                        date_grouping: config.dateGrouping,
                        date_field: config.dateField,
                    }),
                };
            }

            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error('Erro ao carregar dados');
            }
            
            const data = await response.json();
            
            // Transform preview data to match report data structure if needed
            if (config && data.fields) {
                const transformedData: ReportData = {
                    documentType: {
                        id: parseInt(typeId),
                        name: selectedType?.name || '',
                        fields: selectedType?.fields || [],
                    },
                    documents: data.sampleData || [],
                    aggregated: {},
                    totalDocuments: data.totalDocuments || 0,
                };

                // Transform fields to aggregated format
                Object.entries(data.fields).forEach(([fieldName, fieldData]: [string, any]) => {
                    transformedData.aggregated[fieldName] = {
                        label: fieldData.label,
                        type: fieldData.type,
                        count: fieldData.sampleValues?.length || 0,
                        ...(fieldData.preview || {}),
                        values: fieldData.sampleValues,
                        distribution: fieldData.preview?.topValues,
                        uniqueCount: fieldData.preview?.uniqueCount,
                    };
                });

                setReportData(transformedData);
            } else {
                setReportData(data);
            }
            
            // Initialize chart types from config or defaults
            const initialChartTypes: Record<string, ChartType> = {};
            const fieldsToProcess = config ? Object.keys(config.fieldConfig) : Object.keys(data.aggregated || {});
            
            fieldsToProcess.forEach(fieldName => {
                if (config?.fieldConfig[fieldName]) {
                    initialChartTypes[fieldName] = config.fieldConfig[fieldName].chartType;
                } else {
                    const field = data.aggregated?.[fieldName];
                    if (field?.type === 'number') {
                        initialChartTypes[fieldName] = 'bar';
                    } else if (field?.type === 'date') {
                        initialChartTypes[fieldName] = 'line';
                    } else {
                        initialChartTypes[fieldName] = 'pie';
                    }
                }
            });
            setChartTypes(initialChartTypes);
        } catch (error) {
            toast.error('Erro ao carregar relatório');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [selectedType]);

    useEffect(() => {
        if (selectedTypeId && selectedType) {
            // Auto-initialize config to show charts immediately
            const defaultConfig = getDefaultConfig(selectedType.fields);
            setCurrentConfig(defaultConfig);

            fetchReportData(selectedTypeId, defaultConfig);
            fetchLatestAnalysis(selectedTypeId);
            setShowConfigurator(false);
        } else {
            setReportData(null);
            setAiAnalysis(null);
            setHasSavedAnalysis(false);
            setCurrentConfig(null);
        }
    }, [selectedTypeId, selectedType]);

    const fetchLatestAnalysis = useCallback(async (typeId: string) => {
        setLoadingAnalysis(true);
        try {
            const response = await fetch(`/api/reports/${typeId}/latest-analysis`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.has_analysis) {
                    setHasSavedAnalysis(true);
                    setAiAnalysis(result.analysis);
                    if (result.instructions) {
                        setAiInstructions(result.instructions);
                    }
                } else {
                    setHasSavedAnalysis(false);
                    setAiAnalysis(null);
                }
            }
        } catch (error) {
            console.error(t('Error fetching saved analysis'), error);
        } finally {
            setLoadingAnalysis(false);
        }
    }, []);

    const handleConfigChange = useCallback((config: ReportConfig) => {
        setCurrentConfig(config);
    }, []);

    const handlePreviewRequest = useCallback(() => {
        if (selectedTypeId && currentConfig) {
            fetchReportData(selectedTypeId, currentConfig);
        }
    }, [selectedTypeId, currentConfig, fetchReportData]);

    const handleExportExcel = useCallback(() => {
        if (!reportData) return;

        const worksheetData = reportData.documents.map(doc => {
            const row: Record<string, unknown> = {
                'ID': doc.id,
                'Nome': doc.name,
                'Data': new Date(doc.created_at).toLocaleDateString('pt-PT'),
            };
            
            reportData.documentType.fields.forEach(field => {
                row[field.label] = doc.data[field.name] ?? '';
            });
            
            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');

        // Add summary sheet
        const summaryData: Record<string, unknown>[] = [];
        Object.entries(reportData.aggregated).forEach(([fieldName, field]) => {
            const row: Record<string, unknown> = {
                'Campo': field.label,
                'Tipo': field.type,
                'Total Registos': field.count,
            };
            
            if (field.type === 'number') {
                row['Soma'] = field.sum;
                row['Média'] = field.avg;
                row['Mínimo'] = field.min;
                row['Máximo'] = field.max;
            } else if (field.distribution) {
                row['Valores Únicos'] = field.uniqueCount;
            }
            
            summaryData.push(row);
        });

        const summarySheet = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');

        const filename = `${reportData.documentType.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, filename);
        
        toast.success('Ficheiro exportado com sucesso!');
    }, [reportData]);

    const handleChartTypeChange = useCallback((fieldName: string, type: ChartType) => {
        setChartTypes(prev => ({ ...prev, [fieldName]: type }));
    }, []);

    const getChartData = (fieldName: string, field: AggregatedField) => {
        if (field.type === 'number' && field.values) {
            return reportData?.documents.map((doc) => ({
                name: doc.name.substring(0, 15) + (doc.name.length > 15 ? '...' : ''),
                value: Number(doc.data[fieldName]) || 0,
            })) || [];
        } else if (field.type === 'date' && field.byMonth) {
            return Object.entries(field.byMonth)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([month, count]) => ({
                    name: month,
                    value: count,
                }));
        } else if (field.distribution) {
            return Object.entries(field.distribution)
                .slice(0, 10)
                .map(([name, value]) => ({
                    name: name.substring(0, 20) + (name.length > 20 ? '...' : ''),
                    value,
                }));
        }
        return [];
    };

    // Unified Chart Data Adapter
    const displayCharts = useMemo(() => {
        if (!reportData || !currentConfig) return [];

        // MODE 1: Deep Analysis (Table Items)
        if (currentConfig.analysisMode && currentConfig.analysisMode !== 'documents') {
            const arrayField = reportData.documentType.fields.find(f => f.name === currentConfig.analysisMode);
            if (!arrayField) return [];

            const flattened = flattenReportData(reportData.documents, arrayField.name);
            
            // Fields configured for charts
            // CRITICAL: We must filter specific fields for this table. 
            // The global config might contain fields from 'documents' or other tables.
            const validTableFields = new Set(arrayField.items?.map(f => f.name) || []);
            
            const chartConfigs = Object.entries(currentConfig.fieldConfig)
                .filter(([name, config]) => config.visible && config.chartType && validTableFields.has(name));
            if (chartConfigs.length === 0) {
                console.warn('[DisplayCharts] No visible chart configs match current table fields.');
                return [];
            }

            // Grouping: Determine X Axis
            // Try to find a string field in the table items to group by (e.g. Product Name)
            // Fallback to Document Name if no string field found in table items
            const itemStringFields = arrayField.items?.filter(f => f.type === 'string') || [];
            const groupByField = itemStringFields.length > 0 ? itemStringFields[0].name : '_docName';
            
            const operations = chartConfigs.map(([_, conf]) => {
                const agg = conf.aggregation || 'sum';
                return (agg === 'growth' ? 'sum' : agg) as 'sum' | 'avg' | 'count';
            });

            const groupedData = groupFlattenedData(flattened, groupByField, operations);

            return chartConfigs.map(([fieldName, config]) => {
                const fieldDef = arrayField.items?.find(f => f.name === fieldName);
                const fieldLabel = fieldDef?.label || fieldName;
                const groupByLabel = arrayField.items?.find(f => f.name === groupByField)?.label || t('Document');

                // Determine metric to show:
                // 1. If field is the grouping key itself, show Count
                // 2. If field is non-numeric (string/date), show Count
                // 3. If field is numeric, show the Aggregated Sum (value property)
                const isNumeric = fieldDef?.type === 'number';
                const useCount = fieldName === groupByField || !isNumeric;

                return {
                    id: fieldName,
                    title: `${fieldLabel} ${t('by')} ${groupByLabel}`,
                    description: `${t('Analysis of')} ${flattened.length} ${t('items')}`,
                    data: groupedData.map(d => ({ 
                        name: d.name.length > 20 ? d.name.substring(0, 20) + '...' : d.name, 
                        value: useCount ? d.count : ((d as any)[fieldName] || 0) 
                    })),
                    type: chartTypes[fieldName] || config.chartType || 'bar',
                    color: chartColors[fieldName] || '#3b82f6'
                };
            });
        }

        // MODE 2: Standard Document Analysis
        return Object.entries(reportData.aggregated).map(([fieldName, field]) => {
            // Check visibility config
            const config = currentConfig.fieldConfig[fieldName];
            if (config && !config.visible) return null;

            const chartData = getChartData(fieldName, field);
            if (chartData.length === 0) return null;

            let description = '';
            if (field.type === 'number') {
                description = `${t('Sum:')} ${formatNumber(field.sum!)} | ${t('Avg:')} ${formatNumber(field.avg!)}`;
            } else if (field.uniqueCount) {
                description = `${field.uniqueCount} ${t('unique values')}`;
            }

            return {
                id: fieldName,
                title: field.label,
                description,
                data: chartData,
                type: chartTypes[fieldName] || config?.chartType || 'bar',
                color: chartColors[fieldName] || globalColor || '#3b82f6'
            };
        }).filter((chart): chart is NonNullable<typeof chart> => chart !== null);

    }, [reportData, currentConfig, chartTypes, chartColors, globalColor, t]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Reports')} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">


                {/* First Extraction Modal - shown for new freemium users */}
                <FirstExtractionModal locale={currentLocale} />

                {/* Header */}

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{t('Reports')}</h1>
                        <p className="text-muted-foreground">
                            {t('Manage and view your processed documents')}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                        {reportData && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Palette className="mr-2 h-4 w-4" />
                                        {t('Color')}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80" align="end">
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-medium text-sm mb-2">{t('Chart Color')}</h4>
                                            <p className="text-xs text-muted-foreground mb-3">
                                                {t('Select a color to apply to all charts')}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2">
                                            {COLOR_PRESETS.map((preset) => (
                                                <button
                                                    key={preset.value}
                                                    onClick={() => setGlobalColor(preset.value)}
                                                    className="group relative h-12 w-full rounded-md border-2 transition-all hover:scale-105"
                                                    style={{ 
                                                        backgroundColor: preset.value,
                                                        borderColor: globalColor === preset.value ? 'hsl(var(--primary))' : 'transparent'
                                                    }}
                                                    title={preset.name}
                                                >
                                                    {globalColor === preset.value && (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="h-3 w-3 rounded-full bg-white shadow-md" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                        <Button 
                                            onClick={handleApplyGlobalColor}
                                            className="w-full"
                                            size="sm"
                                        >
                                            {t('Apply to All Charts')}
                                        </Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )}
                        {selectedTypeId && (
                            <Button 
                                variant={showConfigurator ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setShowConfigurator(!showConfigurator)}
                            >
                                <Settings2 className="mr-2 h-4 w-4" />
                                {t('Configure')}
                            </Button>
                        )}
                        {reportData && (
                            <div className="flex items-center gap-2">
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={handleOpenAnalysis}
                                    disabled={analyzingAI || loadingAnalysis}
                                >
                                    {analyzingAI || loadingAnalysis ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Sparkles className="mr-2 h-4 w-4" />
                                    )}
                                    {hasSavedAnalysis ? t('View AI Analysis') : t('AI Analysis')}
                                </Button>
                                {reportData && (
                                    <ExportChartsPDFButton
                                        filename={`charts_${selectedType?.slug || 'report'}`}
                                        variant="outline"
                                        size="sm"
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Type Selector */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">{t('Select Document Model')}</CardTitle>
                        <CardDescription>
                            {t('Choose a document type to view the report')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Select value={selectedTypeId} onValueChange={setSelectedTypeId}>
                            <SelectTrigger className="w-full max-w-md">
                                <SelectValue placeholder={t('Select a document model...')} />
                            </SelectTrigger>
                            <SelectContent>
                                {documentTypes.map((type) => (
                                    <SelectItem key={type.id} value={type.id.toString()}>
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            {type.name}
                                            <span className="text-muted-foreground">
                                                ({type.documents_count} {t('documents')})
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        
                        {documentTypes.length === 0 && (
                            <p className="text-sm text-muted-foreground mt-4">
                                {t('No document types found. Create documents first to generate reports.')}
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Report Configurator */}
                {showConfigurator && selectedType && (
                    <ReportConfigurator
                        documentTypeId={selectedType.id}
                        fields={selectedType.fields}
                        calculatedFields={calculatedFields}
                        onCalculatedFieldsChange={setCalculatedFields}
                        onConfigChange={handleConfigChange}
                        onPreviewRequest={handlePreviewRequest}
                        loading={loading}
                    />
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}

                {/* Report Content */}
                {reportData && !loading && (
                    <>
                        {/* Stats Overview */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <StatsCard
                                title={t('Total Documents')}
                                value={reportData.totalDocuments}
                                icon={FileText}
                            />
                            <StatsCard
                                title={t('Visible Fields')}
                                value={visibleFields.length}
                                icon={BarChart3}
                            />
                            {Object.entries(reportData.aggregated)
                                .filter(([_, field]) => field.type === 'number' && field.sum !== undefined)
                                .slice(0, 2)
                                .map(([fieldName, field]) => (
                                    <StatsCard
                                        key={fieldName}
                                        title={`Total ${field.label}`}
                                        value={formatNumber(field.sum!)}
                                        description={`Média: ${formatNumber(field.avg!)}`}
                                        icon={Calculator}
                                    />
                                ))}
                        </div>

                        {/* View Tabs */}
                        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'charts' | 'table' | 'tables')} className="w-full">
                            <div className="flex items-center justify-between mb-4">
                                <TabsList>
                                    <TabsTrigger value="charts" className="gap-2">
                                        <PieChart className="h-4 w-4" />
                                        {t('Charts')}
                                    </TabsTrigger>
                                    <TabsTrigger value="table" className="gap-2">
                                        <Table2 className="h-4 w-4" />
                                        {t('Table')}
                                    </TabsTrigger>
                                    <TabsTrigger value="tables" className="gap-2">
                                        <Database className="h-4 w-4" />
                                        {t('Tables')}
                                        {tableFields.length > 0 && (
                                            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                                                {tableFields.length}
                                            </Badge>
                                        )}
                                    </TabsTrigger>
                                </TabsList>

                                <div className="flex items-center gap-4">
                                    {/* Calculated Fields Builder - only show in table view */}
                                    {activeView === 'table' && selectedType && (
                                        <div className="text-sm text-muted-foreground">
                                            {calculatedFields.length > 0 && (
                                                <span>{calculatedFields.length} {t('calculated field(s)')}</span>
                                            )}
                                        </div>
                                    )}


                                </div>
                            </div>

                            {/* Charts View */}
                            <TabsContent value="charts" className="space-y-6 mt-0">
                                {displayCharts.length > 0 ? (
                                    <div className="grid gap-6 md:grid-cols-2" data-charts-container>
                                        {displayCharts.map((chart) => (
                                            <div key={chart.id} data-chart-card>
                                                <ChartCard
                                                    title={chart.title}
                                                    description={chart.description}
                                                    data={chart.data}
                                                    chartType={chart.type}
                                                    onChartTypeChange={(type) => handleChartTypeChange(chart.id, type)}
                                                    color={chart.color}
                                                    onColorChange={(color) => setChartColors(prev => ({ ...prev, [chart.id]: color }))}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Card>
                                        <CardContent className="flex flex-col items-center justify-center py-12">
                                            <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                            <p className="text-muted-foreground">
                                                {t('No data available to generate charts')}
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                            {/* Table View */}
                            <TabsContent value="table" className="space-y-4 mt-0">
                                <div className="grid gap-4 lg:grid-cols-4">
                                    {/* Calculated Fields Builder */}
                                    <div className="lg:col-span-1">
                                        {selectedType && (
                                            <CalculatedFieldBuilder
                                                fields={selectedType.fields}
                                                calculatedFields={calculatedFields}
                                                onAdd={handleAddCalculatedField}
                                                onRemove={handleRemoveCalculatedField}
                                            />
                                        )}
                                    </div>

                                    {/* Table */}
                                    <div className="lg:col-span-3">
                                        {selectedType && (
                                            <ReportTableView
                                                documents={reportData.documents}
                                                fields={selectedType.fields}
                                                calculatedFields={calculatedFields}
                                                visibleFields={visibleFields}
                                            />
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Tables View */}
                            <TabsContent value="tables" className="space-y-4 mt-0">
                                {selectedType && (
                                    <TablesView
                                        documents={reportData.documents}
                                        fields={selectedType.fields}
                                    />
                                )}
                            </TabsContent>
                        </Tabs>
                    </>
                )}

                {/* Empty State */}
                {!selectedTypeId && !loading && documentTypes.length > 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <BarChart3 className="h-16 w-16 text-muted-foreground/30 mb-4" />
                            <h3 className="text-lg font-medium mb-2">{t('Select a document model')}</h3>
                            <p className="text-muted-foreground text-center max-w-md">
                                {t('Choose a document type above to view detailed reports with interactive charts and statistics from extracted data.')}
                            </p>
                        </CardContent>
                    </Card>
                )}


                {/* AI Analysis Modal */}
                <AIAnalysisModal
                    open={showAIAnalysis}
                    onOpenChange={setShowAIAnalysis}
                    analysis={aiAnalysis}
                    documentTypeName={selectedType?.name || ''}
                    loading={analyzingAI}
                    onReanalyze={() => {
                        setAiAnalysis(null);
                    }}
                    onAnalyze={(instructions) => {
                        setAiInstructions(instructions);
                        handleAnalyzeWithAI(instructions);
                    }}
                    instructions={aiInstructions}
                />
            </div>
        </AppLayout>
    );
}
