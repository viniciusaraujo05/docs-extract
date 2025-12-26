# 🔔 Configuração do Webhook Stripe

## ✅ O Que Você Já Fez

Você mencionou que já adicionou o link do webhook no Stripe. Perfeito!

---

## 📋 Checklist Completo

### **1. Webhook Criado no Stripe Dashboard** ✅

**URL do Webhook:**
```
https://seu-dominio.com/stripe/webhook
```

**Eventos que DEVEM estar selecionados:**
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

### **2. Webhook Secret Configurado** ✅

No arquivo `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_477q7Z793IHlZVl0LMNSxLrBKo6Q84EA
```

### **3. Rota do Webhook Configurada** ✅

No arquivo `routes/web.php`:
```php
Route::post('stripe/webhook', [StripeWebhookController::class, 'handleWebhook'])
    ->name('cashier.webhook');
```

**IMPORTANTE:** Esta rota está **FORA** do middleware `auth` e `VerifyCsrfToken`.

---

## 🚨 Por Que Não Funciona em Localhost?

### **Problema:**
O Stripe **NÃO CONSEGUE** enviar webhooks para `localhost` ou `127.0.0.1` porque:
- Seu computador não é acessível pela internet
- O Stripe precisa de uma URL pública para enviar eventos

### **Soluções:**

#### **Opção 1: Usar Stripe CLI (Recomendado para Desenvolvimento)** 🎯

1. **Instalar Stripe CLI:**
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.4/stripe_1.19.4_linux_x86_64.tar.gz
tar -xvf stripe_1.19.4_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/

# Windows
scoop install stripe
```

2. **Login no Stripe:**
```bash
stripe login
```

3. **Encaminhar Webhooks para Localhost:**
```bash
stripe listen --forward-to localhost/stripe/webhook
```

4. **Você verá algo assim:**
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

5. **Copiar o Secret e Atualizar `.env`:**
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

6. **Testar um Evento:**
```bash
stripe trigger payment_intent.succeeded
```

#### **Opção 2: Usar Ngrok (Alternativa)** 🌐

1. **Instalar Ngrok:**
```bash
# Download em: https://ngrok.com/download
```

2. **Expor Localhost:**
```bash
ngrok http 80
```

3. **Você verá:**
```
Forwarding  https://abc123.ngrok.io -> http://localhost:80
```

4. **Atualizar Webhook no Stripe Dashboard:**
```
https://abc123.ngrok.io/stripe/webhook
```

5. **Copiar o Webhook Secret e Atualizar `.env`**

---

## 🚀 Para Produção

### **1. Deploy da Aplicação**

Faça deploy em um servidor com domínio público:
- Heroku
- DigitalOcean
- AWS
- Vercel (para frontend)
- Qualquer VPS

### **2. Configurar Webhook no Stripe**

**URL:**
```
https://seu-dominio.com/stripe/webhook
```

**Eventos:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### **3. Atualizar `.env` em Produção**

```env
STRIPE_KEY=pk_live_...
STRIPE_SECRET=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... (do webhook de produção)
```

---

## 🧪 Como Testar Se Está Funcionando

### **Teste 1: Verificar Rota**
```bash
curl -X POST http://localhost/stripe/webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"test"}'
```

**Esperado:** Não deve retornar erro 404

### **Teste 2: Ver Logs**
```bash
tail -f storage/logs/laravel.log
```

Faça um pagamento de teste e veja se os eventos aparecem nos logs.

### **Teste 3: Dashboard do Stripe**

1. Vá para: **Developers → Webhooks**
2. Clique no seu webhook
3. Veja a aba **"Attempts"**
4. Deve mostrar tentativas de envio e status

---

## ✅ Resumo: O Que Fazer Agora

### **Para Desenvolvimento (Localhost):**
```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Encaminhar webhooks
stripe listen --forward-to localhost/stripe/webhook

# Copiar o secret que aparece e colocar no .env
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Testar
stripe trigger customer.subscription.created
```

### **Para Produção:**
1. ✅ Deploy da aplicação em servidor público
2. ✅ Configurar webhook no Stripe com URL pública
3. ✅ Copiar webhook secret para `.env` de produção
4. ✅ Testar com pagamento real

---

## 🎯 Está Tudo Configurado Corretamente!

Seu código está **100% correto**. O único problema é que webhooks não funcionam em localhost sem Stripe CLI ou Ngrok.

**Use Stripe CLI para desenvolvimento e está pronto!** 🚀
