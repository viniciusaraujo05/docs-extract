import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { 
    Settings2, 
    Save, 
    Eye, 
    EyeOff,
    Filter, 
    Calendar,
    Hash,
    Type,
    BarChart3,
    PieChart,
    LineChart,
    AreaChart,
    Loader2,
    Trash2,
    FileText,
    Clock,
    Sparkles,
    CheckCircle2,
    Info,
    ChevronRight,
    FolderOpen,
    CalendarDays,
    ListFilter,
    Layers,
    BookmarkPlus,
    Play
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface SchemaField {
    name: string;
    label: string;
    type: 'string' | 'number' | 'date';
}

interface FieldConfig {
    visible: boolean;
    aggregation: 'sum' | 'avg' | 'count' | 'growth' | null;
    chartType: 'bar' | 'pie' | 'line' | 'area';
}

interface DocumentOption {
    id: number;
    name: string;
    filename: string;
    created_at: string;
}

interface CalculatedField {
    id: string;
    name: string;
    label: string;
    operation: 'sum' | 'subtract' | 'multiply' | 'divide' | 'average';
    sourceFields: string[];
}

interface SavedConfig {
    id: number;
    name: string;
    description: string | null;
    field_config: Record<string, FieldConfig>;
    calculated_fields: CalculatedField[] | null;
    selection_mode: 'all' | 'filtered' | 'manual';
    date_from: string | null;
    date_to: string | null;
    selected_document_ids: number[] | null;
    date_grouping: 'day' | 'month' | 'year' | null;
    date_field: string | null;
}

interface ReportConfiguratorProps {
    documentTypeId: number;
    fields: SchemaField[];
    calculatedFields: CalculatedField[];
    onCalculatedFieldsChange: (fields: CalculatedField[]) => void;
    onConfigChange: (config: {
        fieldConfig: Record<string, FieldConfig>;
        selectionMode: 'all' | 'filtered' | 'manual';
        dateFrom: string | null;
        dateTo: string | null;
        selectedDocumentIds: number[];
        dateGrouping: 'day' | 'month' | 'year' | null;
        dateField: string | null;
    }) => void;
    onPreviewRequest: () => void;
    loading?: boolean;
}

const CHART_TYPES = [
    { value: 'bar', label: 'Barras', icon: BarChart3, description: 'Ideal para comparar valores' },
    { value: 'pie', label: 'Pizza', icon: PieChart, description: 'Mostra proporções do total' },
    { value: 'line', label: 'Linha', icon: LineChart, description: 'Perfeito para tendências' },
    { value: 'area', label: 'Área', icon: AreaChart, description: 'Evolução com preenchimento' },
];

const AGGREGATIONS = [
    { value: 'sum', label: 'Soma', description: 'Soma todos os valores', icon: '∑' },
    { value: 'avg', label: 'Média', description: 'Calcula a média', icon: 'μ' },
    { value: 'count', label: 'Contagem', description: 'Conta quantos existem', icon: '#' },
    { value: 'growth', label: 'Crescimento', description: 'Variação percentual', icon: '%' },
];

const DATE_GROUPINGS = [
    { value: 'day', label: 'Diário', description: 'Agrupa por dia' },
    { value: 'month', label: 'Mensal', description: 'Agrupa por mês' },
    { value: 'year', label: 'Anual', description: 'Agrupa por ano' },
];

const SELECTION_MODES = [
    { 
        value: 'all', 
        label: 'Todos os Documentos', 
        description: 'Inclui todos os documentos deste tipo',
        icon: FolderOpen 
    },
    { 
        value: 'filtered', 
        label: 'Filtrar por Data', 
        description: 'Seleciona documentos de um período específico',
        icon: CalendarDays 
    },
    { 
        value: 'manual', 
        label: 'Seleção Manual', 
        description: 'Escolha manualmente quais documentos incluir',
        icon: ListFilter 
    },
];

function getFieldIcon(type: string) {
    switch (type) {
        case 'number': return Hash;
        case 'date': return Calendar;
        default: return Type;
    }
}

function getFieldTypeInfo(type: string) {
    switch (type) {
        case 'number': 
            return { 
                label: 'Número', 
                color: 'bg-blue-500/10 text-blue-600 border-blue-200',
                description: 'Permite cálculos como soma e média'
            };
        case 'date': 
            return { 
                label: 'Data', 
                color: 'bg-purple-500/10 text-purple-600 border-purple-200',
                description: 'Pode ser usado para agrupar por período'
            };
        default: 
            return { 
                label: 'Texto', 
                color: 'bg-gray-500/10 text-gray-600 border-gray-200',
                description: 'Mostra distribuição de valores'
            };
    }
}

export function ReportConfigurator({
    documentTypeId,
    fields,
    calculatedFields,
    onCalculatedFieldsChange,
    onConfigChange,
    onPreviewRequest,
    loading = false,
}: ReportConfiguratorProps) {
    // Field configurations
    const [fieldConfig, setFieldConfig] = useState<Record<string, FieldConfig>>(() => {
        const initial: Record<string, FieldConfig> = {};
        fields.forEach(field => {
            initial[field.name] = {
                visible: true,
                aggregation: field.type === 'number' ? 'sum' : null,
                chartType: field.type === 'number' ? 'bar' : field.type === 'date' ? 'line' : 'pie',
            };
        });
        return initial;
    });

    // Selection mode
    const [selectionMode, setSelectionMode] = useState<'all' | 'filtered' | 'manual'>('all');
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');
    const [selectedDocumentIds, setSelectedDocumentIds] = useState<number[]>([]);
    const [availableDocuments, setAvailableDocuments] = useState<DocumentOption[]>([]);
    const [loadingDocuments, setLoadingDocuments] = useState(false);

    // Date grouping
    const [dateGrouping, setDateGrouping] = useState<'day' | 'month' | 'year' | null>(null);
    const [dateField, setDateField] = useState<string | null>(null);

    // Saved configurations
    const [savedConfigs, setSavedConfigs] = useState<SavedConfig[]>([]);
    const [configName, setConfigName] = useState('');
    const [configDescription, setConfigDescription] = useState('');
    const [savingConfig, setSavingConfig] = useState(false);

    // Date fields for grouping
    const dateFields = fields.filter(f => f.type === 'date');

    // Load available documents for manual selection
    useEffect(() => {
        if (selectionMode === 'manual') {
            setLoadingDocuments(true);
            fetch(`/api/reports/${documentTypeId}/documents`, {
                headers: { 'Accept': 'application/json' },
            })
                .then(res => res.json())
                .then(data => setAvailableDocuments(data.documents || []))
                .catch(() => toast.error('Erro ao carregar documentos'))
                .finally(() => setLoadingDocuments(false));
        }
    }, [selectionMode, documentTypeId]);

    // Load saved configurations
    useEffect(() => {
        fetch(`/api/reports/${documentTypeId}/configurations`, {
            headers: { 'Accept': 'application/json' },
        })
            .then(res => res.json())
            .then(data => setSavedConfigs(data.configurations || []))
            .catch(() => {});
    }, [documentTypeId]);

    // Notify parent of config changes
    useEffect(() => {
        onConfigChange({
            fieldConfig,
            selectionMode,
            dateFrom: dateFrom || null,
            dateTo: dateTo || null,
            selectedDocumentIds,
            dateGrouping,
            dateField,
        });
    }, [fieldConfig, selectionMode, dateFrom, dateTo, selectedDocumentIds, dateGrouping, dateField, onConfigChange]);

    const handleFieldVisibilityChange = useCallback((fieldName: string, visible: boolean) => {
        setFieldConfig(prev => ({
            ...prev,
            [fieldName]: { ...prev[fieldName], visible },
        }));
    }, []);

    const handleFieldAggregationChange = useCallback((fieldName: string, aggregation: string | null) => {
        setFieldConfig(prev => ({
            ...prev,
            [fieldName]: { 
                ...prev[fieldName], 
                aggregation: aggregation as FieldConfig['aggregation'] 
            },
        }));
    }, []);

    const handleFieldChartTypeChange = useCallback((fieldName: string, chartType: string) => {
        setFieldConfig(prev => ({
            ...prev,
            [fieldName]: { 
                ...prev[fieldName], 
                chartType: chartType as FieldConfig['chartType'] 
            },
        }));
    }, []);

    const handleDocumentToggle = useCallback((docId: number) => {
        setSelectedDocumentIds(prev => 
            prev.includes(docId) 
                ? prev.filter(id => id !== docId)
                : [...prev, docId]
        );
    }, []);

    const handleSelectAllDocuments = useCallback(() => {
        setSelectedDocumentIds(availableDocuments.map(d => d.id));
    }, [availableDocuments]);

    const handleDeselectAllDocuments = useCallback(() => {
        setSelectedDocumentIds([]);
    }, []);

    const handleSaveConfig = useCallback(async () => {
        if (!configName.trim()) {
            toast.error('Insira um nome para a configuração');
            return;
        }

        setSavingConfig(true);
        try {
            const response = await fetch(`/api/reports/${documentTypeId}/configurations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    name: configName,
                    description: configDescription || null,
                    field_config: fieldConfig,
                    calculated_fields: calculatedFields.length > 0 ? calculatedFields : null,
                    selection_mode: selectionMode,
                    date_from: dateFrom || null,
                    date_to: dateTo || null,
                    selected_document_ids: selectedDocumentIds.length > 0 ? selectedDocumentIds : null,
                    date_grouping: dateGrouping,
                    date_field: dateField,
                }),
            });

            if (!response.ok) throw new Error('Erro ao salvar');

            const data = await response.json();
            setSavedConfigs(prev => [...prev, data.configuration]);
            setConfigName('');
            setConfigDescription('');
            toast.success('Configuração salva com sucesso!');
        } catch (error) {
            toast.error('Erro ao salvar configuração');
        } finally {
            setSavingConfig(false);
        }
    }, [configName, configDescription, fieldConfig, calculatedFields, selectionMode, dateFrom, dateTo, selectedDocumentIds, dateGrouping, dateField, documentTypeId]);

    const handleLoadConfig = useCallback((config: SavedConfig) => {
        setFieldConfig(config.field_config);
        setSelectionMode(config.selection_mode);
        setDateFrom(config.date_from || '');
        setDateTo(config.date_to || '');
        setSelectedDocumentIds(config.selected_document_ids || []);
        setDateGrouping(config.date_grouping);
        setDateField(config.date_field);
        // Load calculated fields
        if (config.calculated_fields) {
            onCalculatedFieldsChange(config.calculated_fields);
        }
        toast.success(`Configuração "${config.name}" carregada`);
    }, [onCalculatedFieldsChange]);

    const handleDeleteConfig = useCallback(async (configId: number) => {
        try {
            await fetch(`/api/reports/configurations/${configId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            setSavedConfigs(prev => prev.filter(c => c.id !== configId));
            toast.success('Configuração eliminada');
        } catch (error) {
            toast.error('Erro ao eliminar configuração');
        }
    }, []);

    const [activeSection, setActiveSection] = useState<'fields' | 'filters' | 'grouping' | 'saved'>('fields');

    const visibleFieldsCount = Object.values(fieldConfig).filter(c => c.visible).length;

    return (
        <Card className="border-2 border-primary/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Settings2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Configurar Relatório</CardTitle>
                            <CardDescription className="text-sm">
                                Personalize como os dados serão apresentados
                            </CardDescription>
                        </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                        {visibleFieldsCount} de {fields.length} campos
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {/* Navigation */}
                <div className="flex border-b">
                    {[
                        { id: 'fields', label: 'Campos', icon: Layers, description: 'Escolha o que mostrar' },
                        { id: 'filters', label: 'Filtros', icon: Filter, description: 'Selecione documentos' },
                        { id: 'grouping', label: 'Agrupamento', icon: Clock, description: 'Organize por período' },
                        { id: 'saved', label: 'Salvos', icon: BookmarkPlus, description: 'Configurações salvas' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSection(tab.id as typeof activeSection)}
                            className={`flex-1 p-4 text-center transition-all relative ${
                                activeSection === tab.id 
                                    ? 'bg-primary/5 text-primary' 
                                    : 'hover:bg-muted/50 text-muted-foreground'
                            }`}
                        >
                            <div className="flex flex-col items-center gap-1">
                                <tab.icon className="h-5 w-5" />
                                <span className="text-sm font-medium">{tab.label}</span>
                            </div>
                            {activeSection === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {/* Fields Section */}
                    {activeSection === 'fields' && (
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                                <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                        Como funciona?
                                    </p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                        Ative os campos que deseja ver no relatório. Para campos numéricos, 
                                        escolha como calcular (soma, média, etc.) e o tipo de gráfico.
                                    </p>
                                </div>
                            </div>

                            <ScrollArea className="h-[350px] pr-4">
                                <div className="space-y-3">
                                    {fields.map(field => {
                                        const config = fieldConfig[field.name];
                                        const FieldIcon = getFieldIcon(field.type);
                                        const typeInfo = getFieldTypeInfo(field.type);

                                        return (
                                            <div 
                                                key={field.name}
                                                className={`rounded-xl border-2 transition-all duration-200 ${
                                                    config?.visible 
                                                        ? 'border-primary/30 bg-card shadow-sm' 
                                                        : 'border-transparent bg-muted/30'
                                                }`}
                                            >
                                                <div className="p-4">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex items-start gap-3 flex-1">
                                                            <div className={`p-2 rounded-lg ${typeInfo.color} border`}>
                                                                <FieldIcon className="h-4 w-4" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="font-semibold">{field.label}</span>
                                                                    <Badge variant="outline" className={`text-xs ${typeInfo.color}`}>
                                                                        {typeInfo.label}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    {typeInfo.description}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-muted-foreground">
                                                                {config?.visible ? 'Visível' : 'Oculto'}
                                                            </span>
                                                            <Switch
                                                                checked={config?.visible ?? true}
                                                                onCheckedChange={(checked) => 
                                                                    handleFieldVisibilityChange(field.name, checked)
                                                                }
                                                            />
                                                        </div>
                                                    </div>

                                                    {config?.visible && (
                                                        <div className="mt-4 pt-4 border-t flex flex-wrap gap-3">
                                                            {field.type === 'number' && (
                                                                <div className="flex-1 min-w-[140px]">
                                                                    <Label className="text-xs text-muted-foreground mb-1.5 block">
                                                                        Cálculo
                                                                    </Label>
                                                                    <Select
                                                                        value={config?.aggregation || 'sum'}
                                                                        onValueChange={(v) => 
                                                                            handleFieldAggregationChange(field.name, v)
                                                                        }
                                                                    >
                                                                        <SelectTrigger className="h-9">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {AGGREGATIONS.map(agg => (
                                                                                <SelectItem key={agg.value} value={agg.value}>
                                                                                    <div className="flex items-center gap-2">
                                                                                        <span className="w-5 h-5 rounded bg-muted flex items-center justify-center text-xs font-bold">
                                                                                            {agg.icon}
                                                                                        </span>
                                                                                        <div>
                                                                                            <span>{agg.label}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            )}

                                                            <div className="flex-1 min-w-[140px]">
                                                                <Label className="text-xs text-muted-foreground mb-1.5 block">
                                                                    Tipo de Gráfico
                                                                </Label>
                                                                <Select
                                                                    value={config?.chartType || 'bar'}
                                                                    onValueChange={(v) => 
                                                                        handleFieldChartTypeChange(field.name, v)
                                                                    }
                                                                >
                                                                    <SelectTrigger className="h-9">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {CHART_TYPES.map(chart => (
                                                                            <SelectItem key={chart.value} value={chart.value}>
                                                                                <div className="flex items-center gap-2">
                                                                                    <chart.icon className="h-4 w-4" />
                                                                                    <span>{chart.label}</span>
                                                                                </div>
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </div>
                    )}

                    {/* Filters Section */}
                    {activeSection === 'filters' && (
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                                <Filter className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                        Filtrar Documentos
                                    </p>
                                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                        Escolha quais documentos incluir no relatório: todos, por período ou seleção manual.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-3">
                                {SELECTION_MODES.map((mode) => (
                                    <button
                                        key={mode.value}
                                        onClick={() => setSelectionMode(mode.value as typeof selectionMode)}
                                        className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                                            selectionMode === mode.value
                                                ? 'border-primary bg-primary/5'
                                                : 'border-muted hover:border-muted-foreground/30 hover:bg-muted/50'
                                        }`}
                                    >
                                        <div className={`p-2 rounded-lg ${
                                            selectionMode === mode.value 
                                                ? 'bg-primary/10 text-primary' 
                                                : 'bg-muted text-muted-foreground'
                                        }`}>
                                            <mode.icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{mode.label}</span>
                                                {selectionMode === mode.value && (
                                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {mode.description}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {selectionMode === 'filtered' && (
                                <div className="p-4 bg-muted/30 rounded-xl space-y-4">
                                    <h4 className="font-medium flex items-center gap-2">
                                        <CalendarDays className="h-4 w-4" />
                                        Período do Relatório
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Data Inicial</Label>
                                            <Input
                                                type="date"
                                                value={dateFrom}
                                                onChange={(e) => setDateFrom(e.target.value)}
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Data Final</Label>
                                            <Input
                                                type="date"
                                                value={dateTo}
                                                onChange={(e) => setDateTo(e.target.value)}
                                                className="mt-1.5"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectionMode === 'manual' && (
                                <div className="p-4 bg-muted/30 rounded-xl space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            Selecionar Documentos
                                        </h4>
                                        <Badge variant="secondary">
                                            {selectedDocumentIds.length} selecionados
                                        </Badge>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={handleSelectAllDocuments}
                                            className="flex-1"
                                        >
                                            Selecionar Todos
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={handleDeselectAllDocuments}
                                            className="flex-1"
                                        >
                                            Limpar Seleção
                                        </Button>
                                    </div>
                                    
                                    {loadingDocuments ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                        </div>
                                    ) : (
                                        <ScrollArea className="h-[200px]">
                                            <div className="space-y-2">
                                                {availableDocuments.map(doc => (
                                                    <div 
                                                        key={doc.id}
                                                        onClick={() => handleDocumentToggle(doc.id)}
                                                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                                                            selectedDocumentIds.includes(doc.id) 
                                                                ? 'bg-primary/10 border-2 border-primary/30' 
                                                                : 'bg-background border-2 border-transparent hover:bg-muted'
                                                        }`}
                                                    >
                                                        <Checkbox
                                                            checked={selectedDocumentIds.includes(doc.id)}
                                                            onCheckedChange={() => handleDocumentToggle(doc.id)}
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate">{doc.name}</p>
                                                            <p className="text-xs text-muted-foreground">{doc.created_at}</p>
                                                        </div>
                                                        {selectedDocumentIds.includes(doc.id) && (
                                                            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Grouping Section */}
                    {activeSection === 'grouping' && (
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                                <Clock className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                        Agrupar por Período
                                    </p>
                                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                        Organize os dados por dia, mês ou ano para ver tendências ao longo do tempo.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium mb-3 block">Tipo de Agrupamento</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setDateGrouping(null)}
                                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                                                !dateGrouping
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-muted hover:border-muted-foreground/30'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <EyeOff className="h-4 w-4" />
                                                <span className="font-medium">Sem Agrupamento</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Mostra todos os dados individualmente
                                            </p>
                                        </button>
                                        {DATE_GROUPINGS.map((g) => (
                                            <button
                                                key={g.value}
                                                onClick={() => setDateGrouping(g.value as typeof dateGrouping)}
                                                className={`p-4 rounded-xl border-2 text-left transition-all ${
                                                    dateGrouping === g.value
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-muted hover:border-muted-foreground/30'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    <span className="font-medium">{g.label}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {g.description}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {dateGrouping && (
                                    <div className="p-4 bg-muted/30 rounded-xl">
                                        <Label className="text-sm font-medium mb-3 block">
                                            Campo de Data para Agrupar
                                        </Label>
                                        <Select 
                                            value={dateField || 'created_at'} 
                                            onValueChange={(v) => setDateField(v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione um campo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="created_at">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        Data de Criação do Documento
                                                    </div>
                                                </SelectItem>
                                                {dateFields.map(f => (
                                                    <SelectItem key={f.name} value={f.name}>
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4" />
                                                            {f.label}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Os dados serão agrupados usando este campo de data.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Saved Section */}
                    {activeSection === 'saved' && (
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                                <BookmarkPlus className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                                        Guardar Configurações
                                    </p>
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                        Salve suas configurações favoritas para reutilizar rapidamente no futuro.
                                    </p>
                                </div>
                            </div>

                            {/* Save new config */}
                            <div className="p-4 bg-muted/30 rounded-xl space-y-4">
                                <h4 className="font-medium flex items-center gap-2">
                                    <Save className="h-4 w-4" />
                                    Salvar Configuração Atual
                                </h4>
                                <div className="space-y-3">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Nome *</Label>
                                        <Input
                                            value={configName}
                                            onChange={(e) => setConfigName(e.target.value)}
                                            placeholder="Ex: Relatório Mensal de Vendas"
                                            className="mt-1.5"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Descrição (opcional)</Label>
                                        <Input
                                            value={configDescription}
                                            onChange={(e) => setConfigDescription(e.target.value)}
                                            placeholder="Breve descrição do relatório"
                                            className="mt-1.5"
                                        />
                                    </div>
                                    <Button 
                                        onClick={handleSaveConfig} 
                                        disabled={savingConfig || !configName.trim()}
                                        className="w-full"
                                    >
                                        {savingConfig ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="mr-2 h-4 w-4" />
                                        )}
                                        Salvar
                                    </Button>
                                </div>
                            </div>

                            {/* Saved configs list */}
                            <div>
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" />
                                    Configurações Salvas
                                </h4>
                                {savedConfigs.length === 0 ? (
                                    <div className="text-center py-8 bg-muted/30 rounded-xl">
                                        <BookmarkPlus className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">
                                            Nenhuma configuração salva ainda
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Configure o relatório e salve para usar depois
                                        </p>
                                    </div>
                                ) : (
                                    <ScrollArea className="h-[200px]">
                                        <div className="space-y-2">
                                            {savedConfigs.map(config => (
                                                <div 
                                                    key={config.id}
                                                    className="flex items-center justify-between p-4 bg-background border-2 rounded-xl hover:border-primary/30 transition-all"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium truncate">{config.name}</p>
                                                        {config.description && (
                                                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                                                                {config.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1 ml-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleLoadConfig(config)}
                                                        >
                                                            <Play className="h-3 w-3 mr-1" />
                                                            Usar
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                                            onClick={() => handleDeleteConfig(config.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer with Preview Button */}
                <div className="p-4 border-t bg-muted/30">
                    <Button 
                        onClick={onPreviewRequest} 
                        disabled={loading} 
                        className="w-full h-11 text-base font-medium"
                        size="lg"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                A gerar relatório...
                            </>
                        ) : (
                            <>
                                <Play className="mr-2 h-5 w-5" />
                                Gerar Relatório
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
