#!/bin/bash

echo "🚀 Configurando Stripe Webhook Local"
echo "===================================="

# Verificar se Stripe CLI está instalado
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI não encontrado. Instale com:"
    echo "   brew install stripe/stripe-cli/stripe"
    echo "   ou visite: https://stripe.com/docs/stripe-cli"
    exit 1
fi

# Verificar se está logado
if ! stripe whoami &> /dev/null; then
    echo "⚠️  Você precisa fazer login no Stripe:"
    echo "   stripe login"
    echo ""
    echo "Depois execute este script novamente."
    exit 1
fi

# Iniciar webhook forwarding
echo "✅ Iniciando webhook forwarding..."
echo "   Endpoint: http://localhost:8000/stripe/webhook"
echo "   Eventos: customer.subscription.*, invoice.payment_*"
echo ""
echo "Pressione Ctrl+C para parar"
echo ""

stripe listen \
    --forward-to localhost:8000/stripe/webhook \
    --events customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,invoice.payment_succeeded,invoice.payment_failed,invoice.upcoming
