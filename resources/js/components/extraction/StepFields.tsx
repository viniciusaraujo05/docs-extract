import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { type SchemaField, type FieldType, type DocumentType, FIELD_TYPES } from '@/types/extraction';
import { 
    ArrowLeft, 
    Loader2, 
    Plus, 
    Sparkles, 
    Wand2,
    X,
    ZoomIn,
    ZoomOut,
    Maximize2,
    FileText,
    Tag
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface StepFieldsProps {
    file: File | null;
    filePreview: string | null;
    fields: SchemaField[];
    suggestedFields: SchemaField[];
    documentTypes: DocumentType[];
    selectedTypeId: number | null;
    newTypeName: string;
    analyzing: boolean;
    processing: boolean;
    onAddField: (field: SchemaField) => void;
    onRemoveField: (name: string) => void;
    onAddAllSuggested: () => void;
    onBack: () => void;
    onExtract: () => void;
}

/**
 * Componente do Step 2 - Definição de campos
 * Permite adicionar campos manualmente ou usar sugestões da IA
 */
export function StepFields({
    file,
    filePreview,
    fields,
    suggestedFields,
    documentTypes,
    selectedTypeId,
    newTypeName,
    analyzing,
    processing,
    onAddField,
    onRemoveField,
    onAddAllSuggested,
    onBack,
    onExtract,
}: StepFieldsProps) {
    const { t } = useTranslation();
    const [newFieldName, setNewFieldName] = useState('');
    const [newFieldLabel, setNewFieldLabel] = useState('');
    const [newFieldType, setNewFieldType] = useState<FieldType>('string');
    const [zoomLevel, setZoomLevel] = useState(100);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const isPdf = file?.type === 'application/pdf';

    const availableSuggested = suggestedFields.filter(
        preset => !fields.some(f => f.name === preset.name)
    );

    const formatFieldName = (name: string): string => {
        return name.toLowerCase().replace(/\s+/g, '_');
    };

    const handleAddCustomField = useCallback(() => {
        if (!newFieldName.trim() || !newFieldLabel.trim()) return;
        
        const fieldName = formatFieldName(newFieldName);
        if (fields.some(f => f.name === fieldName)) return;
        
        onAddField({ name: fieldName, label: newFieldLabel, type: newFieldType });
        setNewFieldName('');
        setNewFieldLabel('');
        setNewFieldType('string');
    }, [fields, newFieldName, newFieldLabel, newFieldType, onAddField]);

    const handleZoomIn = useCallback(() => {
        setZoomLevel(prev => Math.min(prev + 25, 300));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoomLevel(prev => Math.max(prev - 25, 50));
    }, []);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -10 : 10;
            setZoomLevel(prev => Math.max(50, Math.min(300, prev + delta)));
        }
    }, []);

    const renderPreview = useCallback(() => {
        if (!filePreview) {
            return (
                <div className="text-center">
                    <FileText className="mx-auto h-16 w-16 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">
                        {t('No preview available')}
                    </p>
                </div>
            );
        }

        if (isPdf) {
            return (
                <iframe
                    src={`${filePreview}#toolbar=1&navpanes=1&zoom=${zoomLevel}`}
                    className="h-full w-full border-0"
                    title="PDF Preview"
                    style={{ minHeight: '600px' }}
                />
            );
        }

        return (
            <div className="flex items-center justify-center h-full w-full overflow-auto">
                <img
                    src={filePreview}
                    alt="Preview"
                    className="cursor-zoom-in transition-transform duration-200"
                    style={{ 
                        transform: `scale(${zoomLevel / 100})`,
                        imageRendering: 'high-quality',
                        maxWidth: 'none'
                    }}
                    onClick={() => setIsFullscreen(true)}
                />
            </div>
        );
    }, [filePreview, isPdf, zoomLevel, t]);

    return (
        <div className="mx-auto grid w-full max-w-5xl gap-6 animate-in fade-in-50 slide-in-from-right-4 duration-500 lg:grid-cols-2">
            {/* Fields Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        {t('Fields to Extract')}
                    </CardTitle>
                    <CardDescription>
                        {t('Define what information AI should extract from the document')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Selected Fields */}
                    <div className="space-y-2">
                        <Label>{t('Selected Fields')} ({fields.length})</Label>
                        {fields.length === 0 ? (
                            <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                                {t('Add fields below or select from AI suggestions')}
                            </p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {fields.map((field) => (
                                    <Badge
                                        key={field.name}
                                        variant="secondary"
                                        className="flex items-center gap-1 py-1.5 pl-3 pr-1 animate-in fade-in-50 zoom-in-95"
                                    >
                                        {field.label}
                                        <span className="ml-1 text-xs text-muted-foreground">
                                            ({FIELD_TYPES.find(t => t.value === field.type)?.label})
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-5 hover:bg-destructive/20"
                                            onClick={() => onRemoveField(field.name)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Add Custom Field */}
                    <div className="space-y-3">
                        <Label>{t('Add Custom Field')}</Label>
                        <div className="grid gap-2">
                            <Input
                                placeholder={t('Internal name (e.g. total_sales)')}
                                value={newFieldName}
                                onChange={(e) => setNewFieldName(e.target.value)}
                            />
                            <Input
                                placeholder={t('Display name (e.g. Total Sales)')}
                                value={newFieldLabel}
                                onChange={(e) => setNewFieldLabel(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <Select
                                    value={newFieldType}
                                    onValueChange={(v) => setNewFieldType(v as FieldType)}
                                >
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {FIELD_TYPES.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    onClick={handleAddCustomField}
                                    disabled={!newFieldName.trim() || !newFieldLabel.trim()}
                                    className="flex-1"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('Add Field')}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* AI Suggested Fields */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="flex items-center gap-2">
                                <Wand2 className="h-4 w-4 text-primary" />
                                {analyzing ? t('Analyzing document...') : t('Fields Detected by AI')}
                            </Label>
                            {availableSuggested.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onAddAllSuggested}
                                >
                                    {t('Add All')}
                                </Button>
                            )}
                        </div>
                        {analyzing ? (
                            <div className="flex items-center justify-center rounded-lg border border-dashed p-4">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                <span className="text-sm text-muted-foreground">{t('Detecting fields...')}</span>
                            </div>
                        ) : availableSuggested.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {availableSuggested.map((preset) => (
                                    <Button
                                        key={preset.name}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onAddField(preset)}
                                        className="border-primary/50 hover:bg-primary/10 animate-in fade-in-50"
                                    >
                                        <Plus className="mr-1 h-3 w-3" />
                                        {preset.label}
                                    </Button>
                                ))}
                            </div>
                        ) : suggestedFields.length > 0 ? (
                            <p className="text-sm text-muted-foreground">
                                {t('All detected fields have been added')}
                            </p>
                        ) : (
                            <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                                {t('No fields detected automatically')}
                            </p>
                        )}
                    </div>

                    <Separator />

                    {/* Document Type Info */}
                    <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
                        <Tag className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{t('Type')}:</span>
                        <span className="text-sm text-muted-foreground">
                            {selectedTypeId 
                                ? documentTypes.find(t => t.id === selectedTypeId)?.name 
                                : newTypeName 
                                    ? `${newTypeName} (${t('new')})` 
                                    : t('Not defined')}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Preview Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>{t('Document Preview')}</CardTitle>
                            <CardDescription>
                                {file?.name}
                            </CardDescription>
                        </div>
                        {filePreview && (
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={handleZoomOut}
                                    disabled={zoomLevel <= 50}
                                >
                                    <ZoomOut className="h-4 w-4" />
                                </Button>
                                <span className="min-w-[3rem] text-center text-sm text-muted-foreground">
                                    {zoomLevel}%
                                </span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={handleZoomIn}
                                    disabled={zoomLevel >= 300}
                                >
                                    <ZoomIn className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 ml-2"
                                    onClick={() => window.open(filePreview, '_blank')}
                                >
                                    <Maximize2 className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div 
                        className="flex aspect-[3/4] items-center justify-center overflow-auto rounded-lg border bg-muted/30"
                        onWheel={handleWheel}
                    >
                        {renderPreview()}
                    </div>
                    <p className="mt-2 text-xs text-center text-muted-foreground">
                        {t('Hold Ctrl/Cmd + scroll to zoom')}
                    </p>
                </CardContent>
            </Card>

            {/* Actions - Navigation Buttons */}
            <div className="lg:col-span-2 flex justify-between">
                <Button variant="outline" onClick={onBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('Back')}
                </Button>
                <Button 
                    onClick={onExtract}
                    disabled={fields.length === 0 || processing}
                >
                    {processing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t('Extracting...')}
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            {t('Extract Data')}
                        </>
                    )}
                </Button>
            </div>

            {/* Modal Fullscreen para Imagens */}
            {isFullscreen && !isPdf && filePreview && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
                    onClick={() => setIsFullscreen(false)}
                >
                    <div className="relative max-h-[95vh] max-w-[95vw] overflow-auto">
                        <img
                            src={filePreview}
                            alt="Preview"
                            className="w-auto h-auto max-w-none cursor-zoom-out"
                            style={{ imageRendering: 'high-quality' }}
                        />
                        <button
                            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 backdrop-blur-sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsFullscreen(false);
                            }}
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
