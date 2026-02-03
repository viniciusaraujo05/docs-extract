# 🚀 Guia de Desenvolvimento Vite

## ⚡ Comandos Rápidos

### Desenvolvimento Normal (Rápido)
```bash
pnpm dev
```
- Inicia em ~295ms
- Não regenera tipos de rotas
- Usa tipos já gerados anteriormente

### Desenvolvimento com Regeneração de Tipos
```bash
GENERATE_TYPES=true pnpm dev
```
- Inicia em ~30-60s (primeira vez)
- Regenera tipos de rotas do Laravel
- Use quando adicionar/modificar rotas

### Build de Produção
```bash
pnpm run build
```
- Sempre gera tipos automaticamente
- Ativa React Compiler
- Otimiza chunks

## 📝 Quando Regenerar Tipos?

Execute `GENERATE_TYPES=true pnpm dev` quando:
- ✅ Adicionar novas rotas no Laravel
- ✅ Modificar nomes de rotas
- ✅ Mudar parâmetros de rotas
- ✅ Após pull/merge que alterou rotas

Não precisa regenerar para:
- ❌ Mudanças em componentes React
- ❌ Mudanças em estilos CSS
- ❌ Mudanças em lógica de negócio

## 🎯 Performance

| Modo | Tempo Inicial | Wayfinder | React Compiler |
|------|---------------|-----------|----------------|
| **Dev Normal** | ~295ms | ❌ | ❌ |
| **Dev + Tipos** | ~30-60s | ✅ | ❌ |
| **Build** | ~2-3min | ✅ | ✅ |
