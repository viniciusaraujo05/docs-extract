import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { type SchemaField, type DocumentType } from '@/types/extraction';
import { DocumentPreview } from './DocumentPreview';
import { 
    ArrowLeft, 
    Check,
    Trash2,
    Tag,
    X,
    Pencil,
    Loader2
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface StepReviewProps {
    file: File | null;
    filePreview: string | null;
    fields: SchemaField[];
    extractedData: Record<string, unknown>;
    documentTypes: DocumentType[];
    selectedTypeId: number | null;
    newTypeName: string;
    isSaving?: boolean;
    onUpdateField: (fieldName: string, value: unknown) => void;
    onRemoveField: (fieldName: string) => void;
    onRenameField: (oldName: string, newLabel: string) => void;
    onBack: () => void;
    onSave: () => void;
    onDiscard: () => void;
}

/**
 * Componente do Step 3 - Revisão e salvamento
 * Permite editar os dados extraídos antes de salvar
 */
export function StepReview({
    file,
    filePreview,
    fields,
    extractedData,
    documentTypes,
    selectedTypeId,
    newTypeName,
    isSaving = false,
    onUpdateField,
    onRemoveField,
    onRenameField,
    onBack,
    onSave,
    onDiscard,
}: StepReviewProps) {
    const { t } = useTranslation();
    const [editingLabel, setEditingLabel] = useState<string | null>(null);
    const [tempLabel, setTempLabel] = useState('');


    const getInputType = (fieldType: string): string => {
        switch (fieldType) {
            case 'number': return 'number';
            case 'date': return 'date';
            default: return 'text';
        }
    };

    const handleFieldChange = (field: SchemaField, value: string) => {
        if (field.type === 'number') {
            onUpdateField(field.name, parseFloat(value) || 0);
        } else {
            onUpdateField(field.name, value);
        }
    };

    return (
        <div className="mx-auto grid w-full max-w-5xl gap-6 animate-in fade-in-50 slide-in-from-right-4 duration-500 lg:grid-cols-2">
            {/* Extracted Data Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        {t('Extracted Data')}
                    </CardTitle>
                    <CardDescription>
                        {t('Review and edit the extracted data before saving')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {fields.map((field) => (
                        <div key={field.name} className="space-y-1.5 animate-in fade-in-50 group">
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
                                                    onRenameField(field.name, tempLabel);
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
                                                onRenameField(field.name, tempLabel);
                                                setEditingLabel(null);
                                            }}
                                        >
                                            <Check className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ) : (
                                    <Label htmlFor={field.name} className="flex items-center gap-2">
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
                            <Input
                                id={field.name}
                                type={getInputType(field.type)}
                                value={String(extractedData[field.name] ?? '')}
                                onChange={(e) => handleFieldChange(field, e.target.value)}
                                className="transition-all focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    ))}

                    <Separator className="my-4" />

                    {/* Document Type Info */}
                    <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
                        <Tag className="h-4 w-4 text-primary" />
                        <Label>{t('Extracted Data')} ({fields.length} {t('fields')})</Label>
                        <p className="text-xs text-muted-foreground">
                            {t('Edit the extracted values if needed')}
                        </p>
                        <span className="text-sm font-medium">Tipo:</span>
                        <span className="text-sm text-muted-foreground">
                            {selectedTypeId 
                                ? documentTypes.find(t => t.id === selectedTypeId)?.name 
                                : newTypeName 
                                    ? `${newTypeName} (novo)` 
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

            {/* Actions */}
            <div className="flex justify-between lg:col-span-2">
                <Button variant="outline" onClick={onBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('Back')}
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onDiscard}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t('Discard')}
                    </Button>
                    <Button 
                        onClick={onSave}
                        disabled={(!selectedTypeId && !newTypeName) || isSaving}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t('Saving...')}
                            </>
                        ) : (
                            <>
                                <Check className="mr-2 h-4 w-4" />
                                {t('Save Document')}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
