import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ExportDataButton } from '@/components/export-data-button';
import {
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { Download, Search, ChevronDown, ChevronUp, ChevronsUpDown, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import type { CalculatedField } from './CalculatedFieldBuilder';

interface SchemaField {
    name: string;
    label: string;
    type: 'string' | 'number' | 'date';
}

interface DocumentData {
    id: number;
    name: string;
    data: Record<string, unknown>;
    created_at: string;
}

interface ReportTableViewProps {
    documents: DocumentData[];
    fields: SchemaField[];
    calculatedFields: CalculatedField[];
    visibleFields: string[];
}

type SortDirection = 'asc' | 'desc' | null;

function formatValue(value: unknown, type: string): string {
    if (value === null || value === undefined || value === '') return '-';
    
    if (type === 'number' && typeof value === 'number') {
        return new Intl.NumberFormat('pt-PT', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(value);
    }
    
    if (type === 'date' && typeof value === 'string') {
        try {
            return new Date(value).toLocaleDateString('pt-PT');
        } catch {
            return String(value);
        }
    }
    
    return String(value);
}

function calculateFieldValue(
    doc: DocumentData,
    calcField: CalculatedField
): number {
    const values = calcField.sourceFields.map(fieldName => {
        const val = doc.data[fieldName];
        return typeof val === 'number' ? val : parseFloat(String(val)) || 0;
    });

    switch (calcField.operation) {
        case 'sum':
            return values.reduce((a, b) => a + b, 0);
        case 'subtract':
            return values.reduce((a, b) => a - b);
        case 'multiply':
            return values.reduce((a, b) => a * b, 1);
        case 'divide':
            return values.slice(1).reduce((a, b) => b !== 0 ? a / b : 0, values[0] || 0);
        case 'average':
            return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
        default:
            return 0;
    }
}

export function ReportTableView({
    documents,
    fields,
    calculatedFields,
    visibleFields,
}: ReportTableViewProps) {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);

    // Filter visible fields
    const displayFields = useMemo(() => {
        return fields.filter(f => visibleFields.includes(f.name));
    }, [fields, visibleFields]);

    // Filter and sort documents
    const processedDocuments = useMemo(() => {
        let result = [...documents];

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(doc => {
                if (doc.name.toLowerCase().includes(term)) return true;
                return Object.values(doc.data).some(val => 
                    String(val).toLowerCase().includes(term)
                );
            });
        }

        // Sort
        if (sortField && sortDirection) {
            result.sort((a, b) => {
                let aVal: unknown;
                let bVal: unknown;

                // Check if it's a calculated field
                const calcField = calculatedFields.find(cf => cf.name === sortField);
                if (calcField) {
                    aVal = calculateFieldValue(a, calcField);
                    bVal = calculateFieldValue(b, calcField);
                } else if (sortField === 'name') {
                    aVal = a.name;
                    bVal = b.name;
                } else if (sortField === 'created_at') {
                    aVal = a.created_at;
                    bVal = b.created_at;
                } else {
                    aVal = a.data[sortField];
                    bVal = b.data[sortField];
                }

                if (aVal === bVal) return 0;
                if (aVal === null || aVal === undefined) return 1;
                if (bVal === null || bVal === undefined) return -1;

                const comparison = aVal < bVal ? -1 : 1;
                return sortDirection === 'asc' ? comparison : -comparison;
            });
        }

        return result;
    }, [documents, searchTerm, sortField, sortDirection, calculatedFields]);

    // Calculate totals for numeric fields
    const totals = useMemo(() => {
        const result: Record<string, number> = {};
        
        displayFields.forEach(field => {
            if (field.type === 'number') {
                result[field.name] = processedDocuments.reduce((sum, doc) => {
                    const val = doc.data[field.name];
                    return sum + (typeof val === 'number' ? val : parseFloat(String(val)) || 0);
                }, 0);
            }
        });

        calculatedFields.forEach(calcField => {
            result[calcField.name] = processedDocuments.reduce((sum, doc) => {
                return sum + calculateFieldValue(doc, calcField);
            }, 0);
        });

        return result;
    }, [processedDocuments, displayFields, calculatedFields]);

    const handleSort = useCallback((fieldName: string) => {
        if (sortField === fieldName) {
            if (sortDirection === 'asc') {
                setSortDirection('desc');
            } else if (sortDirection === 'desc') {
                setSortField(null);
                setSortDirection(null);
            }
        } else {
            setSortField(fieldName);
            setSortDirection('asc');
        }
    }, [sortField, sortDirection]);

    const handleSelectAll = useCallback(() => {
        if (selectedRows.size === processedDocuments.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(processedDocuments.map(d => d.id)));
        }
    }, [processedDocuments, selectedRows]);

    const handleSelectRow = useCallback((id: number) => {
        setSelectedRows(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const exportPayload = useMemo(() => {
        const docsToExport = selectedRows.size > 0
            ? processedDocuments.filter(d => selectedRows.has(d.id))
            : processedDocuments;

        if (docsToExport.length === 0) return null;

        // Return array of objects where each object is a row
        return docsToExport.map((doc) => {
            const row: Record<string, any> = {
                'ID': doc.id,
                'Documento': doc.name,
                'Data de Criação': new Date(doc.created_at).toLocaleDateString('pt-PT'),
            };

            // Add field values
            displayFields.forEach(field => {
                row[field.label] = doc.data[field.name] ?? '';
            });

            // Add calculated field values
            calculatedFields.forEach(calcField => {
                row[calcField.label] = calculateFieldValue(doc, calcField);
            });

            return row;
        });
    }, [processedDocuments, selectedRows, displayFields, calculatedFields]);

    const getSortIcon = (fieldName: string) => {
        if (sortField !== fieldName) {
            return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
        }
        return sortDirection === 'asc' 
            ? <ArrowUp className="h-3 w-3 ml-1" />
            : <ArrowDown className="h-3 w-3 ml-1" />;
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">{t('List View')}</CardTitle>
                        <CardDescription>
                            {processedDocuments.length} {t('documents')}
                            {selectedRows.size > 0 && ` (${selectedRows.size} ${t('selected')})`}
                        </CardDescription>
                    </div>
                    {exportPayload && (
                        <ExportDataButton
                            data={exportPayload}
                            filename={`table_export_${new Date().toISOString().split('T')[0]}`}
                            variant="outline"
                            size="sm"
                        />
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t('Search...')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Table */}
                <div className="rounded-lg border">
                    <div className="max-h-[420px] overflow-auto">
                        <Table className="min-w-[800px]">
                        <TableHeader className="sticky top-0 bg-background z-10">
                            <TableRow>
                                <TableHead className="w-10">
                                    <Checkbox
                                        checked={selectedRows.size === processedDocuments.length && processedDocuments.length > 0}
                                        onCheckedChange={handleSelectAll}
                                    />
                                </TableHead>
                                <TableHead 
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => handleSort('name')}
                                >
                                    <div className="flex items-center">
                                        Documento
                                        {getSortIcon('name')}
                                    </div>
                                </TableHead>
                                {displayFields.map(field => (
                                    <TableHead 
                                        key={field.name}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort(field.name)}
                                    >
                                        <div className="flex items-center">
                                            {field.label}
                                            {getSortIcon(field.name)}
                                        </div>
                                    </TableHead>
                                ))}
                                {calculatedFields.map(calcField => (
                                    <TableHead 
                                        key={calcField.id}
                                        className="cursor-pointer hover:bg-muted/50 bg-primary/5"
                                        onClick={() => handleSort(calcField.name)}
                                    >
                                        <div className="flex items-center">
                                            <Badge variant="outline" className="mr-1 text-xs">Σ</Badge>
                                            {calcField.label}
                                            {getSortIcon(calcField.name)}
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {processedDocuments.map(doc => (
                                <TableRow 
                                    key={doc.id}
                                    className={selectedRows.has(doc.id) ? 'bg-primary/5' : ''}
                                >
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedRows.has(doc.id)}
                                            onCheckedChange={() => handleSelectRow(doc.id)}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {doc.name}
                                    </TableCell>
                                    {displayFields.map(field => (
                                        <TableCell key={field.name}>
                                            {formatValue(doc.data[field.name], field.type)}
                                        </TableCell>
                                    ))}
                                    {calculatedFields.map(calcField => (
                                        <TableCell key={calcField.id} className="bg-primary/5 font-medium">
                                            {formatValue(calculateFieldValue(doc, calcField), 'number')}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                            
                            {/* Totals row */}
                            {processedDocuments.length > 0 && (
                                <TableRow className="bg-muted/50 font-bold border-t-2">
                                    <TableCell></TableCell>
                                    <TableCell>TOTAL</TableCell>
                                    {displayFields.map(field => (
                                        <TableCell key={field.name}>
                                            {field.type === 'number' 
                                                ? formatValue(totals[field.name], 'number')
                                                : ''}
                                        </TableCell>
                                    ))}
                                    {calculatedFields.map(calcField => (
                                        <TableCell key={calcField.id} className="bg-primary/10">
                                            {formatValue(totals[calcField.name], 'number')}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            )}
                        </TableBody>
                        </Table>
                    </div>
                </div>

                {processedDocuments.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        Nenhum documento encontrado
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
