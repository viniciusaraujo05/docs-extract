/**
 * Type definitions for the reports system
 */

export interface SchemaField {
    name: string;
    label: string;
    type: 'string' | 'number' | 'date' | 'boolean' | 'array';
    items?: SchemaField[]; // Sub-fields for array type
    required?: boolean;
}

export interface AggregatedField {
    label: string;
    type: string;
    count: number;
    sum?: number;
    avg?: number;
    min?: number;
    max?: number;
    values?: number[];
    distribution?: Record<string, number>;
    uniqueCount?: number;
    byMonth?: Record<string, number>;
}

export interface DocumentData {
    id: number;
    name: string;
    data: Record<string, unknown>;
    created_at: string;
}

export interface ReportData {
    documentType: {
        id: number;
        name: string;
        fields: SchemaField[];
    };
    documents: DocumentData[];
    aggregated: Record<string, AggregatedField>;
    totalDocuments: number;
}

export interface ColumnAggregation {
    sum?: number;
    avg?: number;
    min?: number;
    max?: number;
    count: number;
}

export interface TableFieldData {
    fieldName: string;
    label: string;
    columns: SchemaField[];
    rows: Record<string, unknown>[];
    aggregations: Record<string, ColumnAggregation>;
    documentCount: number; // How many documents have this table
}

export interface ReportTableData {
    tables: TableFieldData[];
    totalTables: number;
}

export interface FieldConfig {
    visible: boolean;
    aggregation: 'sum' | 'avg' | 'count' | 'growth' | null;
    chartType: 'bar' | 'pie' | 'line' | 'area';
}

export interface ReportConfig {
    fieldConfig: Record<string, FieldConfig>;
    selectionMode: 'all' | 'filtered' | 'manual';
    dateFrom: string | null;
    dateTo: string | null;
    selectedDocumentIds: number[];
    dateGrouping: 'day' | 'month' | 'year' | null;
    dateField: string | null;
}
