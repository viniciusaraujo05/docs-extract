# API v1 - Document Extraction Endpoint

## 🚀 Instant Document Extraction & Storage

### `POST /api/v1/documents/extract`

Extrai dados de um documento **imediatamente** e armazena no sistema, retornando o documento completo com dados extraídos.

**Ideal para:** Integrações que precisam de processamento instantâneo e armazenamento do documento.

---

## 📋 Diferenças entre Endpoints

| Endpoint | Armazena? | Processamento | Retorna |
|----------|-----------|---------------|---------|
| `POST /api/v1/documents` | ✅ Sim | Assíncrono (fila) | ID do documento (status: pending) |
| `POST /api/v1/documents/extract` | ✅ Sim | Síncrono (imediato) | Documento completo com JSON extraído (status: completed) |

---

## 🔐 Autenticação

Requer **JWT token** no header:
```
Authorization: Bearer {seu_token_jwt}
```

---

## 📤 Request

### Headers
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

### Body (multipart/form-data)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `file` | File | ✅ Sim | Documento (PDF, JPG, JPEG, PNG, WEBP) - Max 10MB |
| `type` | String | ❌ Não | Tipo: `invoice`, `receipt`, `custom` (default: `custom`) |
| `document_type_id` | Integer | ❌ Não | ID do modelo de documento personalizado |
| `schema` | JSON String | ❌ Não | Schema customizado para extração |
| `force_overwrite` | Boolean | ❌ Não | Se true, sobrescreve documento existente com mesmo nome (default: false) |

---

## 📥 Response

### Success (201 Created)

```json
{
  "success": true,
  "message": "Document extracted and stored successfully.",
  "data": {
    "id": 123,
    "name": "invoice_january",
    "document_type": "Invoice",
    "status": "completed",
    "extracted_data": {
      "invoice_number": "INV-2024-001",
      "date": "2024-01-08",
      "total": 1500.00,
      "vendor": "ACME Corp",
      "confidence": 95
    },
    "created_at": "2024-01-08T17:30:00.000Z"
  }
}
```

### Error (500 Internal Server Error)

```json
{
  "success": false,
  "message": "Failed to extract and store document.",
  "meta": {
    "error": "Error details here"
  }
}
```

---

## 💡 Exemplos de Uso

### 1. Extração com Schema Padrão (Invoice)

```bash
curl -X POST https://your-domain.com/api/v1/documents/extract \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@invoice.pdf" \
  -F "type=invoice"
```

### 2. Extração com Modelo Personalizado

```bash
curl -X POST https://your-domain.com/api/v1/documents/extract \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@document.pdf" \
  -F "document_type_id=5"
```

### 3. Extração com Schema Customizado

```bash
curl -X POST https://your-domain.com/api/v1/documents/extract \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@contract.pdf" \
  -F 'schema={"fields":[{"name":"contract_number","type":"string"},{"name":"start_date","type":"date"}]}'
```

### 4. JavaScript/TypeScript Example

```typescript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('type', 'invoice');

const response = await fetch('https://your-domain.com/api/v1/documents/extract', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log(result.data.extracted_data);
```

### 5. Python Example

```python
import requests

url = "https://your-domain.com/api/v1/documents/extract"
headers = {"Authorization": f"Bearer {token}"}
files = {"file": open("invoice.pdf", "rb")}
data = {"type": "invoice"}

response = requests.post(url, headers=headers, files=files, data=data)
extracted_data = response.json()["data"]["extracted_data"]
print(extracted_data)
```

---

## ⚡ Características

- ✅ **Processamento instantâneo** - Extrai e retorna dados imediatamente
- ✅ **Armazenamento automático** - Documento é salvo no sistema
- ✅ **Validação de duplicatas** - Previne documentos duplicados (use force_overwrite para sobrescrever)
- ✅ **Tracking de uso** - Conta como API request e document no seu plano
- ✅ **Schema flexível** - Use schemas padrão ou personalizados
- ✅ **Suporte a modelos** - Use seus document_types criados
- ✅ **Rate limiting** - 60 requests/minuto
- ✅ **Status completed** - Documento já processado e pronto para uso

---

## 🎯 Casos de Uso

1. **Integração em tempo real** - Processar e armazenar documentos instantaneamente
2. **Upload com validação** - Extrair dados e armazenar em uma única operação
3. **APIs síncronas** - Retornar dados extraídos imediatamente sem polling
4. **Processamento imediato** - Quando não pode esperar processamento assíncrono
5. **Histórico completo** - Armazenar documento e dados para relatórios futuros

---

## 📊 Limites

- **Tamanho máximo:** 10MB por arquivo
- **Rate limit:** 60 requests/minuto
- **Formatos aceitos:** PDF, JPG, JPEG, PNG, WEBP
- **API requests:** Contabilizado no limite do seu plano

---

## 🔄 Fluxo de Trabalho Recomendado

### Opção 1: Extração e Armazenamento Instantâneo
```
Cliente → POST /api/v1/documents/extract → Documento completo com JSON extraído
```

### Opção 2: Upload + Processamento Assíncrono
```
Cliente → POST /api/v1/documents → ID do documento (status: pending)
Cliente → GET /api/v1/documents/{id} → JSON extraído (quando status: completed)
```

---

## 🆚 Quando usar cada endpoint?

### Use `POST /api/v1/documents/extract` quando:
- Precisa de resposta imediata com dados extraídos
- Quer armazenar o documento E obter os dados na mesma requisição
- Não pode esperar processamento assíncrono
- Precisa validar dados antes de continuar o fluxo

### Use `POST /api/v1/documents` quando:
- Pode esperar processamento assíncrono (mais rápido para upload)
- Está fazendo upload em lote
- Não precisa dos dados imediatamente
- Quer otimizar performance com filas

---

## 📝 Notas Importantes

1. **Armazenamento permanente:** O documento é armazenado no sistema e pode ser acessado via `GET /api/v1/documents/{id}`
2. **Processamento síncrono:** A requisição aguarda o processamento completo (pode demorar mais que upload simples)
3. **Timeout:** Considere timeout adequado (recomendado: 30-60 segundos)
4. **Confidence score:** Quando disponível, indica a confiança da extração (0-100)
5. **Validação de duplicatas:** Por padrão, previne documentos com mesmo nome. Use `force_overwrite=true` para sobrescrever
6. **Limites:** Conta tanto como API request quanto como document no seu plano
7. **Logs:** Todas as extrações são logadas para auditoria

---

## 🔍 Troubleshooting

### Erro 401 - Unauthorized
- Verifique se o token JWT está válido
- Confirme que o header Authorization está correto

### Erro 422 - Validation Error
- Verifique o formato do arquivo (deve ser PDF, JPG, JPEG, PNG ou WEBP)
- Confirme que o arquivo não excede 10MB
- Valide o JSON do schema (se fornecido)

### Erro 429 - Too Many Requests
- Você excedeu o rate limit de 60 requests/minuto
- Aguarde 1 minuto antes de tentar novamente

### Erro 500 - Internal Server Error
- Verifique se o documento está corrompido
- Tente com um documento diferente
- Entre em contato com o suporte se persistir
