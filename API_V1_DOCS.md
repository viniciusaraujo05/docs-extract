# API v1 Documentation

## Visão Geral

A API v1 do DOCSET permite que clientes externos façam upload de documentos e consultem resultados de extração de dados via JWT authentication.

## Autenticação

Todos os endpoints (exceto `/auth/token`) requerem autenticação JWT via header `Authorization: Bearer <token>`.

### Obter Token JWT

**Endpoint:** `POST /api/v1/auth/token`

**Request:**
```json
{
  "client_id": "test_client_abc123",
  "client_secret": "test_secret_123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

**Response (401):**
```json
{
  "message": "Invalid credentials, client disabled, or IP not allowed."
}
```

### Refresh Token

**Endpoint:** `POST /api/v1/auth/refresh`

**Headers:**
```
Authorization: Bearer <current_token>
```

**Response (200):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

### Logout (Invalidar Token)

**Endpoint:** `POST /api/v1/auth/logout`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Token revoked successfully."
}
```

---

## Endpoints de Documentos

### Upload de Documento

**Endpoint:** `POST /api/v1/documents`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request (multipart/form-data):**
- `file` (required): Arquivo do documento (PDF, JPG, JPEG, PNG, WEBP, max 10MB)
- `type` (required): Tipo do documento (`invoice`, `receipt`, `custom`)
- `document_type_id` (optional): ID do tipo de documento existente
- `schema` (optional): JSON string com schema customizado

**Exemplo cURL:**
```bash
curl -X POST https://api.docset.com/api/v1/documents \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..." \
  -F "file=@invoice.pdf" \
  -F "type=invoice"
```

**Response (201):**
```json
{
  "success": true,
  "message": "Document uploaded successfully and queued for processing.",
  "data": {
    "id": 123,
    "name": "invoice_20250124_143022.pdf",
    "status": "pending",
    "type": "invoice",
    "created_at": "2025-01-24T14:30:22.000000Z"
  }
}
```

**Response (500):**
```json
{
  "success": false,
  "message": "Failed to upload document.",
  "error": "Error details..."
}
```

### Consultar Status/Resultado de Documento

**Endpoint:** `GET /api/v1/documents/{id}`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "name": "invoice_20250124_143022.pdf",
    "original_filename": "invoice.pdf",
    "type": "invoice",
    "status": "completed",
    "extracted_data": {
      "invoice_number": "INV-2025-001",
      "total": 1500.00,
      "date": "2025-01-20",
      "vendor": "Acme Corp"
    },
    "error_message": null,
    "processed_at": "2025-01-24T14:30:45.000000Z",
    "created_at": "2025-01-24T14:30:22.000000Z"
  }
}
```

**Response (404):**
```json
{
  "success": false,
  "message": "Document not found or access denied."
}
```

### Listar Documentos

**Endpoint:** `GET /api/v1/documents`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `per_page` (optional): Número de itens por página (1-100, default: 20)

**Exemplo:**
```bash
curl -X GET "https://api.docset.com/api/v1/documents?per_page=50" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..."
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "name": "invoice_20250124_143022.pdf",
      "type": "invoice",
      "status": "completed",
      "created_at": "2025-01-24T14:30:22.000000Z"
    },
    {
      "id": 124,
      "name": "receipt_20250124_150000.jpg",
      "type": "receipt",
      "status": "processing",
      "created_at": "2025-01-24T15:00:00.000000Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 20,
    "total": 45
  }
}
```

---

## Status de Documentos

- `pending`: Documento na fila de processamento
- `processing`: Documento sendo processado
- `completed`: Processamento concluído com sucesso
- `failed`: Processamento falhou (veja `error_message`)

---

## Rate Limiting

A API possui rate limiting de 60 requisições por minuto por cliente. Respostas com status `429 Too Many Requests` indicam que o limite foi excedido.

---

## Erros Comuns

### 401 Unauthorized
- Token inválido, expirado ou revogado
- Credenciais incorretas
- Cliente desabilitado

### 403 Forbidden
- IP não permitido para o cliente

### 404 Not Found
- Documento não encontrado ou não pertence ao cliente

### 422 Unprocessable Entity
- Validação falhou (ex: arquivo muito grande, tipo inválido)

### 429 Too Many Requests
- Rate limit excedido

### 500 Internal Server Error
- Erro no processamento do servidor

---

## Setup para Desenvolvimento

### 1. Rodar Migrations

```bash
php artisan migrate
```

### 2. Gerar JWT Secret

```bash
php artisan jwt:secret
```

### 3. Criar Cliente de API de Teste

```bash
php artisan db:seed --class=ApiClientSeeder
```

Isso criará um cliente com credenciais de teste que serão exibidas no terminal.

### 4. Testar Autenticação

```bash
curl -X POST http://localhost:8000/api/v1/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "test_client_abc123",
    "client_secret": "test_secret_123"
  }'
```

---

## Arquitetura

### Componentes Principais

- **`ApiClient` Model**: Armazena credenciais e configurações de clientes
- **`ApiClientRepository`**: Acesso a dados de clientes
- **`AuthenticateApiClientAction`**: Lógica de autenticação e geração de JWT
- **`AuthTokenController`**: Endpoints de autenticação (login, refresh, logout)
- **`DocumentControllerApi`**: Endpoints de documentos (upload, status, listagem)
- **`StoreDocumentAction`**: Reutiliza lógica existente de upload e processamento

### Fluxo de Autenticação

1. Cliente envia `client_id` + `client_secret` para `/api/v1/auth/token`
2. Sistema valida credenciais, status e IP (se configurado)
3. JWT é gerado com claims customizadas (`client_public_id`, `client_name`)
4. Cliente usa o JWT em todas as requisições subsequentes via header `Authorization`
5. Middleware `auth:api` valida o JWT e injeta o `ApiClient` autenticado
6. Cliente pode renovar o token via `/api/v1/auth/refresh` antes de expirar

### Segurança

- Secrets são hasheados com bcrypt antes de serem armazenados
- JWT assinado com `JWT_SECRET` (configurado via `php artisan jwt:secret`)
- Suporte a whitelist de IPs por cliente (campo `allowed_ips`)
- Rate limiting de 60 req/min por cliente
- Tokens podem ser revogados via blacklist
- TTL padrão de 60 minutos (configurável em `config/jwt.php`)

---

## Próximos Passos

- [ ] Implementar webhook para notificar cliente quando processamento completar
- [ ] Adicionar endpoint para deletar documentos
- [ ] Implementar filtros avançados na listagem (por status, tipo, data)
- [ ] Adicionar métricas e logs de uso por cliente
- [ ] Documentação OpenAPI/Swagger
