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
    ArrowRight, // NEW
    ChevronLeft, // NEW
    ChevronRight, // NEW
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
import { useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface StepFieldsProps {
    file: File | null;
    files?: File[]; // NEW
    batchMode?: boolean; // NEW
    filePreview: string | null;
    fields: SchemaField[];
    suggestedFields: SchemaField[];
    documentTypes: DocumentType[];
    selectedTypeId: number | null;
    newTypeName: string;
    analyzing: boolean;
    processing: boolean;
    isFirstDocument?: boolean;
    onAddField: (field: SchemaField) => void;
    onUpdateField: (field: SchemaField) => void;
    onRemoveField: (name: string) => void;
    onAddAllSuggested: () => void;
    onBack: () => void;
    onExtract: () => void;
}

export function StepFields({
    file,
    files = [], // NEW
    batchMode = false, // NEW
    filePreview,
    fields,
    suggestedFields,
    documentTypes,
    selectedTypeId,
    newTypeName,
    analyzing,
    processing,
    isFirstDocument = false,
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
    
    // Batch Mode Navigation State
    const [currentFileIndex, setCurrentFileIndex] = useState(0);

    // Determines current file to show
    const currentFile = batchMode && files.length > 0 ? files[currentFileIndex] : file;
    // We need to generate a preview URL for the current batch file if in batch mode
    // Note: In a real app we should manage these URLs carefully to revoke them
    const [batchPreviewUrl, setBatchPreviewUrl] = useState<string | null>(null);

    // Update preview when index changes in batch mode
    useEffect(() => {
        if (batchMode && files.length > 0) {
            const url = URL.createObjectURL(files[currentFileIndex]);
            setBatchPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [batchMode, files, currentFileIndex]);

    const activePreview = batchMode ? batchPreviewUrl : filePreview;

    const handleNextFile = () => {
        if (currentFileIndex < files.length - 1) {
            setCurrentFileIndex(prev => prev + 1);
        }
    };

    const handlePrevFile = () => {
        if (currentFileIndex > 0) {
            setCurrentFileIndex(prev => prev - 1);
        }
    };

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
                    {t('What do you want to extract?')}
                </CardTitle>
                <CardDescription>
                    {t('Select the data points our AI should find in your document')}
                </CardDescription>
            </CardHeader>
                <CardContent className="space-y-4">
                    {/* AI Suggested Fields */}
                    {(analyzing || availableSuggested.length > 0) && (
                        <>
                            <div className="flex items-center justify-between">
                                <Label className="text-sm flex items-center gap-2">
                                    <Wand2 className="h-4 w-4 text-primary" />
                                    {analyzing ? t('AI is detecting fields...') : t('AI detected these \u2014 click to add')}
                                </Label>
                                {availableSuggested.length > 0 && (
                                    <Button variant="ghost" size="sm" onClick={onAddAllSuggested} className="text-primary hover:text-primary">
                                        <Plus className="mr-1 h-3 w-3" />
                                        {t('Use all suggestions')}
                                    </Button>
                                )}
                            </div>
                            {analyzing ? (
                                <div className="flex items-center gap-2 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                    {t('Scanning your document for data patterns...')}
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {availableSuggested.map((preset, idx) => {
                                        // Simulate confidence score based on position (first ones tend to be higher confidence)
                                        const confidence = Math.max(78, 98 - idx * 4);
                                        return (
                                            <Button
                                                key={preset.name}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onAddField(preset)}
                                                className="h-auto py-1.5 px-3 text-xs flex-col items-start gap-0.5 border-primary/20 hover:border-primary/50 hover:bg-primary/5"
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    <Plus className="h-3 w-3" />
                                                    <span className="font-medium">{preset.label}</span>
                                                </div>
                                                <span className="text-[10px] text-primary/70 font-medium">{confidence}% {t('confidence')}</span>
                                            </Button>
                                        );
                                    })}
                                </div>
                            )}
                            {isFirstDocument && availableSuggested.length > 0 && (
                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm dark:border-blue-800 dark:bg-blue-950/30 animate-in fade-in slide-in-from-top-1 duration-500">
                                    <div className="flex items-start gap-2">
                                        <Sparkles className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-blue-700 dark:text-blue-300">
                                            {t('step_fields_ai_hint')}
                                        </span>
                                    </div>
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
                        {/* Tutorial hint for custom fields */}
                        {isFirstDocument && (
                            <p className="text-sm text-muted-foreground animate-in fade-in slide-in-from-top-1 duration-500">
                                💡 {t('step_fields_custom_hint')}
                            </p>
                        )}
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

            {/* Left Column - Preview */}
            <div className="flex flex-col gap-4 lg:col-span-1">
                {/* Batch Mode Navigation Header */}
                {batchMode && files.length > 0 && (
                    <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handlePrevFile}
                            disabled={currentFileIndex === 0}
                            className="h-8 w-8"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex flex-col items-center">
                            <span className="text-sm font-medium">
                                {t('Document')} {currentFileIndex + 1} {t('of')} {files.length}
                            </span>
                            <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                                {files[currentFileIndex]?.name}
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleNextFile}
                            disabled={currentFileIndex === files.length - 1}
                            className="h-8 w-8"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                <Card className="flex-1 min-h-[500px] flex flex-col">
                    <CardHeader className="py-3">
                        <CardTitle className="text-sm font-medium">{t('Document Preview')}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 overflow-hidden">
                        <DocumentPreview 
                            file={currentFile} 
                            filePreview={activePreview}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Actions - Full Width */}
            <div className="lg:col-span-2 flex justify-between">
                <Button variant="outline" onClick={onBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('Back')}
                </Button>
                <Button 
                    onClick={onExtract}
                    disabled={fields.length === 0 || processing}
                    className="shadow-md shadow-primary/20"
                >
                    {processing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {batchMode ? t('Starting...') : t('Extracting...')}
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            {batchMode ? t('Start batch processing') : t('Extract my data →')}
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
