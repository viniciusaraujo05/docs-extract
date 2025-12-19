# Guia de Traduções

## 📋 Visão Geral

Este documento descreve como usar e adicionar traduções no sistema, tanto no frontend quanto no backend.

---

## 🎯 Arquivos de Tradução

### **Frontend (React)**
- `resources/js/i18n/locales/pt.json` - Português (196 traduções)
- `resources/js/i18n/locales/en.json` - Inglês (196 traduções)

### **Backend (Laravel)**
- `lang/pt.json` - Português
- `lang/en.json` - Inglês

---

## 🚀 Como Usar Traduções

### **Frontend (React/TypeScript)**

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
    const { t } = useTranslation();
    
    return (
        <div>
            <h1>{t('Dashboard')}</h1>
            <p>{t('Total Documents')}: {count}</p>
            <Button>{t('Save')}</Button>
        </div>
    );
}
```

**Com variáveis:**
```tsx
const message = t('Welcome, {{name}}', { name: user.name });
```

**Pluralização:**
```tsx
const message = t('documents', { count: 5 }); // "5 documentos"
```

### **Backend (PHP/Laravel)**

```php
// Em controllers, views, emails
__('Dashboard')
__('Documents')
__('Successfully saved')

// Com variáveis
__('Welcome, :name', ['name' => $user->name])
```

---

## 📝 Traduções Disponíveis

### **Navegação e Menu**
- Dashboard, Documents, Reports, Settings, Profile, Logout
- New Document, Document Types, New Type

### **Ações Comuns**
- Save, Cancel, Delete, Edit, Create, Update
- Search, Filter, Export, Import, Download, Upload
- Back, Next, Previous, Finish, Close, Open

### **Status e Feedback**
- Success, Error, Warning, Info
- Loading..., Processing, Please wait
- Successfully saved, Failed to save
- Analysis completed!, Analysis error

### **Análise IA**
- AI Analysis, Intelligent Analysis, New Analysis
- Executive Summary, Insights, Patterns, Recommendations, Attention
- Analyzing data with AI..., This may take a few seconds

### **Formulários**
- Email, Password, Name, Confirm Password
- Required field, Invalid format, Too short, Too long
- Must be a number, Must be a valid email

### **Cores (para gráficos)**
- Blue, Green, Orange, Purple, Pink, Red, Yellow, Turquoise, Indigo

---

## 🌍 Prompt da IA Multilíngue

A IA agora responde no idioma do usuário automaticamente.

### **Sistema de Prompts**

**Português:**
```
Você é um analista de dados especializado em análise de documentos 
financeiros e empresariais. IMPORTANTE: Responda SEMPRE em português (pt-BR).
```

**Inglês:**
```
You are a data analyst specialized in analyzing financial and business 
documents. IMPORTANT: Always respond in English.
```

### **Estrutura de Análise**

**Português:**
- RESUMO EXECUTIVO
- INSIGHTS PRINCIPAIS
- PADRÕES E TENDÊNCIAS
- RECOMENDAÇÕES ESTRATÉGICAS
- PONTOS DE ATENÇÃO

**Inglês:**
- EXECUTIVE SUMMARY
- KEY INSIGHTS
- PATTERNS AND TRENDS
- STRATEGIC RECOMMENDATIONS
- ATTENTION POINTS

### **Como Funciona**

1. Usuário seleciona idioma no header
2. Idioma salvo no banco de dados (`users.locale`)
3. Controller passa locale para `AnalyzeReportWithAIAction`
4. Action usa prompt no idioma correto
5. IA responde no idioma solicitado

---

## ➕ Adicionar Novas Traduções

### **1. Frontend**

Edite ambos os arquivos:

**`resources/js/i18n/locales/pt.json`**
```json
{
    "My New Feature": "Minha Nova Funcionalidade",
    "Click here to start": "Clique aqui para começar"
}
```

**`resources/js/i18n/locales/en.json`**
```json
{
    "My New Feature": "My New Feature",
    "Click here to start": "Click here to start"
}
```

### **2. Backend**

Edite ambos os arquivos:

**`lang/pt.json`**
```json
{
    "Email sent successfully": "E-mail enviado com sucesso"
}
```

**`lang/en.json`**
```json
{
    "Email sent successfully": "Email sent successfully"
}
```

### **3. Prompt da IA**

Se precisar adicionar novas seções ao prompt da IA, edite:

**`app/Actions/Reports/AnalyzeReportWithAIAction.php`**

```php
private function getStructurePrompt(string $locale, ?string $customInstructions = null): string
{
    $structures = [
        'pt' => [
            'new_section' => "## NOVA SEÇÃO\n[Descrição]\n\n",
        ],
        'en' => [
            'new_section' => "## NEW SECTION\n[Description]\n\n",
        ],
    ];
    
    // ... adicionar ao prompt
    $prompt .= $structure['new_section'];
}
```

---

## 🔄 Fluxo de Tradução

### **Mudança de Idioma**

1. Usuário clica no seletor de idioma (🇧🇷/🇺🇸)
2. `LanguageSelector` chama API `/api/locale/update`
3. Backend atualiza `users.locale` e sessão
4. Frontend atualiza i18next
5. Página recarrega
6. Middleware `SetLocale` detecta novo idioma
7. Todas as traduções aplicadas

### **Análise IA**

1. Usuário solicita análise IA
2. Controller obtém `user->locale`
3. Passa locale para `AnalyzeReportWithAIAction`
4. Action seleciona prompt no idioma correto
5. IA recebe instrução para responder no idioma
6. Resposta retorna no idioma do usuário

---

## 🎨 Boas Práticas

### **Chaves de Tradução**

✅ **Bom:**
```tsx
t('Save')
t('Successfully saved')
t('New Document')
```

❌ **Ruim:**
```tsx
t('save')  // minúscula
t('SaveButton')  // muito específico
t('new_document')  // snake_case
```

### **Consistência**

- Use **Title Case** para títulos e botões
- Use **Sentence case** para mensagens
- Mantenha chaves em inglês
- Traduções devem ser naturais, não literais

### **Organização**

Agrupe traduções relacionadas:
```json
{
    "Dashboard": "Painel",
    "Documents": "Documentos",
    "Reports": "Relatórios",
    
    "Save": "Salvar",
    "Cancel": "Cancelar",
    "Delete": "Excluir"
}
```

---

## 🧪 Testando Traduções

### **1. Trocar Idioma**
- Clique no ícone 🌐 no header
- Selecione PT ou EN
- Verifique se a página recarrega
- Confirme que todas as strings mudaram

### **2. Análise IA**
- Troque para inglês
- Solicite análise IA
- Verifique se a resposta está em inglês
- Troque para português
- Solicite nova análise
- Verifique se a resposta está em português

### **3. Persistência**
- Troque o idioma
- Faça logout
- Faça login novamente
- Confirme que o idioma foi mantido

---

## 📊 Estatísticas

### **Frontend**
- **Total de traduções:** 196 chaves
- **Idiomas:** Português, Inglês
- **Cobertura:** 100%

### **Backend**
- **Total de traduções:** 90+ chaves
- **Idiomas:** Português, Inglês
- **Cobertura:** 100%

### **Prompt IA**
- **Idiomas suportados:** Português, Inglês
- **Seções traduzidas:** 6 (Resumo, Insights, Padrões, Recomendações, Atenção, Resposta ao Usuário)

---

## 🐛 Troubleshooting

### **Tradução não aparece**
1. Verificar se a chave existe em ambos os arquivos (pt.json, en.json)
2. Verificar se o JSON está bem formatado
3. Limpar cache do navegador
4. Verificar console para erros

### **IA responde em idioma errado**
1. Verificar se `users.locale` está correto no banco
2. Verificar se middleware `SetLocale` está ativo
3. Verificar logs do Laravel
4. Confirmar que locale está sendo passado para a action

### **Idioma não persiste**
1. Verificar se migration foi executada
2. Verificar se coluna `locale` existe em `users`
3. Verificar se sessão está funcionando
4. Limpar cache do Laravel

---

## 📚 Referências

- [react-i18next](https://react.i18next.com/)
- [Laravel Localization](https://laravel.com/docs/12.x/localization)
- [i18next](https://www.i18next.com/)

---

**Última atualização:** 19/12/2025
