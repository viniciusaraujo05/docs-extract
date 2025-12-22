import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { type SchemaField, type FieldType, type DocumentType, FIELD_TYPES } from '@/types/extraction';
import { DocumentPreview } from './DocumentPreview';
import { 
    ArrowLeft, 
    Loader2, 
    Plus, 
    Sparkles, 
    Wand2,
    X,
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
                <CardContent className="pt-6">
                    <DocumentPreview file={file} filePreview={filePreview} />
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
        </div>
    );
}
