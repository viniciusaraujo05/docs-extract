/**
 * Tipos para o sistema de extração de documentos
 */

export interface SchemaField {
    name: string;
    label: string;
    type: FieldType;
}

export type FieldType = 'string' | 'number' | 'date' | 'boolean';

export interface DocumentType {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    fields: SchemaField[];
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface AnalyzeResponse {
    success: boolean;
    suggested_fields?: SchemaField[];
    raw_text_preview?: string;
    error?: string;
}

export interface ExtractionResponse {
    success: boolean;
    extracted_data?: Record<string, unknown>;
    confidence?: number;
    raw_text_preview?: string;
    error?: string;
}

export interface WizardState {
    step: number;
    file: File | null;
    filePreview: string | null;
    documentTypeId: number | null;
    fields: SchemaField[];
    suggestedFields: SchemaField[];
    extractedData: Record<string, unknown>;
    rawTextPreview: string;
    analyzing: boolean;
    processing: boolean;
    error: string | null;
}

export const FIELD_TYPES: ReadonlyArray<{ value: FieldType; label: string }> = [
    { value: 'string', label: 'Texto' },
    { value: 'number', label: 'Número' },
    { value: 'date', label: 'Data' },
    { value: 'boolean', label: 'Sim/Não' },
] as const;

export const ACCEPTED_FILE_TYPES = '.pdf,.jpg,.jpeg,.png,.webp';
export const MAX_FILE_SIZE_MB = 10;
