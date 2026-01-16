import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Calculator, Sigma } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SchemaField {
    name: string;
    label: string;
    type: 'string' | 'number' | 'date' | 'boolean' | 'array';
    items?: SchemaField[];
}

export interface CalculatedField {
    id: string;
    name: string;
    label: string;
    operation: 'sum' | 'subtract' | 'multiply' | 'divide' | 'average';
    sourceFields: string[];
}

interface CalculatedFieldBuilderProps {
    fields: SchemaField[];
    calculatedFields: CalculatedField[];
    onAdd: (field: CalculatedField) => void;
    onRemove: (id: string) => void;
}

const OPERATIONS = [
    { value: 'sum', labelKey: 'Sum (+)', symbol: '+' },
    { value: 'subtract', labelKey: 'Subtraction (-)', symbol: '-' },
    { value: 'multiply', labelKey: 'Multiplication (×)', symbol: '×' },
    { value: 'divide', labelKey: 'Division (÷)', symbol: '÷' },
    { value: 'average', labelKey: 'Average', symbol: 'μ' },
];

export function CalculatedFieldBuilder({
    fields,
    calculatedFields,
    onAdd,
    onRemove,
}: CalculatedFieldBuilderProps) {
    const { t } = useTranslation();
    const [isAdding, setIsAdding] = useState(false);
    const [newFieldLabel, setNewFieldLabel] = useState('');
    const [operation, setOperation] = useState<CalculatedField['operation']>('sum');
    const [selectedFields, setSelectedFields] = useState<string[]>([]);

    const numericFields = fields.filter(f => f.type === 'number');

    const handleAddField = useCallback((fieldName: string) => {
        if (!selectedFields.includes(fieldName)) {
            setSelectedFields(prev => [...prev, fieldName]);
        }
    }, [selectedFields]);

    const handleRemoveField = useCallback((fieldName: string) => {
        setSelectedFields(prev => prev.filter(f => f !== fieldName));
    }, []);

    const handleCreate = useCallback(() => {
        if (!newFieldLabel.trim() || selectedFields.length < 2) return;

        const newField: CalculatedField = {
            id: `calc_${Date.now()}`,
            name: `calc_${newFieldLabel.toLowerCase().replace(/\s+/g, '_')}`,
            label: newFieldLabel,
            operation,
            sourceFields: selectedFields,
        };

        onAdd(newField);
        setNewFieldLabel('');
        setSelectedFields([]);
        setOperation('sum');
        setIsAdding(false);
    }, [newFieldLabel, operation, selectedFields, onAdd]);

    const handleCancel = useCallback(() => {
        setNewFieldLabel('');
        setSelectedFields([]);
        setOperation('sum');
        setIsAdding(false);
    }, []);

    const getFieldLabel = (fieldName: string) => {
        return fields.find(f => f.name === fieldName)?.label || fieldName;
    };

    const getOperationSymbol = (op: string) => {
        return OPERATIONS.find(o => o.value === op)?.symbol || '+';
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    {t('Calculated Fields')}
                </CardTitle>
                <CardDescription className="text-xs">
                    {t('Create formulas combining numeric fields')}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Existing calculated fields */}
                {calculatedFields.length > 0 && (
                    <div className="space-y-2">
                        {calculatedFields.map(field => (
                            <div 
                                key={field.id}
                                className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                            >
                                <div className="flex items-center gap-2">
                                    <Sigma className="h-4 w-4 text-primary" />
                                    <div>
                                        <span className="font-medium text-sm">{field.label}</span>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            {field.sourceFields.map((f, i) => (
                                                <span key={f}>
                                                    {i > 0 && (
                                                        <span className="mx-1 font-bold">
                                                            {getOperationSymbol(field.operation)}
                                                        </span>
                                                    )}
                                                    {getFieldLabel(f)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => onRemove(field.id)}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add new field form */}
                {isAdding ? (
                    <div className="space-y-3 p-3 border rounded-lg bg-background">
                        <div>
                            <Label className="text-xs">{t('Field Name')}</Label>
                            <Input
                                placeholder={t('e.g. Grand Total')}
                                value={newFieldLabel}
                                onChange={(e) => setNewFieldLabel(e.target.value)}
                                className="mt-1 h-8"
                            />
                        </div>

                        <div>
                            <Label className="text-xs">{t('Operation')}</Label>
                            <Select value={operation} onValueChange={(v: CalculatedField['operation']) => setOperation(v)}>
                                <SelectTrigger className="mt-1 h-8">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {OPERATIONS.map(op => (
                                        <SelectItem key={op.value} value={op.value}>
                                            {t(op.labelKey)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="text-xs">{t('Fields to Combine')}</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {selectedFields.map(fieldName => (
                                    <Badge 
                                        key={fieldName} 
                                        variant="secondary"
                                        className="cursor-pointer"
                                        onClick={() => handleRemoveField(fieldName)}
                                    >
                                        {getFieldLabel(fieldName)}
                                        <X className="h-3 w-3 ml-1" />
                                    </Badge>
                                ))}
                            </div>
                            <Select onValueChange={handleAddField} value="">
                                <SelectTrigger className="mt-2 h-8">
                                    <SelectValue placeholder={t('Add field...')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {numericFields
                                        .filter(f => !selectedFields.includes(f.name))
                                        .map(field => (
                                            <SelectItem key={field.name} value={field.name}>
                                                {field.label}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                onClick={handleCreate}
                                disabled={!newFieldLabel.trim() || selectedFields.length < 2}
                                className="flex-1"
                            >
                                {t('Create Field')}
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancel}
                            >
                                {t('Cancel')}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAdding(true)}
                        className="w-full"
                        disabled={numericFields.length < 2}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        {t('Add Calculated Field')}
                    </Button>
                )}

                {numericFields.length < 2 && !isAdding && (
                    <p className="text-xs text-muted-foreground text-center">
                        {t('Need at least 2 numeric fields')}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
