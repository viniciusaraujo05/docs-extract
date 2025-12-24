import { useTranslation } from 'react-i18next';

export interface ApiEndpoint {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    description: string;
    requiresAuth: boolean;
    requestBody?: {
        type: string;
        fields?: Array<{
            name: string;
            type: string;
            required: boolean;
            description: string;
        }>;
    };
    queryParams?: Array<{
        name: string;
        type: string;
        required: boolean;
        description: string;
    }>;
    responses: Array<{
        status: number;
        description: string;
        example: object;
    }>;
}

export const useApiDocumentation = () => {
    const { t } = useTranslation();

    const gettingStarted = {
        title: t('Getting Started'),
        steps: [
            {
                number: 1,
                title: t('Create API Client'),
                description: t('Navigate to the API Clients tab and create your first API client. Save the client_id and client_secret securely - the secret is only shown once.'),
            },
            {
                number: 2,
                title: t('Obtain JWT Token'),
                description: t('Use your credentials to obtain a JWT token that will be used to authenticate all subsequent requests.'),
                endpoint: '/api/v1/auth/token',
            },
            {
                number: 3,
                title: t('Make API Requests'),
                description: t('Include the JWT token in the Authorization header of all your requests: Authorization: Bearer YOUR_TOKEN'),
            },
            {
                number: 4,
                title: t('Refresh Token'),
                description: t('Tokens expire after 60 minutes. Use the refresh endpoint to obtain a new token before expiration.'),
                endpoint: '/api/v1/auth/refresh',
            },
        ],
    };

    const endpoints: Record<string, ApiEndpoint> = {
        'auth.token': {
            method: 'POST',
            path: '/api/v1/auth/token',
            description: t('Obtain a JWT token using your API client credentials'),
            requiresAuth: false,
            requestBody: {
                type: 'application/json',
                fields: [
                    {
                        name: 'client_id',
                        type: 'string',
                        required: true,
                        description: t('Your API client ID'),
                    },
                    {
                        name: 'client_secret',
                        type: 'string',
                        required: true,
                        description: t('Your API client secret'),
                    },
                ],
            },
            responses: [
                {
                    status: 200,
                    description: t('Authentication successful'),
                    example: {
                        access_token: 'eyJ0eXAiOiJKV1QiLCJhbGc...',
                        token_type: 'Bearer',
                        expires_in: 3600,
                    },
                },
                {
                    status: 401,
                    description: t('Invalid credentials, client disabled, or IP not allowed'),
                    example: {
                        success: false,
                        message: 'Invalid credentials, client disabled, or IP not allowed.',
                    },
                },
            ],
        },
        'auth.refresh': {
            method: 'POST',
            path: '/api/v1/auth/refresh',
            description: t('Refresh your JWT token before it expires'),
            requiresAuth: true,
            responses: [
                {
                    status: 200,
                    description: t('Token refreshed successfully'),
                    example: {
                        access_token: 'eyJ0eXAiOiJKV1QiLCJhbGc...',
                        token_type: 'Bearer',
                        expires_in: 3600,
                    },
                },
                {
                    status: 401,
                    description: t('Unauthenticated or invalid token'),
                    example: {
                        success: false,
                        message: 'Unauthenticated.',
                        error: 'Unauthenticated.',
                    },
                },
            ],
        },
        'auth.logout': {
            method: 'POST',
            path: '/api/v1/auth/logout',
            description: t('Invalidate your current JWT token'),
            requiresAuth: true,
            responses: [
                {
                    status: 200,
                    description: t('Token revoked successfully'),
                    example: {
                        message: 'Token revoked successfully.',
                    },
                },
                {
                    status: 401,
                    description: t('Unauthenticated or invalid token'),
                    example: {
                        success: false,
                        message: 'Unauthenticated.',
                        error: 'Unauthenticated.',
                    },
                },
            ],
        },
        'documents.index': {
            method: 'GET',
            path: '/api/v1/documents',
            description: t('List all documents with pagination'),
            requiresAuth: true,
            queryParams: [
                {
                    name: 'per_page',
                    type: 'integer',
                    required: false,
                    description: t('Number of items per page (1-100, default: 20)'),
                },
            ],
            responses: [
                {
                    status: 200,
                    description: t('Documents retrieved successfully'),
                    example: {
                        data: {
                            documents: [
                                {
                                    id: 123,
                                    public_id: 'doc_abc123',
                                    name: 'invoice.pdf',
                                    document_type: 'Invoice',
                                    status: 'completed',
                                    extracted_data: {
                                        invoice_number: 'INV-2025-001',
                                        total: 1500.0,
                                        date: '2025-01-20',
                                    },
                                    created_at: '2025-01-24T14:30:22.000000Z',
                                    updated_at: '2025-01-24T14:30:45.000000Z',
                                },
                            ],
                            pagination: {
                                current_page: 1,
                                last_page: 3,
                                per_page: 20,
                                total: 45,
                            },
                        },
                    },
                },
                {
                    status: 401,
                    description: t('Unauthenticated or invalid token'),
                    example: {
                        success: false,
                        message: 'Unauthenticated.',
                        error: 'Unauthenticated.',
                    },
                },
            ],
        },
        'documents.show': {
            method: 'GET',
            path: '/api/v1/documents/{id}',
            description: t('Get details of a specific document including extracted data'),
            requiresAuth: true,
            responses: [
                {
                    status: 200,
                    description: t('Document retrieved successfully'),
                    example: {
                        data: {
                            id: 123,
                            public_id: 'doc_abc123',
                            name: 'invoice.pdf',
                            document_type: 'Invoice',
                            status: 'completed',
                            extracted_data: {
                                invoice_number: 'INV-2025-001',
                                total: 1500.0,
                                date: '2025-01-20',
                                vendor: 'Acme Corp',
                            },
                            file_path: '/storage/documents/invoice.pdf',
                            file_size: 245678,
                            mime_type: 'application/pdf',
                            created_at: '2025-01-24T14:30:22.000000Z',
                            updated_at: '2025-01-24T14:30:45.000000Z',
                        },
                    },
                },
                {
                    status: 401,
                    description: t('Unauthenticated or invalid token'),
                    example: {
                        success: false,
                        message: 'Unauthenticated.',
                        error: 'Unauthenticated.',
                    },
                },
                {
                    status: 404,
                    description: t('Document not found or access denied'),
                    example: {
                        success: false,
                        message: 'Document not found or access denied.',
                    },
                },
            ],
        },
        'documents.filter': {
            method: 'GET',
            path: '/api/v1/documents/filter',
            description: t('Filter documents by type, date range, and name'),
            requiresAuth: true,
            queryParams: [
                {
                    name: 'document_type',
                    type: 'string',
                    required: false,
                    description: t('Filter by document type name'),
                },
                {
                    name: 'start_date',
                    type: 'string',
                    required: false,
                    description: t('Filter documents created after this date (YYYY-MM-DD)'),
                },
                {
                    name: 'end_date',
                    type: 'string',
                    required: false,
                    description: t('Filter documents created before this date (YYYY-MM-DD)'),
                },
                {
                    name: 'name',
                    type: 'string',
                    required: false,
                    description: t('Filter by document name (partial match)'),
                },
            ],
            responses: [
                {
                    status: 200,
                    description: t('Filtered documents retrieved successfully'),
                    example: {
                        data: {
                            documents: [
                                {
                                    id: 123,
                                    public_id: 'doc_abc123',
                                    name: 'invoice.pdf',
                                    document_type: 'Invoice',
                                    status: 'completed',
                                    extracted_data: {
                                        invoice_number: 'INV-2025-001',
                                        total: 1500.0,
                                    },
                                    created_at: '2025-01-24T14:30:22.000000Z',
                                },
                            ],
                            total: 1,
                            filters_applied: {
                                document_type: 'Invoice',
                                start_date: '2025-01-01',
                            },
                        },
                    },
                },
                {
                    status: 401,
                    description: t('Unauthenticated or invalid token'),
                    example: {
                        success: false,
                        message: 'Unauthenticated.',
                        error: 'Unauthenticated.',
                    },
                },
                {
                    status: 422,
                    description: t('Validation error'),
                    example: {
                        success: false,
                        message: 'Validation failed.',
                        errors: {
                            start_date: ['The start date must be a valid date.'],
                        },
                    },
                },
            ],
        },
        'documents.searchByName': {
            method: 'GET',
            path: '/api/v1/documents/search/name',
            description: t('Search documents by name'),
            requiresAuth: true,
            queryParams: [
                {
                    name: 'name',
                    type: 'string',
                    required: true,
                    description: t('Document name to search for (partial match)'),
                },
            ],
            responses: [
                {
                    status: 200,
                    description: t('Search results retrieved successfully'),
                    example: {
                        data: {
                            documents: [
                                {
                                    id: 123,
                                    public_id: 'doc_abc123',
                                    name: 'invoice_2025.pdf',
                                    document_type: 'Invoice',
                                    status: 'completed',
                                    extracted_data: {},
                                    created_at: '2025-01-24T14:30:22.000000Z',
                                },
                            ],
                            total: 1,
                        },
                    },
                },
                {
                    status: 401,
                    description: t('Unauthenticated or invalid token'),
                    example: {
                        success: false,
                        message: 'Unauthenticated.',
                        error: 'Unauthenticated.',
                    },
                },
                {
                    status: 422,
                    description: t('Validation error'),
                    example: {
                        success: false,
                        message: 'Validation failed.',
                        errors: {
                            name: ['The name field is required.'],
                        },
                    },
                },
            ],
        },
        'documents.searchByDate': {
            method: 'POST',
            path: '/api/v1/documents/search/date',
            description: t('Search documents by date range'),
            requiresAuth: true,
            requestBody: {
                type: 'application/json',
                fields: [
                    {
                        name: 'start_date',
                        type: 'string',
                        required: true,
                        description: t('Start date (YYYY-MM-DD)'),
                    },
                    {
                        name: 'end_date',
                        type: 'string',
                        required: true,
                        description: t('End date (YYYY-MM-DD)'),
                    },
                ],
            },
            responses: [
                {
                    status: 200,
                    description: t('Search results retrieved successfully'),
                    example: {
                        data: {
                            documents: [
                                {
                                    id: 123,
                                    public_id: 'doc_abc123',
                                    name: 'invoice.pdf',
                                    document_type: 'Invoice',
                                    status: 'completed',
                                    extracted_data: {},
                                    created_at: '2025-01-24T14:30:22.000000Z',
                                },
                            ],
                            total: 1,
                            date_range: {
                                start: '2025-01-01',
                                end: '2025-01-31',
                            },
                        },
                    },
                },
                {
                    status: 401,
                    description: t('Unauthenticated or invalid token'),
                    example: {
                        success: false,
                        message: 'Unauthenticated.',
                        error: 'Unauthenticated.',
                    },
                },
                {
                    status: 422,
                    description: t('Validation error'),
                    example: {
                        success: false,
                        message: 'Validation failed.',
                        errors: {
                            start_date: ['The start date field is required.'],
                        },
                    },
                },
            ],
        },
    };

    const securityNotes = [
        {
            title: t('Token Expiration'),
            description: t('JWT tokens expire after 60 minutes. Use the refresh endpoint to obtain a new token before expiration.'),
        },
        {
            title: t('Rate Limiting'),
            description: t('API has a rate limit of 60 requests per minute per client. Responses with status 429 indicate the limit has been exceeded.'),
        },
        {
            title: t('IP Whitelist'),
            description: t('Optionally configure allowed IPs for your API client to restrict access from specific locations.'),
        },
        {
            title: t('Secure Storage'),
            description: t('Client secrets are hashed with bcrypt before storage. Never share your client_secret publicly.'),
        },
    ];

    const documentStatuses = [
        { status: 'pending', description: t('Document queued for processing') },
        { status: 'processing', description: t('Document is being processed') },
        { status: 'completed', description: t('Processing completed successfully') },
        { status: 'failed', description: t('Processing failed (check error_message)') },
    ];

    return {
        gettingStarted,
        endpoints,
        securityNotes,
        documentStatuses,
    };
};
