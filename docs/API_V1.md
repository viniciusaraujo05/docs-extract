# API V1 - Docset (Documentação Técnica)

Esta documentação descreve a API v1 conforme implementada no backend e nas telas de referência do frontend.

**Base URL**

O base URL depende do domínio configurado para API:

- Produção típica com `API_DOMAIN`: `https://api.docset.app/v1`
- Sem `API_DOMAIN`: use o caminho exibido por `php artisan route:list --path=v1` no seu ambiente

**Autenticação**

Todas as rotas (exceto `POST /v1/auth/token`) exigem JWT:

```
Authorization: Bearer <access_token>
```

**Rate limit**

Rotas autenticadas usam `throttle:60,1` (60 requests por minuto por cliente).

**Status de documentos**

- `pending`: documento enfileirado
- `processing`: processamento em andamento
- `completed`: concluído
- `failed`: falhou (ver `error_message` quando existir)

---

## Autenticação

### `POST /v1/auth/token`

Obtém um JWT usando `client_id` e `client_secret`.

**Body** `application/json`

- `client_id` (string, obrigatório)
- `client_secret` (string, obrigatório)

**Resposta 200**

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

**Resposta 401**

```json
{
  "success": false,
  "message": "Invalid credentials, client disabled, or IP not allowed."
}
```

### `POST /v1/auth/refresh`

Renova o token atual.

**Resposta 200**

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

**Resposta 401**

```json
{
  "success": false,
  "message": "Unauthenticated.",
  "error": "Unauthenticated."
}
```

### `POST /v1/auth/logout`

Revoga o token atual.

**Resposta 200**

```json
{
  "success": true,
  "message": "Token revoked successfully."
}
```

---

## Document Types (Modelos)

### `GET /v1/document-types`

Lista os modelos do usuário.

**Resposta 200**

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
        { "name": "invoice_number", "type": "string", "description": "Invoice number", "required": true }
      ],
      "created_at": "2024-01-08T17:30:00.000Z"
    }
  ]
}
```

### `POST /v1/document-types`

Cria um novo modelo.

**Body** `application/json`

- `name` (string, obrigatório)
- `description` (string, opcional)
- `fields` (array, obrigatório)
- `fields[].name` (string, obrigatório)
- `fields[].type` (string, obrigatório: `string|number|date|boolean|array|object`)
- `fields[].description` (string, opcional)
- `fields[].required` (boolean, opcional)

**Resposta 201**

```json
{
  "success": true,
  "message": "Document type created successfully.",
  "data": {
    "id": 5,
    "name": "Invoice",
    "description": "Commercial invoice model",
    "fields": [
      { "name": "invoice_number", "type": "string", "required": true }
    ],
    "created_at": "2024-01-08T17:30:00.000Z"
  }
}
```

**Resposta 422**

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

Retorna um modelo específico.

**Resposta 200**

```json
{
  "success": true,
  "message": "Document type retrieved successfully.",
  "data": {
    "id": 5,
    "name": "Invoice",
    "description": "Commercial invoice model",
    "fields": [
      { "name": "invoice_number", "type": "string", "required": true }
    ],
    "created_at": "2024-01-08T17:30:00.000Z"
  }
}
```

**Resposta 404**

```json
{
  "success": false,
  "message": "Document type not found."
}
```

### `PUT /v1/document-types/{id}`

Atualiza um modelo.

**Body** `application/json`

- `name` (string, opcional)
- `description` (string, opcional)
- `fields` (array, opcional)
- `fields[].name` (string, obrigatório quando `fields` existir)
- `fields[].type` (string, obrigatório quando `fields` existir)
- `fields[].description` (string, opcional)
- `fields[].required` (boolean, opcional)

**Resposta 200**

```json
{
  "success": true,
  "message": "Document type updated successfully.",
  "data": {
    "id": 5,
    "name": "Commercial Invoice",
    "updated_at": "2024-01-08T18:00:00.000Z"
  }
}
```

### `DELETE /v1/document-types/{id}`

Remove um modelo.

**Resposta 200**

```json
{
  "success": true,
  "message": "Document type deleted successfully."
}
```

---

## Documentos

### `POST /v1/documents`

Upload de documento para processamento assíncrono.

**Body** `multipart/form-data`

- `file` (arquivo, obrigatório: PDF, JPG, JPEG, PNG, WEBP; máx 10MB)
- `type` (string, obrigatório: `invoice|receipt|custom`)
- `document_type_id` (integer, opcional)
- `schema` (string JSON, opcional)

**Resposta 201**

```json
{
  "success": true,
  "message": "Document uploaded successfully and queued for processing.",
  "data": {
    "id": 123,
    "name": "invoice.pdf",
    "status": "pending",
    "type": "invoice",
    "created_at": "2024-01-08T17:30:00.000Z"
  }
}
```

### `POST /v1/documents/extract`

Extrai e armazena dados imediatamente usando um modelo.

**Body** `multipart/form-data`

- `file` (arquivo, obrigatório: PDF, JPG, JPEG, PNG, WEBP; máx 10MB)
- `document_type_id` (integer, obrigatório)
- `force_overwrite` (boolean, opcional; padrão `false`)

**Resposta 201**

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
      "invoice_number": "INV-2024-001",
      "total": 1500
    },
    "created_at": "2024-01-08T17:30:00.000Z"
  }
}
```

