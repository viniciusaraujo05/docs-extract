/**
 * Utilities for processing table/array fields in reports
 */

import type { SchemaField, DocumentData, TableFieldData, ColumnAggregation } from '@/types/report';

/**
 * Extracts all array/table fields from documents
 */
export function extractTableFields(
    documents: DocumentData[],
    fields: SchemaField[]
): TableFieldData[] {
    const tableFields = fields.filter(f => f.type === 'array' && f.items && f.items.length > 0);
    
    if (tableFields.length === 0) {
        return [];
    }

    return tableFields.map(field => {
        const allRows: Record<string, unknown>[] = [];
        let documentCount = 0;

        // Collect all rows from all documents
        documents.forEach(doc => {
            const value = doc.data[field.name];
            
            if (value && Array.isArray(value) && value.length > 0) {
                documentCount++;
                allRows.push(...value);
            }
        });

        // Calculate aggregations for numeric columns
        const aggregations = calculateAggregations(allRows, field.items || []);

        return {
            fieldName: field.name,
            label: field.label,
            columns: field.items || [],
            rows: allRows,
            aggregations,
            documentCount,
        };
    });
}

/**
 * Calculates aggregations (sum, avg, min, max) for numeric columns
 */
export function calculateAggregations(
    rows: Record<string, unknown>[],
    columns: SchemaField[]
): Record<string, ColumnAggregation> {
    const aggregations: Record<string, ColumnAggregation> = {};

    columns.forEach(column => {
        const values = rows
            .map(row => row[column.name])
            .filter(v => v !== null && v !== undefined && v !== '');

        const count = values.length;
        
        if (column.type === 'number') {
            const numericValues = values
                .map(v => typeof v === 'number' ? v : parseFloat(String(v)))
                .filter(v => !isNaN(v));

            if (numericValues.length > 0) {
                const sum = numericValues.reduce((acc, val) => acc + val, 0);
                const avg = sum / numericValues.length;
                const min = Math.min(...numericValues);
                const max = Math.max(...numericValues);

                aggregations[column.name] = {
                    sum,
                    avg,
                    min,
                    max,
                    count: numericValues.length,
                };
            } else {
                aggregations[column.name] = { count: 0 };
            }
        } else {
            aggregations[column.name] = { count };
        }
    });

    return aggregations;
}

/**
 * Normalizes table row data to ensure consistent format
 */
export function normalizeTableRows(value: unknown): Record<string, unknown>[] {
    if (!value) return [];
    
    if (Array.isArray(value)) {
        return value.filter(item => item && typeof item === 'object');
    }
    
    if (typeof value === 'object') {
        return [value as Record<string, unknown>];
    }
    
    return [];
}

/**
 * Formats a value for display in table
 */
export function formatTableValue(value: unknown, type: string): string {
    if (value === null || value === undefined || value === '') {
        return '-';
    }

    switch (type) {
        case 'number':
            const num = typeof value === 'number' ? value : parseFloat(String(value));
            if (isNaN(num)) return '-';
            return new Intl.NumberFormat('pt-PT', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            }).format(num);

        case 'date':
            try {
                const date = new Date(String(value));
                if (isNaN(date.getTime())) return String(value);
                return date.toLocaleDateString('pt-PT');
            } catch {
                return String(value);
            }

        case 'boolean':
            return value ? 'Sim' : 'Não';

        default:
            return String(value);
    }
}

/**
 * Exports table data to Excel-compatible format
 */
export function prepareTableForExport(tableData: TableFieldData): Record<string, unknown>[] {
    return tableData.rows.map((row, index) => {
        const exportRow: Record<string, unknown> = {
            '#': index + 1,
        };

        tableData.columns.forEach(column => {
            exportRow[column.label] = formatTableValue(row[column.name], column.type);
        });

        return exportRow;
    });
}

/**
 * Aggregates table rows by grouping by the first string column and summing numeric columns
 */
export function aggregateTableRows(
    rows: Record<string, unknown>[],
    columns: SchemaField[]
): Record<string, unknown>[] {
    if (rows.length === 0) return [];

    // Identify key column (first string column) to group by
    // Prioritize common names like 'description', 'name', 'product'
    const priorityNames = ['descricao', 'description', 'descrição', 'nome', 'name', 'produto', 'product'];
    const stringCol = columns.find(c => c.type === 'string' && priorityNames.some(p => c.name.toLowerCase().includes(p))) 
                   || columns.find(c => c.type === 'string');

    if (!stringCol) return rows; 
    const keyField = stringCol.name;

    const groups: Record<string, Record<string, unknown>> = {};

    rows.forEach(row => {
        const rawKey = row[keyField];
        if (rawKey === null || rawKey === undefined) return;
        
        const key = String(rawKey).trim();
        if (!key) return;

        if (!groups[key]) {
            // Clone row as base
            groups[key] = { ...row };
            // Reset numeric columns for summation logic
            columns.filter(c => c.type === 'number').forEach(c => {
                 groups[key][c.name] = 0;
            });
        }
        
        // Sum numeric columns
        columns.forEach(c => {
            if (c.type === 'number') {
                const val = typeof row[c.name] === 'number' ? row[c.name] as number : parseFloat(String(row[c.name])) || 0;
                const current = groups[key][c.name] as number;
                groups[key][c.name] = current + val;
            }
        });
    });

    return Object.values(groups).sort((a, b) => {
        // Sort by first numeric column desc (e.g. quantity or total value) if exists
        const numCol = columns.find(c => c.type === 'number');
        if (numCol) {
            return (b[numCol.name] as number) - (a[numCol.name] as number);
        }
        return 0;
    });
}
