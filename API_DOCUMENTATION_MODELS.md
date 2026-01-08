# API v1 - Document Types (Models) & Extraction Flow

## 🎯 Fluxo Completo de Uso

### 1️⃣ Criar um Modelo (Document Type)
### 2️⃣ Extrair Documento usando o Modelo
### 3️⃣ Gerenciar Modelos

---

## 📋 Passo 1: Criar Modelo (Document Type)

### `POST /api/v1/document-types`

Cria um novo modelo de documento com campos personalizados que serão extraídos pela IA.

**Headers:**
```
Authorization: Bearer {seu_token_jwt}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Invoice",
  "description": "Modelo para faturas comerciais",
  "fields": [
    {
      "name": "invoice_number",
      "type": "string",
      "description": "Número da fatura",
      "required": true
    },
    {
      "name": "date",
      "type": "date",
      "description": "Data de emissão",
      "required": true
    },
    {
      "name": "total",
      "type": "number",
      "description": "Valor total",
      "required": true
    },
    {
      "name": "vendor",
      "type": "string",
      "description": "Nome do fornecedor",
      "required": false
    },
    {
      "name": "items",
      "type": "array",
      "description": "Lista de itens",
      "required": false
    }
  ]
}
```

**Tipos de Campo Suportados:**
- `string` - Texto
- `number` - Números (inteiros ou decimais)
- `date` - Datas
- `boolean` - Verdadeiro/Falso
- `array` - Lista de itens
- `object` - Objeto complexo

**Resposta (201 Created):**
```json
{
  "success": true,
  "message": "Document type created successfully.",
  "data": {
    "id": 5,
    "name": "Invoice",
    "description": "Modelo para faturas comerciais",
    "fields": [
      {
        "name": "invoice_number",
        "type": "string",
        "description": "Número da fatura",
        "required": true
      },
      {
        "name": "date",
        "type": "date",
        "description": "Data de emissão",
        "required": true
      },
      {
        "name": "total",
        "type": "number",
        "description": "Valor total",
        "required": true
      }
    ],
    "created_at": "2024-01-08T17:30:00.000Z"
  }
}
```

---

## 📤 Passo 2: Extrair Documento usando o Modelo

### `POST /api/v1/documents/extract`

Envia um documento e extrai os dados conforme o modelo criado.

**Headers:**
```
Authorization: Bearer {seu_token_jwt}
Content-Type: multipart/form-data
```

**Body (multipart/form-data):**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `file` | File | ✅ Sim | Documento (PDF, JPG, JPEG, PNG, WEBP) - Max 10MB |
| `document_type_id` | Integer | ✅ Sim | ID do modelo criado no Passo 1 |
| `force_overwrite` | Boolean | ❌ Não | Se true, sobrescreve documento existente com mesmo nome (default: false) |

**Exemplo cURL:**
```bash
curl -X POST https://api.com/api/v1/documents/extract \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@invoice.pdf" \
  -F "document_type_id=5"
```

**Resposta (201 Created):**
```json
{
  "success": true,
  "message": "Document extracted and stored successfully.",
  "data": {
    "id": 123,
    "name": "invoice",
    "document_type": "Invoice",
    "status": "completed",
    "extracted_data": {
      "invoice_number": "INV-2024-001",
      "date": "2024-01-08",
      "total": 1500.00,
      "vendor": "ACME Corp",
      "items": [
        {
          "description": "Product A",
          "quantity": 2,
          "price": 750.00
        }
      ],
      "confidence": 95
    },
    "created_at": "2024-01-08T17:30:00.000Z"
  }
}
```

**Erro (400 Bad Request) - Modelo Inválido:**
```json
{
  "success": false,
  "message": "Invalid document type or you do not have permission to use it."
}
```

**Erro (422 Validation Error) - Modelo Não Fornecido:**
```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "document_type_id": [
      "Document type (model) is required."
    ]
  }
}
```

---

## 📚 Gerenciar Modelos

### Listar Todos os Modelos

**`GET /api/v1/document-types`**

```bash
curl -X GET https://api.com/api/v1/document-types \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Resposta:**
```json
{
  "success": true,
  "message": "Document types retrieved successfully.",
  "data": [
    {
      "id": 5,
      "name": "Invoice",
      "description": "Modelo para faturas comerciais",
      "fields": [...],
      "created_at": "2024-01-08T17:30:00.000Z"
    },
    {
      "id": 6,
      "name": "Receipt",
      "description": "Modelo para recibos",
      "fields": [...],
      "created_at": "2024-01-08T18:00:00.000Z"
    }
  ]
}
```

---

### Ver Modelo Específico

**`GET /api/v1/document-types/{id}`**

```bash
curl -X GET https://api.com/api/v1/document-types/5 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Atualizar Modelo

**`PUT /api/v1/document-types/{id}`**

