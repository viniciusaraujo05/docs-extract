import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { type SchemaField, type FieldType, type DocumentType, FIELD_TYPES } from '@/types/extraction';
import { DocumentPreview } from './DocumentPreview';
import { ArrayFieldEditor } from './ArrayFieldEditor';
import { 
    ArrowLeft, 
    Loader2, 
    Plus, 
    Sparkles, 
    Wand2,
    X,
    Tag,
    Table,
    Settings,
    Pencil,
    Check
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
    onUpdateField: (field: SchemaField) => void;
    onRemoveField: (name: string) => void;
    onAddAllSuggested: () => void;
    onBack: () => void;
    onExtract: () => void;
}

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
    onUpdateField,
    onRemoveField,
    onAddAllSuggested,
    onBack,
    onExtract,
}: StepFieldsProps) {
    const { t } = useTranslation();
    const [newFieldName, setNewFieldName] = useState('');
    const [newFieldLabel, setNewFieldLabel] = useState('');
    const [newFieldType, setNewFieldType] = useState<FieldType>('string');
    const [editingArrayField, setEditingArrayField] = useState<SchemaField | null>(null);
    const [editingLabel, setEditingLabel] = useState<string | null>(null);
    const [tempLabel, setTempLabel] = useState('');

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
        
        const newField: SchemaField = {
            name: fieldName,
            label: newFieldLabel,
            type: newFieldType,
        };

        if (newFieldType === 'array') {
            newField.items = [];
            onAddField(newField);
            setEditingArrayField(newField);
        } else {
            onAddField(newField);
        }
        
        setNewFieldName('');
        setNewFieldLabel('');
        setNewFieldType('string');
    }, [fields, newFieldName, newFieldLabel, newFieldType, onAddField]);

    const handleUpdateFieldType = (fieldName: string, newType: FieldType) => {
        const field = fields.find(f => f.name === fieldName);
        if (!field) return;
        
        const updatedField = { ...field, type: newType };
        
        // If changing to array, initialize items
        if (newType === 'array' && !updatedField.items) {
            updatedField.items = [];
        }
        // If changing from array, remove items
        if (newType !== 'array' && updatedField.items) {
            delete updatedField.items;
        }
        
        onUpdateField(updatedField);
    };

    return (
        <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-2">
            {/* Fields Configuration */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        {t('Fields to Extract')}
                    </CardTitle>
                    <CardDescription>
                        {t('Define which fields to extract from your document')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* AI Suggested Fields */}
                    {(analyzing || availableSuggested.length > 0) && (
                        <>
                            <div className="flex items-center justify-between">
                                <Label className="text-sm flex items-center gap-2">
                                    <Wand2 className="h-4 w-4 text-primary" />
                                    {analyzing ? t('Analyzing...') : t('AI Suggestions')}
                                </Label>
                                {availableSuggested.length > 0 && (
                                    <Button variant="ghost" size="sm" onClick={onAddAllSuggested}>
                                        <Plus className="mr-1 h-3 w-3" />
                                        {t('Add All')}
                                    </Button>
                                )}
                            </div>
                            {analyzing ? (
                                <div className="flex items-center gap-2 rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {t('Detecting fields...')}
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {availableSuggested.map((preset) => (
                                        <Button
                                            key={preset.name}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onAddField(preset)}
                                            className="h-7 text-xs"
                                        >
                                            <Plus className="mr-1 h-3 w-3" />
                                            {preset.label}
                                            <Badge variant="secondary" className="ml-1.5 text-[10px] px-1">
                                                {t(FIELD_TYPES.find(ft => ft.value === preset.type)?.label || 'field_type_string')}
                                            </Badge>
                                        </Button>
                                    ))}
                                </div>
                            )}
                            <Separator />
                        </>
                    )}

                    {/* Active Fields List */}
                    <div className="space-y-1">
                        <Label className="text-sm">{t('Active Fields')} ({fields.length})</Label>
                        {fields.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                                {t('No fields added yet')}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {fields.map((field) => (
                                    <div key={field.name} className="space-y-1.5 group">
                                        {/* Field Label with Edit */}
                                        <div className="flex items-center justify-between">
                                            {editingLabel === field.name ? (
                                                <div className="flex items-center gap-2 flex-1">
                                                    <Input
                                                        value={tempLabel}
                                                        onChange={(e) => setTempLabel(e.target.value)}
                                                        className="h-7 text-sm"
                                                        autoFocus
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                onUpdateField({ ...field, label: tempLabel });
                                                                setEditingLabel(null);
                                                            } else if (e.key === 'Escape') {
                                                                setEditingLabel(null);
                                                            }
                                                        }}
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => {
                                                            onUpdateField({ ...field, label: tempLabel });
                                                            setEditingLabel(null);
                                                        }}
                                                    >
                                                        <Check className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Label className="flex items-center gap-2 text-sm">
                                                    {field.type === 'array' && <Table className="h-3.5 w-3.5 text-primary" />}
                                                    {field.label}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => {
                                                            setEditingLabel(field.name);
                                                            setTempLabel(field.label);
                                                        }}
                                                    >
                                                        <Pencil className="h-3 w-3" />
                                                    </Button>
                                                </Label>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => onRemoveField(field.name)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>

                                        {/* Type Selector and Config */}
                                        <div className="flex gap-2">
                                            <Select
                                                value={field.type}
                                                onValueChange={(value) => handleUpdateFieldType(field.name, value as FieldType)}
                                            >
                                                <SelectTrigger className="h-8 text-xs flex-1">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {FIELD_TYPES.map((type) => (
                                                        <SelectItem key={type.value} value={type.value}>
                                                            {t(type.label)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            {field.type === 'array' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 text-xs"
                                                    onClick={() => setEditingArrayField(field)}
                                                >
                                                    <Settings className="h-3 w-3 mr-1" />
                                                    {field.items?.length || 0} cols
                                                </Button>
                                            )}
                                        </div>

                                        {/* Internal name hint */}
                                        <p className="text-[10px] text-muted-foreground">{field.name}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Add Custom Field */}
                    <div className="space-y-2">
                        <Label className="text-sm">{t('Add Custom Field')}</Label>
                        <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <Input
                                    placeholder={t('Display name')}
                                    value={newFieldLabel}
                                    onChange={(e) => setNewFieldLabel(e.target.value)}
                                    className="h-8 text-sm"
                                />
                                <Input
                                    placeholder={t('field_name')}
                                    value={newFieldName}
                                    onChange={(e) => setNewFieldName(e.target.value)}
                                    className="h-8 text-sm"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Select
                                    value={newFieldType}
                                    onValueChange={(v) => setNewFieldType(v as FieldType)}
                                >
                                    <SelectTrigger className="w-32 h-8 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {FIELD_TYPES.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {t(type.label)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    onClick={handleAddCustomField}
                                    disabled={!newFieldName.trim() || !newFieldLabel.trim()}
                                    className="flex-1 h-8 text-sm"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('Add')}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Template Info */}
                    <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-2 text-sm">
                        <Tag className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs text-muted-foreground">
                            {selectedTypeId 
                                ? documentTypes.find(t => t.id === selectedTypeId)?.name 
                                : newTypeName || t('New template')}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Preview */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('Document Preview')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <DocumentPreview file={file} filePreview={filePreview} />
                </CardContent>
            </Card>

            {/* Actions - Full Width */}
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

            {/* Array Field Editor Dialog */}
            {editingArrayField && (
                <ArrayFieldEditor
                    field={editingArrayField}
                    onUpdateField={(updatedField) => {
                        onUpdateField(updatedField);
                        setEditingArrayField(null);
                    }}
                    onClose={() => setEditingArrayField(null)}
                />
            )}
        </div>
    );
}
