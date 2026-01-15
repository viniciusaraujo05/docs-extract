/**
 * Tipos para o sistema de extração de documentos
 */

export interface SchemaField {
    name: string;
    label: string;
    type: FieldType;
    items?: SchemaField[];  // For array fields - defines sub-fields/columns
    required?: boolean;
}

export type FieldType = 'string' | 'number' | 'date' | 'boolean' | 'array';

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
    message?: string;
    error_type?: 'protected_pdf' | 'corrupt_pdf' | 'processing_error';
    suggestions?: string[];
    conversion_note?: string;
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
    { value: 'string', label: 'field_type_string' },
    { value: 'number', label: 'field_type_number' },
    { value: 'date', label: 'field_type_date' },
    { value: 'boolean', label: 'field_type_boolean' },
    { value: 'array', label: 'field_type_array' },
] as const;

export const ACCEPTED_FILE_TYPES = '.pdf,.jpg,.jpeg,.png,.webp';
export const MAX_FILE_SIZE_MB = 5;