```bash
curl -X PUT https://api.com/api/v1/document-types/5 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Commercial Invoice",
    "description": "Updated description",
    "fields": [...]
  }'
```

---

### Deletar Modelo

**`DELETE /api/v1/document-types/{id}`**

```bash
curl -X DELETE https://api.com/api/v1/document-types/5 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔄 Fluxo Completo - Exemplo Prático

### Cenário: Extrair dados de faturas

**1. Criar modelo de Invoice:**
```bash
curl -X POST https://api.com/api/v1/document-types \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Invoice",
    "fields": [
      {"name": "invoice_number", "type": "string", "required": true},
      {"name": "date", "type": "date", "required": true},
      {"name": "total", "type": "number", "required": true},
      {"name": "vendor", "type": "string", "required": false}
    ]
  }'
```

**Resposta:** `id: 5`

**2. Extrair documento usando o modelo:**
```bash
curl -X POST https://api.com/api/v1/documents/extract \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@invoice_jan.pdf" \
  -F "document_type_id=5"
```

**3. A IA extrai os dados conforme os campos definidos:**
```json
{
  "extracted_data": {
    "invoice_number": "INV-2024-001",
    "date": "2024-01-08",
    "total": 1500.00,
    "vendor": "ACME Corp"
  }
}
```

---

## ✨ Características

- ✅ **Modelos Personalizados** - Defina exatamente quais campos extrair
- ✅ **Validação de Ownership** - Só pode usar modelos que você criou
- ✅ **Extração Inteligente** - IA extrai dados conforme schema do modelo
- ✅ **Armazenamento Automático** - Documento e dados salvos automaticamente
- ✅ **Validação de Duplicatas** - Previne documentos duplicados
- ✅ **CRUD Completo** - Criar, listar, atualizar e deletar modelos
- ✅ **Tracking de Uso** - Conta como API request e document no plano

---

## 🎯 Diferenças entre Endpoints

| Endpoint | Requer Modelo? | Processamento | Retorna |
|----------|----------------|---------------|---------|
| `POST /api/v1/documents` | ❌ Opcional | Assíncrono (fila) | ID do documento (status: pending) |
| `POST /api/v1/documents/extract` | ✅ Obrigatório | Síncrono (imediato) | Documento completo com JSON extraído (status: completed) |

---

## 📝 Notas Importantes

1. **Modelo Obrigatório:** O endpoint `/documents/extract` REQUER um `document_type_id` válido
2. **Ownership:** Você só pode usar modelos que você mesmo criou
3. **Schema Dinâmico:** A IA extrai dados conforme os campos definidos no modelo
4. **Validação:** Se o modelo não existir ou não for seu, retorna erro 400
5. **Limites:** Criar modelos conta no limite de `models` do seu plano
6. **Processamento:** Extração é síncrona e pode demorar 10-30 segundos

---

## 🔍 Troubleshooting

### Erro: "Document type (model) is required"
**Causa:** Você não forneceu o `document_type_id`  
**Solução:** Crie um modelo primeiro e use o ID na extração

### Erro: "Invalid document type or you do not have permission to use it"
**Causa:** O modelo não existe ou pertence a outro usuário  
**Solução:** Verifique o ID do modelo e certifique-se que você o criou

### Erro: "Invalid document type. Please create a document type first"
**Causa:** O `document_type_id` não existe no banco de dados  
**Solução:** Liste seus modelos com `GET /api/v1/document-types` e use um ID válido

---

## 💡 Exemplos de Modelos

### Modelo para Contratos
```json
{
  "name": "Contract",
  "fields": [
    {"name": "contract_number", "type": "string", "required": true},
    {"name": "parties", "type": "array", "required": true},
    {"name": "start_date", "type": "date", "required": true},
    {"name": "end_date", "type": "date", "required": false},
    {"name": "value", "type": "number", "required": true},
    {"name": "terms", "type": "object", "required": false}
  ]
}
```

### Modelo para Recibos
```json
{
  "name": "Receipt",
  "fields": [
    {"name": "receipt_number", "type": "string", "required": true},
    {"name": "date", "type": "date", "required": true},
    {"name": "amount", "type": "number", "required": true},
    {"name": "payment_method", "type": "string", "required": false},
    {"name": "merchant", "type": "string", "required": true}
  ]
}
```

### Modelo para Notas Fiscais
```json
{
  "name": "Tax Invoice",
  "fields": [
    {"name": "nfe_number", "type": "string", "required": true},
    {"name": "issue_date", "type": "date", "required": true},
    {"name": "total_value", "type": "number", "required": true},
    {"name": "tax_value", "type": "number", "required": true},
    {"name": "issuer", "type": "object", "required": true},
    {"name": "recipient", "type": "object", "required": true},
    {"name": "items", "type": "array", "required": true}
  ]
}
```
