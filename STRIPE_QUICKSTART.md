# 🚀 Stripe Integration - Quick Start

## ✅ Status: Instalação Completa

A integração do Laravel Cashier com Stripe está **100% instalada e configurada**!

## 📦 O que foi feito

- ✅ Laravel Cashier v16.1.0 instalado
- ✅ Migrations executadas (subscriptions, customer_columns, etc)
- ✅ Modelo User atualizado com trait Billable
- ✅ Controladores criados (Subscription, Webhook, Prices)
- ✅ Rotas configuradas (checkout, webhook, portal)
- ✅ Frontend React criado (páginas de subscription)
- ✅ Componente PricingCheckout para checkout
- ✅ API endpoint para buscar preços do Stripe
- ✅ Variáveis de ambiente configuradas

## 🎯 Próximos 3 Passos para Ativar

### 1️⃣ Configurar Credenciais Stripe (5 min)

```bash
# 1. Acesse https://dashboard.stripe.com/test/apikeys
# 2. Copie as chaves e atualize o .env:

STRIPE_KEY=pk_test_51xxxxx...
STRIPE_SECRET=sk_test_51xxxxx...
```

### 2️⃣ Criar Produtos no Stripe (10 min)

1. Acesse https://dashboard.stripe.com/test/products
2. Crie produtos para cada plano:
   - **STARTER**: €15/mês
   - **PRO**: €39/mês (marque como destaque)
   - **BUSINESS**: €89/mês

3. Copie os **Price IDs** (começam com `price_...`)

### 3️⃣ Configurar Webhook (5 min)

```bash
# 1. Acesse https://dashboard.stripe.com/test/webhooks
# 2. Adicione endpoint: https://seu-dominio.com/stripe/webhook
# 3. Selecione eventos:
#    - customer.subscription.*
#    - invoice.payment_succeeded
#    - invoice.payment_failed
# 4. Copie o Webhook Secret e adicione ao .env:

STRIPE_WEBHOOK_SECRET=whsec_xxxxx...
```

## 🧪 Testar Localmente

### Opção A: Usar Stripe CLI (Recomendado)

```bash
# Instalar
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:8000/stripe/webhook

# Copiar o webhook secret exibido
```

### Opção B: Testar sem webhook

Use cartões de teste:
- **Sucesso**: `4242 4242 4242 4242`
- **Falha**: `4000 0000 0000 0002`
- Data: Qualquer futura | CVC: 123

## 📝 Como Usar no Código

### Verificar se usuário tem assinatura

```php
// Em qualquer controller
if ($user->subscribed('default')) {
    // Usuário tem assinatura ativa
}

// Verificar plano específico
if ($user->subscribedToPrice('price_1ABC...', 'default')) {
    // Usuário está no plano PRO
}
```

### Criar middleware para proteger rotas

```php
// app/Http/Middleware/RequireSubscription.php
public function handle($request, Closure $next)
{
    if (!$request->user()->subscribed('default')) {
        return redirect('/subscription')->with('error', 'Subscription required');
    }
    return $next($request);
}

// Aplicar em routes/web.php
Route::middleware(['auth', 'subscribed'])->group(function () {
    // Rotas que requerem assinatura
});
```

### Usar componente de checkout no frontend

```tsx
import { PricingCheckout } from '@/components/PricingCheckout';

// No seu componente de pricing
<PricingCheckout
    priceId="price_1ABC..." // ID do Stripe
    planName="PRO"
    ctaText="Subscribe to PRO"
    locale={locale}
    isAuthenticated={isAuthenticated}
    variant="default"
/>
```

## 📂 Arquivos Criados

### Backend
- `app/Http/Controllers/SubscriptionController.php`
- `app/Http/Controllers/StripeWebhookController.php`
- `app/Http/Controllers/StripePriceController.php`

### Frontend
- `resources/js/pages/Subscription/Index.tsx`
- `resources/js/pages/Subscription/Success.tsx`
- `resources/js/pages/Subscription/Cancel.tsx`
- `resources/js/components/PricingCheckout.tsx`

### Rotas
- `POST /subscription/checkout` - Criar checkout
- `GET /subscription` - Ver assinaturas
- `GET /subscription/portal` - Portal de cobrança
- `POST /stripe/webhook` - Receber eventos Stripe
- `GET /api/stripe/prices` - Buscar preços

## 🔗 Links Úteis

- **Documentação completa**: Ver `STRIPE_INTEGRATION.md`
- **Stripe Dashboard**: https://dashboard.stripe.com/test
- **Laravel Cashier Docs**: https://laravel.com/docs/12.x/billing
- **Stripe Testing**: https://stripe.com/docs/testing

## ⚡ Exemplo de Fluxo Completo

1. **Usuário vê preços** → Welcome page busca preços via `/api/stripe/prices`
2. **Clica em "Subscribe"** → `PricingCheckout` chama `/subscription/checkout`
3. **Redireciona para Stripe** → Usuário preenche dados do cartão
4. **Pagamento confirmado** → Stripe envia webhook → Subscription criada
5. **Retorna para app** → `/subscription/success` → Usuário vê confirmação
6. **Acessa recursos** → Middleware verifica `$user->subscribed()`

## 🎨 Personalizar

### Adicionar price_id aos planos do welcome.tsx

```typescript
// No pricingFallback, adicione:
{
  name: "PRO",
  price_id: "price_1ABC...", // Copie do Stripe
  price: "€39",
  // ...
}
```

### Conectar planos aos recursos

```php
// Exemplo: Limitar documentos por plano
public function store(Request $request)
{
    $user = $request->user();
    
    $limits = [
        'price_1ABC...' => 1500,  // PRO
        'price_1DEF...' => 5000,  // BUSINESS
    ];
    
    $currentPlan = $user->subscription('default')->stripe_price;
    $limit = $limits[$currentPlan] ?? 20; // FREE = 20
    
    if ($user->documents()->count() >= $limit) {
        return back()->with('error', 'Document limit reached');
    }
    
    // Criar documento...
}
```

## 🐛 Troubleshooting Rápido

**Webhook não funciona?**
→ Use Stripe CLI: `stripe listen --forward-to localhost:8000/stripe/webhook`

**Checkout não redireciona?**
→ Verifique se usuário está autenticado e price_id está correto

**Preços não aparecem?**
→ Confirme que preços estão "active" no Stripe Dashboard

---

**Pronto para produção?** Troque as chaves test por live no `.env` e configure webhook em produção!
