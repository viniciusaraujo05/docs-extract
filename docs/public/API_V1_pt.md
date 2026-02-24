# DOCSET API v1 - Documentacao Publica

Esta referencia descreve a API v1 publica atualmente disponivel no DOCSET.

## Base URLs

Use a base principal para endpoints JWT:

- API JWT (principal): `https://api.docset.app/v1`

Se estiver em ambiente custom/self-hosted, confirme os caminhos com `php artisan route:list --path=v1`.

## Modelos de Autenticacao

### 1) JWT (para endpoints `/v1/...`)

1. Crie um API client no DOCSET.
2. Chame `POST /v1/auth/token` com `client_id` + `client_secret`.
3. Envie `Authorization: Bearer <access_token>` nos endpoints protegidos.
4. Renove com `POST /v1/auth/refresh` antes de expirar.

## Headers Padrao

### Endpoints JSON

```http
Accept: application/json
Authorization: Bearer <token>
Content-Type: application/json
```

### Endpoints de upload

```http
Accept: application/json
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

## Rate Limits

- Rotas v1 autenticadas: `60 requisicoes/minuto` por client (`throttle:60,1`).

## Status de Documento

- `pending`
- `processing`
- `completed`
- `failed`

---

## Endpoints de Auth

### `POST /v1/auth/token`

Obtem token JWT com `client_id` e `client_secret`.

Body (`application/json`):

- `client_id` (string, obrigatorio, max 64)
- `client_secret` (string, obrigatorio, max 255)

Resposta `200`:

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

Resposta `401`:

```json
{
  "success": false,
  "message": "Invalid credentials, client disabled, or IP not allowed."
}
```

### `POST /v1/auth/refresh`

Renova o token JWT atual.

Resposta `200`:

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

Resposta `401`:

```json
{
  "success": false,
  "message": "Unauthenticated.",
  "error": "Unauthenticated."
}
```

### `POST /v1/auth/logout`

Revoga o token atual.

Resposta `200`:

```json
{
  "success": true,
  "message": "Token revoked successfully."
}
```

---

## Endpoints de Document Types

### `GET /v1/document-types`

Lista os modelos do utilizador autenticado.

### `POST /v1/document-types`

Cria um modelo.

Body (`application/json`):

- `name` (string, obrigatorio)
- `description` (string, opcional)
- `fields` (array, obrigatorio, min 1)
- `fields[].name` (string, obrigatorio)
- `fields[].type` (obrigatorio: `string|number|date|boolean|array|object`)
- `fields[].description` (string, opcional)
- `fields[].required` (boolean, opcional)

Resposta `201`:

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

### `GET /v1/document-types/{id}`

Devolve um modelo especifico.

### `PUT /v1/document-types/{id}`

Atualiza um modelo especifico.

Body (`application/json`, todos opcionais):

- `name`
- `description`
- `fields`

### `DELETE /v1/document-types/{id}`

Apaga um modelo especifico.

---

## Endpoints de Documentos

### `POST /v1/documents`

Faz upload de documento para processamento assincrono.

Body (`multipart/form-data`):

- `file` (obrigatorio; `pdf,jpg,jpeg,png,webp`; max 10MB)
- `type` (obrigatorio: `invoice|receipt|custom`)
- `document_type_id` (opcional integer)
- `schema` (opcional JSON string)

Resposta `201`:

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

Extrai e guarda um documento imediatamente usando `document_type_id`.

Body (`multipart/form-data`):

- `file` (obrigatorio; `pdf,jpg,jpeg,png,webp`; max 10MB)
- `document_type_id` (obrigatorio integer)
- `force_overwrite` (opcional boolean; default `false`)

Resposta `201`:

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

Resposta `409` (duplicado quando `force_overwrite=false`):

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

Lista documentos com paginacao.

Query params:

- `per_page` (opcional integer, intervalo `1..100`, default `20`)

### `GET /v1/documents/{id}`

Devolve um documento especifico.

### `GET /v1/documents/filter`

Filtra documentos por criterios opcionais.

Query params (todos opcionais):

- `document_type` (string)
- `start_date` (date)
- `end_date` (date, deve ser `>= start_date`)
- `name` (string)

### `GET /v1/documents/search/name`

Pesquisa por nome parcial.

Query params:

- `name` (string obrigatorio)

### `POST /v1/documents/search/date`

Pesquisa por intervalo de datas.

Body (`application/json`):

- `start_date` (date obrigatoria)
- `end_date` (date obrigatoria, deve ser `>= start_date`)
- `per_page` (integer opcional `1..100`)

---

## cURL Quick Start

```bash
# 1) Obter token JWT
curl -X POST "https://api.docset.app/v1/auth/token" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "client_id": "your_client_id",
    "client_secret": "your_client_secret"
  }'

# 2) Upload documento
curl -X POST "https://api.docset.app/v1/documents" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Accept: application/json" \
  -F "file=@invoice.pdf" \
  -F "type=invoice"

# 3) Extrair com modelo
curl -X POST "https://api.docset.app/v1/documents/extract" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Accept: application/json" \
  -F "file=@invoice.pdf" \
  -F "document_type_id=5"
```

## Notas de Seguranca

- Guarde `client_secret` apenas no backend.
- Rode credenciais quando necessario.
- Use restricao de IP sempre que possivel.
- Evite enviar dados sensiveis em query string.
