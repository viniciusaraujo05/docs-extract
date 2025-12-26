# Stripe Integration with Laravel Cashier - Setup Guide

## ✅ Instalação Completa

A integração do Laravel Cashier (Stripe) foi instalada e configurada com sucesso!

## 📋 O que foi implementado

### 1. Backend (Laravel)

#### Pacotes Instalados
- ✅ `laravel/cashier` v16.1.0
- ✅ `stripe/stripe-php` v17.6.0
- ✅ `moneyphp/money` v4.8.0

#### Migrations Executadas
- ✅ `create_customer_columns` - Adiciona colunas Stripe ao modelo User
- ✅ `create_subscriptions_table` - Tabela de assinaturas
- ✅ `create_subscription_items_table` - Itens de assinatura
- ✅ Colunas adicionais para metering

#### Modelo User Atualizado
- ✅ Trait `Billable` adicionado ao modelo User
- ✅ Usuários agora podem ter assinaturas Stripe

#### Controladores Criados

**SubscriptionController** (`app/Http/Controllers/SubscriptionController.php`)
- `index()` - Visualizar assinaturas e faturas
- `checkout()` - Criar sessão de checkout
- `success()` - Página de sucesso após checkout
- `cancel()` - Página de cancelamento
- `portal()` - Redirecionar para portal de cobrança Stripe
- `cancelSubscription()` - Cancelar assinatura
- `resumeSubscription()` - Retomar assinatura

**StripeWebhookController** (`app/Http/Controllers/StripeWebhookController.php`)
- Handlers para eventos Stripe:
  - `handleCustomerSubscriptionCreated()`
  - `handleCustomerSubscriptionUpdated()`
  - `handleCustomerSubscriptionDeleted()`
  - `handleInvoicePaymentSucceeded()`
  - `handleInvoicePaymentFailed()`

**StripePriceController** (`app/Http/Controllers/StripePriceController.php`)
- `index()` - Buscar preços ativos do Stripe

#### Rotas Configuradas

**Web Routes** (`routes/web.php`)
```php
// Webhook (sem autenticação/CSRF)
POST /stripe/webhook

// Rotas autenticadas
GET  /subscription
POST /subscription/checkout
GET  /subscription/success
GET  /subscription/cancel
GET  /subscription/portal
POST /subscription/cancel-subscription
POST /subscription/resume
```

**API Routes** (`routes/api.php`)
```php
// Pública
GET /api/stripe/prices
```

### 2. Frontend (React/TypeScript)

#### Páginas Criadas

**Subscription/Index.tsx**
- Gerenciamento de assinaturas
- Visualização de faturas
- Cancelar/retomar assinatura
- Link para portal de cobrança

**Subscription/Success.tsx**
- Página de confirmação após checkout bem-sucedido
- Redirecionamento automático

**Subscription/Cancel.tsx**
- Página quando checkout é cancelado

#### Welcome.tsx Atualizado
- ✅ Componente `Pricing` atualizado para buscar preços do Stripe
- ✅ Formatação de preços dinâmica
- ✅ Suporte a múltiplas moedas

### 3. Variáveis de Ambiente

**Adicionadas ao `.env` e `.env.example`:**
```env
STRIPE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## 🚀 Próximos Passos para Ativar

### 1. Configurar Credenciais Stripe

1. Acesse [Stripe Dashboard](https://dashboard.stripe.com/)
2. Vá em **Developers > API Keys**
3. Copie as chaves:
   - **Publishable key** → `STRIPE_KEY`
   - **Secret key** → `STRIPE_SECRET`

4. Atualize o arquivo `.env`:
```env
STRIPE_KEY=pk_test_51...
STRIPE_SECRET=sk_test_51...
```

### 2. Criar Produtos e Preços no Stripe

1. Acesse **Products** no Stripe Dashboard
2. Crie produtos para cada plano:
   - **FREE** (ou use sem produto)
   - **STARTER** - €15/mês
   - **PRO** - €39/mês
   - **BUSINESS/DEV** - €89/mês
   - **ENTERPRISE** - Customizado

3. Para cada produto, crie um **Price** com:
   - Tipo: Recurring
   - Intervalo: Monthly
   - Valor: Conforme o plano

4. **Importante**: Adicione metadata aos produtos para facilitar a identificação:
```json
{
  "plan_name": "PRO",
  "features": "1500 documents, Unlimited models, API included"
}
```

### 3. Configurar Webhook

1. No Stripe Dashboard, vá em **Developers > Webhooks**
2. Clique em **Add endpoint**
3. Configure:
   - **Endpoint URL**: `https://seu-dominio.com/stripe/webhook`
   - **Events to send**:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

