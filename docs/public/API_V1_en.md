# DOCSET API v1 - Public Documentation

This reference describes the public API v1 currently available in DOCSET.

## Base URLs

Use the main base URL for JWT endpoints:

- JWT API (main): `https://api.docset.app/v1`

If you run a custom/self-hosted environment, verify actual paths with `php artisan route:list --path=v1`.

## Authentication Models

### 1) JWT (for `/v1/...` endpoints)

1. Create an API client in DOCSET.
2. Call `POST /v1/auth/token` with `client_id` + `client_secret`.
3. Send `Authorization: Bearer <access_token>` on protected endpoints.
4. Refresh with `POST /v1/auth/refresh` before expiration.

## Standard Headers

### JSON endpoints

```http
Accept: application/json
Authorization: Bearer <token>
Content-Type: application/json
```

### File upload endpoints

```http
Accept: application/json
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

## Rate Limits

- Authenticated v1 routes: `60 requests/minute` per client (`throttle:60,1`).

## Common Document Status Values

- `pending`
- `processing`
- `completed`
- `failed`

---

## Auth Endpoints

### `POST /v1/auth/token`

Get a JWT token from `client_id` and `client_secret`.

Request body (`application/json`):

- `client_id` (string, required, max 64)
- `client_secret` (string, required, max 255)

Response `200`:

```json
{
  "token_type": "Bearer",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "expires_in": 3600,
  "client": {
    "id": "cli_xxx",
    "name": "My Client",
    "status": "active",
    "rate_limit_per_minute": 60
  }
}
```

Response `401`:

```json
{
  "success": false,
  "message": "Invalid credentials, client disabled, or IP not allowed."
}
```

### `POST /v1/auth/refresh`

Refresh current JWT token.

Response `200`:

```json
{
  "token_type": "Bearer",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "expires_in": 3600,
  "client": {
    "id": "cli_xxx",
    "name": "My Client",
    "status": "active",
    "rate_limit_per_minute": 60
  }
}
```

Response `401`:

```json
{
  "success": false,
  "message": "Unauthenticated.",
  "error": "Unauthenticated."
}
```

### `POST /v1/auth/logout`

Revoke current JWT token.

Response `200`:

```json
{
  "success": true,
  "message": "Token revoked successfully."
}
```

---

## Document Type Endpoints

### `GET /v1/document-types`

List document types (models) for authenticated user.

Response `200`:

```json
{
  "success": true,
  "message": "Document types retrieved successfully.",
  "data": [
    {
      "id": 5,
      "name": "Invoice",
      "description": "Commercial invoice model",
      "fields": [
        {
          "name": "invoice_number",
          "type": "string",
          "required": true
        }
      ],
      "created_at": "2026-02-24T10:00:00.000Z"
    }
  ]
}
```

### `POST /v1/document-types`

Create a document type.

Request body (`application/json`):

- `name` (string, required)
- `description` (string, optional)
- `fields` (array, required, min 1)
- `fields[].name` (string, required)
- `fields[].type` (required: `string|number|date|boolean|array|object`)
- `fields[].description` (string, optional)
- `fields[].required` (boolean, optional)

Response `201`:

```json
{
  "success": true,
  "message": "Document type created successfully.",
  "data": {
    "id": 5,
    "name": "Invoice",
    "description": "Commercial invoice model",
    "fields": [
      {
        "name": "invoice_number",
        "type": "string",
        "required": true
      }
    ],
    "created_at": "2026-02-24T10:00:00.000Z"
  }
}
```

Response `422`:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "name": ["Document type name is required."],
    "fields": ["At least one field is required."]
  }
}
```

### `GET /v1/document-types/{id}`

Get one document type.

Response `200`:

```json
{
  "success": true,
  "message": "Document type retrieved successfully.",
  "data": {
    "id": 5,
    "name": "Invoice",
    "description": "Commercial invoice model",
    "fields": [
      {
        "name": "invoice_number",
        "type": "string",
        "required": true
      }
    ],
    "created_at": "2026-02-24T10:00:00.000Z"
  }
}
```

Response `404`:

```json
{
  "success": false,
  "message": "Document type not found."
}
```

### `PUT /v1/document-types/{id}`

Update one document type.

Request body (`application/json`, all optional):

- `name`
- `description`
- `fields`

Response `200`:

```json
{
  "success": true,
  "message": "Document type updated successfully.",
  "data": {
    "id": 5,
    "name": "Commercial Invoice",
    "description": "Updated description",
    "fields": [
      {
        "name": "invoice_number",
        "type": "string",
        "required": true
      }
    ],
    "updated_at": "2026-02-24T10:30:00.000Z"
  }
}
```

### `DELETE /v1/document-types/{id}`

Delete one document type.

Response `200`:

```json
{
  "success": true,
  "message": "Document type deleted successfully."
}
```

---

## Document Endpoints

### `POST /v1/documents`

Upload a document for asynchronous processing.

Request body (`multipart/form-data`):

- `file` (required; `pdf,jpg,jpeg,png,webp`; max 10MB)
- `type` (required: `invoice|receipt|custom`)
- `document_type_id` (optional integer)
- `schema` (optional JSON string)