**Resposta 409 (duplicado)**

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

Lista documentos com paginação.

**Query params**

- `per_page` (integer, opcional; padrão 20; min 1; max 100)

**Resposta 200**

```json
{
  "data": [
    {
      "id": 123,
      "public_id": "doc_abc123",
      "name": "invoice.pdf",
      "document_type": "Invoice",
      "status": "completed",
      "extracted_data": { "invoice_number": "INV-2025-001" },
      "created_at": "2025-01-24T14:30:22.000000Z"
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

Detalhes de um documento.

**Resposta 200**

```json
{
  "data": {
    "id": 123,
    "name": "invoice.pdf",
    "document_type": "Invoice",
    "status": "completed",
    "extracted_data": { "invoice_number": "INV-2025-001" },
    "created_at": "2025-01-24T14:30:22.000000Z"
  }
}
```

**Resposta 404**

```json
{
  "success": false,
  "message": "Document not found or access denied."
}
```

### `GET /v1/documents/filter`

Filtra documentos por tipo, data e nome.

**Query params**

- `document_type` (string, opcional)
- `start_date` (string, opcional; `YYYY-MM-DD`)
- `end_date` (string, opcional; `YYYY-MM-DD`)
- `name` (string, opcional)

**Resposta 200**

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
        "extracted_data": { "invoice_number": "INV-2025-001" },
        "created_at": "2025-01-24T14:30:22.000000Z"
      }
    ],
    "total": 1,
    "filters_applied": {
      "document_type": "Invoice",
      "start_date": "2025-01-01"
    }
  }
}
```

### `GET /v1/documents/search/name`

Busca por nome.

**Query params**

- `name` (string, obrigatório)

**Resposta 200**

```json
{
  "data": [
    {
      "id": 123,
      "public_id": "doc_abc123",
      "name": "invoice_2025.pdf",
      "document_type": "Invoice",
      "status": "completed",
      "extracted_data": {},
      "created_at": "2025-01-24T14:30:22.000000Z"
    }
  ]
}
```

**Resposta 404**

```json
{
  "success": false,
  "message": "No documents found with the specified name."
}
```

**Resposta 422**

```json
{
  "success": false,
  "message": "The name parameter is required."
}
```

### `POST /v1/documents/search/date`

Busca por intervalo de datas.

**Body** `application/json`

- `start_date` (string, obrigatório; `YYYY-MM-DD`)
- `end_date` (string, obrigatório; `YYYY-MM-DD`)
- `per_page` (integer, opcional; 1-100)

**Resposta 200**

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
      "created_at": "2025-01-24T14:30:22.000000Z"
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
      "start_date": "2025-01-01",
      "end_date": "2025-01-31"
    }
  }
}
```

---

## Observações de segurança

- Tokens JWT expiram em 60 minutos.
- É possível restringir o acesso por IP no cadastro do API Client.
- `client_secret` é armazenado com hash e só é mostrado uma vez na criação.
