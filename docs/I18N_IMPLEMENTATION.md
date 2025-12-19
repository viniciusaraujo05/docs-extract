# Sistema de Internacionalização (i18n)

## 📋 Visão Geral

Sistema completo de internacionalização implementado usando **Laravel 12**, **PHP 8.5**, **React 19** e **react-i18next**.

**Idiomas suportados:**
- 🇧🇷 Português (pt) - Padrão
- 🇺🇸 Inglês (en)

---

## 🏗️ Arquitetura

### **Backend (Laravel)**

#### 1. **Configuração**
- `config/app.php`: Locale padrão alterado para `pt`
- `available_locales`: `['pt', 'en']`

#### 2. **Database**
- Migration: `2025_12_19_111500_add_locale_to_users_table.php`
- Coluna `locale` adicionada à tabela `users`
- Model `User`: Campo `locale` adicionado ao `$fillable`

#### 3. **Middleware**
- `app/Http/Middleware/SetLocale.php`
- Prioridade de detecção:
  1. Preferência do usuário autenticado
  2. Sessão
  3. Header Accept-Language do navegador
  4. Padrão (pt)

#### 4. **Controller**
- `app/Http/Controllers/LocaleController.php`
- Endpoints:
  - `GET /api/locale/current` - Retorna idioma atual
  - `POST /api/locale/update` - Atualiza idioma

#### 5. **Arquivos de Tradução**
- `lang/pt.json` - Traduções em português
- `lang/en.json` - Traduções em inglês

---

### **Frontend (React + TypeScript)**

#### 1. **Bibliotecas**
```json
{
  "i18next": "^25.7.3",
  "react-i18next": "^16.5.0",
  "i18next-browser-languagedetector": "^8.2.0"
}
```

#### 2. **Configuração**
- `resources/js/i18n/config.ts` - Configuração do i18next
- `resources/js/i18n/locales/pt.json` - Traduções PT
- `resources/js/i18n/locales/en.json` - Traduções EN

#### 3. **Componente**
- `resources/js/components/LanguageSelector.tsx`
- Dropdown no header com bandeiras 🇧🇷 🇺🇸
- Sincroniza com backend ao trocar idioma

---

## 🚀 Como Usar

### **No Backend (PHP)**

```php
// Em controllers, views, emails, etc.
__('Dashboard')
__('Documents')
__('AI Analysis')

// Com variáveis
__('Welcome, :name', ['name' => $user->name])
```

### **No Frontend (React)**

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
    const { t } = useTranslation();
    
    return (
        <div>
            <h1>{t('Dashboard')}</h1>
            <p>{t('Welcome, :name', { name: user.name })}</p>
        </div>
    );
}
```

---

## 📝 Adicionar Novas Traduções

### **1. Backend**

Adicione a chave e tradução em ambos os arquivos:

**`lang/pt.json`**
```json
{
    "New Feature": "Nova Funcionalidade"
}
```

**`lang/en.json`**
```json
{
    "New Feature": "New Feature"
}
```

### **2. Frontend**

Adicione a chave e tradução em ambos os arquivos:

**`resources/js/i18n/locales/pt.json`**
```json
{
    "New Feature": "Nova Funcionalidade"
}
```

**`resources/js/i18n/locales/en.json`**
```json
{
    "New Feature": "New Feature"
}
```

---

## 🌍 Adicionar Novo Idioma

### **1. Backend**

```php
// config/app.php
'available_locales' => ['pt', 'en', 'es'], // Adicionar 'es'
```

Criar arquivo `lang/es.json`:
```json
{
    "Dashboard": "Panel",
    "Documents": "Documentos"
}
```

### **2. Frontend**

Atualizar `resources/js/i18n/config.ts`:
```ts
import esTranslations from './locales/es.json';

i18n.init({
    resources: {
        pt: { translation: ptTranslations },
        en: { translation: enTranslations },
        es: { translation: esTranslations }, // Adicionar
    },
    supportedLngs: ['pt', 'en', 'es'], // Adicionar
});
```

Criar arquivo `resources/js/i18n/locales/es.json`:
```json
{
    "Dashboard": "Panel",
    "Documents": "Documentos"
}
```

Atualizar `LanguageSelector.tsx`:
```tsx
<DropdownMenuItem onClick={() => changeLanguage('es')}>
    🇪🇸 {t('Spanish')}
</DropdownMenuItem>
```

### **3. Middleware**

Atualizar `app/Http/Middleware/SetLocale.php`:
```php
$browserLocale = $request->getPreferredLanguage(['pt', 'en', 'es']);
```

---

## 🔄 Fluxo de Mudança de Idioma

1. Usuário clica no seletor de idioma no header
2. `LanguageSelector` chama `changeLanguage(locale)`
3. Frontend atualiza i18next
4. Faz POST para `/api/locale/update`
5. Backend atualiza sessão e banco de dados
6. Página recarrega para aplicar traduções
7. Middleware `SetLocale` detecta nova preferência

---

## 📦 Estrutura de Arquivos

```
project/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── LocaleController.php
│   │   └── Middleware/
│   │       └── SetLocale.php
│   └── Models/
│       └── User.php (+ locale field)
├── config/
│   └── app.php (+ available_locales)
├── database/
│   └── migrations/
│       └── 2025_12_19_111500_add_locale_to_users_table.php
├── lang/
│   ├── pt.json
│   └── en.json
├── resources/
│   └── js/
│       ├── components/
│       │   └── LanguageSelector.tsx
│       ├── i18n/
│       │   ├── config.ts
│       │   └── locales/
│       │       ├── pt.json
│       │       └── en.json
│       └── app.tsx (+ import i18n)
└── routes/
    └── web.php (+ locale routes)
```

---

## ✅ Checklist de Implementação

- [x] Migration para coluna `locale` em `users`
- [x] Model `User` com campo `locale` no fillable
- [x] Middleware `SetLocale` registrado
- [x] Config `app.php` com `available_locales`
- [x] Controller `LocaleController` com endpoints
- [x] Rotas `/api/locale/current` e `/api/locale/update`
- [x] Arquivos de tradução backend (`lang/*.json`)
- [x] Instalação de `i18next`, `react-i18next`
- [x] Configuração i18n frontend (`i18n/config.ts`)
- [x] Arquivos de tradução frontend (`i18n/locales/*.json`)
- [x] Componente `LanguageSelector`
- [x] Integração no header principal
- [x] Import i18n no `app.tsx`

---

## 🎯 Próximos Passos

1. **Traduzir componentes existentes**: Substituir strings hardcoded por `t('key')`
2. **Traduzir backend**: Usar `__('key')` em controllers, actions, emails
3. **Adicionar mais idiomas**: Espanhol, Francês, etc.
4. **Testes**: Garantir que traduções funcionam em todos os contextos
5. **Documentação**: Atualizar README com instruções de i18n

---

## 🐛 Troubleshooting

### **Traduções não aparecem**
- Verificar se o arquivo JSON está bem formatado
- Limpar cache do navegador
- Verificar console do navegador para erros

### **Idioma não persiste**
- Verificar se middleware `SetLocale` está registrado
- Verificar se coluna `locale` existe na tabela `users`
- Verificar se sessão está funcionando

### **Erro ao trocar idioma**
- Verificar CSRF token
- Verificar se rotas `/api/locale/*` estão acessíveis
- Verificar logs do Laravel

---

## 📚 Referências

- [Laravel Localization](https://laravel.com/docs/12.x/localization)
- [react-i18next Documentation](https://react.i18next.com/)
- [i18next Documentation](https://www.i18next.com/)

---

**Implementado em:** 19/12/2025
**Versão:** 1.0.0