Response `201`:

```json
{
  "success": true,
  "message": "Document uploaded successfully and queued for processing.",
  "data": {
    "id": 123,
    "name": "invoice.pdf",
    "status": "pending",
    "type": "invoice",
    "created_at": "2026-02-24T10:45:00.000Z"
  }
}
```

### `POST /v1/documents/extract`

Extract and store a document immediately using `document_type_id`.

Request body (`multipart/form-data`):

- `file` (required; `pdf,jpg,jpeg,png,webp`; max 10MB)
- `document_type_id` (required integer)
- `force_overwrite` (optional boolean; default `false`)

Response `201`:

```json
{
  "success": true,
  "message": "Document extracted and stored successfully.",
  "data": {
    "id": 123,
    "name": "invoice.pdf",
    "document_type": "Invoice",
    "status": "completed",
    "extracted_data": {
      "invoice_number": "INV-2026-1001",
      "total": 14940
    },
    "created_at": "2026-02-24T10:50:00.000Z"
  }
}
```

Response `409` (duplicate when `force_overwrite=false`):

```json
{
  "success": false,
  "message": "Document already exists.",
  "meta": {
    "duplicate_filename": "invoice.pdf",
    "hint": "Use force_overwrite=true to replace the existing document."
  }
}
```

### `GET /v1/documents`

List documents with pagination.

Query params:

- `per_page` (optional integer, range `1..100`, default `20`)

Response `200`:

```json
{
  "data": [
    {
      "id": 123,
      "public_id": "doc_abc123",
      "name": "invoice.pdf",
      "document_type": "Invoice",
      "status": "completed",
      "extracted_data": {
        "invoice_number": "INV-2026-1001"
      },
      "created_at": "2026-02-24T10:45:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "current_page": 1,
      "last_page": 3,
      "per_page": 20,
      "total": 45
    }
  }
}
```

### `GET /v1/documents/{id}`

Get one document.

Response `200`:

```json
{
  "data": {
    "id": 123,
    "name": "invoice.pdf",
    "document_type": "Invoice",
    "status": "completed",
    "extracted_data": {
      "invoice_number": "INV-2026-1001"
    },
    "created_at": "2026-02-24T10:45:00.000Z"
  }
}
```

Response `404`:

```json
{
  "success": false,
  "message": "Document not found or access denied."
}
```

### `GET /v1/documents/filter`

Filter documents with optional criteria.

Query params (all optional):

- `document_type` (string)
- `start_date` (date)
- `end_date` (date, must be `>= start_date`)
- `name` (string)

Response `200`:

```json
{
  "data": {
    "documents": [
      {
        "id": 123,
        "public_id": "doc_abc123",
        "name": "invoice.pdf",
        "document_type": "Invoice",
        "status": "completed",
        "extracted_data": {
          "invoice_number": "INV-2026-1001"
        },
        "created_at": "2026-02-24T10:45:00.000Z"
      }
    ],
    "total": 1,
    "filters_applied": {
      "document_type": "Invoice",
      "name": "invoice"
    }
  }
}
```

### `GET /v1/documents/search/name`

Search documents by partial name.

Query params:

- `name` (required string)

Response `200`:

```json
{
  "data": [
    {
      "id": 123,
      "public_id": "doc_abc123",
      "name": "invoice_2026.pdf",
      "document_type": "Invoice",
      "status": "completed",
      "extracted_data": {},
      "created_at": "2026-02-24T10:45:00.000Z"
    }
  ]
}
```

Response `404`:

```json
{
  "success": false,
  "message": "No documents found with the specified name."
}
```

Response `422`:

```json
{
  "success": false,
  "message": "The name parameter is required."
}
```

### `POST /v1/documents/search/date`

Search documents by date range.

Request body (`application/json`):

- `start_date` (required date)
- `end_date` (required date, must be `>= start_date`)
- `per_page` (optional integer `1..100`)

Response `200`:

```json
{
  "data": [
    {
      "id": 123,
      "public_id": "doc_abc123",
      "name": "invoice.pdf",
      "document_type": "Invoice",
      "status": "completed",
      "extracted_data": {},
      "created_at": "2026-02-24T10:45:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "current_page": 1,
      "last_page": 3,
      "per_page": 20,
      "total": 45
    },
    "date_range": {
      "start_date": "2026-02-01",
      "end_date": "2026-02-24"
    }
  }
}
```

---

## cURL Quick Start

```bash
# 1) Get JWT token
curl -X POST "https://api.docset.app/v1/auth/token" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "client_id": "your_client_id",
    "client_secret": "your_client_secret"
  }'

# 2) Upload document
curl -X POST "https://api.docset.app/v1/documents" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Accept: application/json" \
  -F "file=@invoice.pdf" \
  -F "type=invoice"

# 3) Extract with model
curl -X POST "https://api.docset.app/v1/documents/extract" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Accept: application/json" \
  -F "file=@invoice.pdf" \
  -F "document_type_id=5"
```

## Security Notes

- Keep `client_secret` server-side only.
- Rotate credentials when needed.
- Use IP restrictions on API clients when possible.
- Avoid sending sensitive data in query strings.
