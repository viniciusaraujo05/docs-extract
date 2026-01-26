import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrayFieldModal } from '@/components/fields/ArrayFieldModal';
import { type Document, type SchemaField } from '@/types/document';
import { Save, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface DocumentEditFormProps {
    document: Document;
    onSave: (data: Record<string, any>) => Promise<void>;
    isSaving?: boolean;
}

function getFieldLabel(field: SchemaField): string {
    return field.label || field.name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

function getInputType(fieldType: string): string {
    switch (fieldType) {
        case 'number':
            return 'number';
        case 'date':
            return 'date';
        default:
            return 'text';
    }
}

export function DocumentEditForm({ document, onSave, isSaving = false }: DocumentEditFormProps) {
    const { t } = useTranslation();
    const schemaFields: SchemaField[] = document.schema_used?.fields || [];
    
    // Initial state setup
    const getInitialData = () => {
        const data: Record<string, any> = {}; 
        schemaFields.forEach((field) => {
            const value = document.extracted_data?.[field.name];
            if (field.type === 'array' && Array.isArray(value)) {
                data[field.name] = value;
            } else {
                data[field.name] = value ?? '';
            }
        });
        return data;
    };

    const [formData, setFormData] = useState<Record<string, any>>(getInitialData);

    // Update form data when document updates
    useEffect(() => {
        if (document.extracted_data) {
            setFormData(getInitialData());
        }
    }, [document.extracted_data, document.id]);

    const handleFieldChange = (fieldName: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [fieldName]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    if (schemaFields.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                {t('No fields defined in schema')}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                {schemaFields.map((field) => (
                    <div key={field.name} className="space-y-2">
                        <Label htmlFor={field.name}>
                            {getFieldLabel(field)}
                        </Label>
                        
                        {field.type === 'array' ? (
                            <ArrayFieldModal
                                field={{
                                    name: field.name,
                                    label: field.label || field.name,
                                    items: (field.items || []).map(item => ({
                                        name: item.name,
                                        label: item.label || item.name,
                                        type: item.type,
                                    })),
                                }}
                                value={formData[field.name] as Array<Record<string, any>> || []}
                                onChange={(newValue) => 
                                    handleFieldChange(field.name, newValue)
                                }
                                readOnly={false}
                            />
                        ) : (
                            <Input
                                id={field.name}
                                type={getInputType(field.type)}
                                value={String(formData[field.name] || '')}
                                onChange={(e) =>
                                    handleFieldChange(field.name, e.target.value)
                                }
                                step={field.type === 'number' ? '0.01' : undefined}
                                disabled={isSaving}
                            />
                        )}
                    </div>
                ))}
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t('Saving...')}
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            {t('Save Changes')}
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
