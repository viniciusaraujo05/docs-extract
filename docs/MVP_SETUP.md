# MVP - Sistema de Leitura de Documentos

## Estrutura Criada

### Backend (Laravel)

#### Models
- `Organization` - Multi-tenant leve com sistema de créditos
- `User` - Utilizador com relação a Organization
- `Document` - Documento com suporte a jsonb para dados extraídos
- `ExtractionSchema` - Schemas customizáveis para extração

#### Services
- `DocumentService` - Upload, processamento e gestão de documentos
- `ExtractionService` - Integração com OpenAI (com mock para desenvolvimento)

#### Controllers
- `DocumentController` - CRUD completo + reprocessamento

#### Jobs
- `ProcessDocumentJob` - Processamento assíncrono de documentos

### Frontend (React + TypeScript)

#### Páginas
- `/documents` - Lista de documentos
- `/documents/create` - Upload de novo documento
- `/documents/{id}` - Visualização e edição de dados extraídos

## Setup

### 1. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Editar `.env` e configurar:
- `DB_CONNECTION=pgsql` (para PostgreSQL com jsonb)
- `OPENAI_API_KEY=` (opcional, usa mock por padrão)
- `OPENAI_USE_MOCK=true` (manter true para desenvolvimento)

### 2. Instalar dependências

```bash
composer install
npm install
```

### 3. Executar migrations

```bash
php artisan migrate
php artisan db:seed
```

### 4. Iniciar servidor de desenvolvimento

```bash
composer dev
```

Ou manualmente:
```bash
php artisan serve
php artisan queue:work
npm run dev
```

## Fluxo de Uso

1. **Login** com `test@example.com` / `password`
2. **Navegar** para Documentos no menu lateral
3. **Upload** de PDF ou imagem
4. **Aguardar** processamento (polling automático)
5. **Editar** dados extraídos se necessário
6. **Guardar** alterações

## Schemas de Extração

### Fatura (invoice)
- supplier_name, supplier_vat
- invoice_number, invoice_date, due_date
- subtotal, vat_amount, vat_rate, total, currency

### Recibo (receipt)
- merchant_name, date
- total, payment_method, vat_amount

## API Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /documents | Lista documentos |
| POST | /documents | Upload documento |
| GET | /documents/{id} | Ver documento |
| DELETE | /documents/{id} | Eliminar documento |
| GET | /documents/{id}/preview | Preview do ficheiro |
| PUT | /documents/{id}/data | Atualizar dados extraídos |
| POST | /documents/{id}/reprocess | Reprocessar documento |

## Próximos Passos (pós-MVP)

- [ ] Integração real com OpenAI
- [ ] OCR para imagens (Tesseract)
- [ ] Parser de PDF (smalot/pdfparser)
- [ ] Exportação de dados (CSV, Excel)
- [ ] Dashboard com estatísticas
- [ ] Gestão de créditos
- [ ] Schemas customizados por utilizador