4. Copie o **Signing secret** e adicione ao `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4. Atualizar Welcome.tsx com Price IDs

Depois de criar os produtos no Stripe, você pode:

**Opção A: Usar IDs diretos no código**
Adicione os `price_id` aos planos no `pricingFallback`:
```typescript
{
  name: "PRO",
  price_id: "price_1ABC123...", // ID do Stripe
  // ...
}
```

**Opção B: Usar a API de preços (já implementado)**
O componente já busca preços automaticamente via `/api/stripe/prices`

### 5. Implementar Checkout no Frontend

Adicione ao botão de cada plano no `welcome.tsx`:

```typescript
const handleCheckout = async (priceId: string) => {
  if (!isAuthenticated) {
    router.visit(`/${locale}/register`);
    return;
  }

  try {
    const response = await fetch('/subscription/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
      },
      body: JSON.stringify({ price_id: priceId }),
    });

    const data = await response.json();
    if (data.checkout_url) {
      window.location.href = data.checkout_url;
    }
  } catch (error) {
    console.error('Checkout error:', error);
  }
};
```

### 6. Testar Integração

#### Modo Test
1. Use cartões de teste do Stripe:
   - **Sucesso**: `4242 4242 4242 4242`
   - **Falha**: `4000 0000 0000 0002`
   - **3D Secure**: `4000 0025 0000 3155`

2. Data de expiração: Qualquer data futura
3. CVC: Qualquer 3 dígitos
4. CEP: Qualquer código

#### Testar Webhooks Localmente
```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks para localhost
stripe listen --forward-to localhost:8000/stripe/webhook

# Copiar o webhook secret exibido e adicionar ao .env
```

### 7. Integrar Planos com Usuários

Para conectar planos aos recursos da aplicação, você pode:

1. **Verificar assinatura ativa**:
```php
if ($user->subscribed('default')) {
    // Usuário tem assinatura ativa
}
```

2. **Verificar plano específico**:
```php
if ($user->subscribedToPrice('price_1ABC...', 'default')) {
    // Usuário está no plano PRO
}
```

3. **Criar middleware para verificar plano**:
```php
// app/Http/Middleware/CheckSubscription.php
public function handle($request, Closure $next, $plan = null)
{
    if (!$request->user()->subscribed('default')) {
        return redirect('subscription');
    }
    
    return $next($request);
}
```

4. **Aplicar em rotas**:
```php
Route::middleware(['auth', 'subscribed'])->group(function () {
    // Rotas que requerem assinatura
});
```

## 📊 Estrutura de Dados

### Tabela `subscriptions`
- `user_id` - ID do usuário
- `name` - Nome da assinatura (ex: "default")
- `stripe_id` - ID da assinatura no Stripe
- `stripe_status` - Status (active, canceled, etc)
- `stripe_price` - ID do preço no Stripe
- `quantity` - Quantidade
- `trial_ends_at` - Fim do trial
- `ends_at` - Fim da assinatura (se cancelada)

### Tabela `users` (colunas adicionadas)
- `stripe_id` - ID do cliente no Stripe
- `pm_type` - Tipo de método de pagamento
- `pm_last_four` - Últimos 4 dígitos do cartão
- `trial_ends_at` - Fim do período de trial

## 🔒 Segurança

- ✅ Webhook protegido por assinatura Stripe
- ✅ CSRF protection nas rotas autenticadas
- ✅ Validação de pagamentos via Stripe
- ✅ Dados sensíveis armazenados apenas no Stripe

## 📚 Recursos Adicionais

- [Laravel Cashier Docs](https://laravel.com/docs/12.x/billing)
- [Stripe API Docs](https://stripe.com/docs/api)
- [Stripe Testing](https://stripe.com/docs/testing)

## 🎯 Checklist de Ativação

- [ ] Configurar credenciais Stripe no `.env`
- [ ] Criar produtos e preços no Stripe Dashboard
- [ ] Configurar webhook no Stripe
- [ ] Adicionar price IDs aos planos
- [ ] Implementar botão de checkout no frontend
- [ ] Testar checkout em modo test
- [ ] Testar webhooks localmente
- [ ] Criar middleware de verificação de plano
- [ ] Conectar planos aos recursos da aplicação
- [ ] Testar cancelamento e retomada de assinatura
- [ ] Configurar ambiente de produção
- [ ] Ativar modo live no Stripe

## 🐛 Troubleshooting

### Webhook não funciona
- Verifique se o `STRIPE_WEBHOOK_SECRET` está correto
- Confirme que a URL do webhook está acessível
- Use Stripe CLI para testar localmente

### Checkout não redireciona
- Verifique se as rotas de success/cancel estão corretas
- Confirme que o usuário está autenticado
- Verifique logs do Laravel

### Preços não aparecem
- Confirme que os preços estão marcados como "active" no Stripe
- Verifique se a API key está correta
- Veja o console do navegador para erros

---

**Status**: ✅ Integração completa e pronta para configuração
**Próximo passo**: Configurar credenciais Stripe e criar produtos
