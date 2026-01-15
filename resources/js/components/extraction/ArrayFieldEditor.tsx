import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { type SchemaField, type FieldType, FIELD_TYPES } from '@/types/extraction';
import { Plus, X, Table as TableIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ArrayFieldEditorProps {
    field: SchemaField;
    onUpdateField: (field: SchemaField) => void;
    onClose: () => void;
}

/**
 * Dialog to configure array field structure (table columns).
 * 
 * Allows users to define sub-fields for array-type fields,
 * specifying the structure of data within tables/lists.
 */
export function ArrayFieldEditor({ field, onUpdateField, onClose }: ArrayFieldEditorProps) {
    const { t } = useTranslation();
    const [subFields, setSubFields] = useState<SchemaField[]>(field.items || []);
    const [newSubName, setNewSubName] = useState('');
    const [newSubLabel, setNewSubLabel] = useState('');
    const [newSubType, setNewSubType] = useState<FieldType>('string');

    const formatFieldName = (name: string): string => {
        return name.toLowerCase().replace(/\s+/g, '_');
    };

    const handleAddSubField = () => {
        if (!newSubName.trim() || !newSubLabel.trim()) return;
        
        const fieldName = formatFieldName(newSubName);
        if (subFields.some(f => f.name === fieldName)) return;
        
        // Array sub-fields cannot be arrays themselves (keep it simple)
        if (newSubType === 'array') return;
        
        setSubFields([...subFields, {
            name: fieldName,
            label: newSubLabel,
            type: newSubType,
        }]);
        
        setNewSubName('');
        setNewSubLabel('');
        setNewSubType('string');
    };

    const handleRemoveSubField = (name: string) => {
        setSubFields(subFields.filter(f => f.name !== name));
    };

    const handleSave = () => {
        onUpdateField({ ...field, items: subFields });
        onClose();
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <TableIcon className="h-5 w-5" />
                        {t('Configure Table')}: {field.label}
                    </DialogTitle>
                    <DialogDescription>
                        {t('Define the columns that exist within this table')}
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                    {/* Current sub-fields */}
                    <div className="space-y-2">
                        <Label>{t('Table Columns')} ({subFields.length})</Label>
                        {subFields.length === 0 ? (
                            <p className="text-sm text-muted-foreground border border-dashed rounded-lg p-4 text-center">
                                {t('No columns defined yet. Add columns below.')}
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {subFields.map(subField => (
                                    <div
                                        key={subField.name}
                                        className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                                    >
                                        <div>
                                            <p className="font-medium">{subField.label}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {t(FIELD_TYPES.find(ft => ft.value === subField.type)?.label || 'field_type_string')}
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleRemoveSubField(subField.name)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Add new sub-field */}
                    <div className="space-y-3 border-t pt-4">
                        <Label>{t('Add Column')}</Label>
                        <div className="grid gap-2">
                            <Input
                                placeholder={t('Internal name (e.g. product_name)')}
                                value={newSubName}
                                onChange={(e) => setNewSubName(e.target.value)}
                            />
                            <Input
                                placeholder={t('Display name (e.g. Product Name)')}
                                value={newSubLabel}
                                onChange={(e) => setNewSubLabel(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <Select
                                    value={newSubType}
                                    onValueChange={(v) => setNewSubType(v as FieldType)}
                                >
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {FIELD_TYPES.filter(ft => ft.value !== 'array').map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {t(type.label)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    onClick={handleAddSubField}
                                    disabled={!newSubName.trim() || !newSubLabel.trim()}
                                    className="flex-1"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('Add Column')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        {t('Cancel')}
                    </Button>
                    <Button onClick={handleSave} disabled={subFields.length === 0}>
                        {t('Save Table Structure')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
