export interface Document {
    id: number;
    user_id: number;
    organization_id: number | null;
    document_type_id: number | null;
    name: string;
    original_filename: string;
    file_path: string;
    mime_type: string;
    file_size: number;
    type: 'invoice' | 'receipt' | 'custom';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    raw_text: string | null;
    extracted_data: Record<string, unknown> | null;
    schema_used: ExtractionSchema | null;
    confidence_score: number | null;
    error_message: string | null;
    credits_used: number;
    processed_at: string | null;
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    document_type?: {
        id: number;
        name: string;
        description?: string | null;
    };
}

export interface ExtractionSchema {
    fields: SchemaField[];
}

export interface SchemaField {
    name: string;
    type: string;
    label?: string;
    items?: SchemaField[]; // For array type fields
}

export interface DocumentsIndexProps {
    documents: {
        data: Document[];
        current_page: number;
        last_page: number;
        total: number;
    };
    documentTypes?: Array<{
        id: number;
        name: string;
        description?: string | null;
    }>;
}

export interface DocumentShowProps {
    document: Document;
    previewUrl: string | null;
}

export interface PaginationLinks {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
}

export interface PaginationMeta {
    current_page: number;
    from: number | null;
    last_page: number;
    path: string;
    per_page: number;
    to: number | null;
    total: number;
}
