# Documentação do Módulo de Blog (SEO & API Driven)

Este documento explica o funcionamento da arquitetura criada para o módulo de Blog do Docset, focado em **SEO de alta performance**, **Clean Code**, **Multi-idioma** e ingestão de dados via **API (Webhook)**.

## 🚀 Como Funciona

O blog foi construído sob uma arquitetura desacoplada onde o **Backend** apenas recebe, valida e serve os dados, enquanto o **Frontend (React + Inertia SSR)** cuida do SEO, marcação estruturada (Schema) e parse de Markdown.

### 1. Banco de Dados

A modelagem segue a melhor prática para sistemas multi-idioma (separação de atributos traduzíveis):

- `blog_posts`: Tabela principal (dados não traduzíveis como `published_at`, `cover_image_url`, `author_name`, `external_id`).
- `blog_post_translations`: Tabela que guarda o texto e meta-dados de SEO por idioma (`locale`, `title`, `slug`, `content` em Markdown, `meta_title`, `meta_description`, etc).

### 2. A API de Ingestão (Webhook)

O blog não possui painel de admin local. Ele foi desenhado para receber conteúdo através de requisições disparadas pelo seu sistema interno (API de conteúdo externa).

### Autenticação da API (Bearer Token)

Para que a sua API externa consiga sincronizar os posts com segurança em produção, você deve gerar um Token de acesso.
O token fica salvo no banco de dados com hash SHA-256 por questões de segurança.

**Como gerar o token no servidor:**

```bash
php artisan blog:generate-token
```

O console exibirá um token no formato `blg_...`. **Copie e salve este token imediatamente**, pois ele não poderá ser visualizado novamente.

**Como enviar a requisição com o token:**
Todas as requisições para o Webhook devem conter o cabeçalho `Authorization`:

```http
Authorization: Bearer blg_seu_token_aqui
```

**Endpoint:** `POST /api/webhooks/blog/sync`

**Payload Esperado:**

```json
{
    "external_id": "post-123",
    "author_name": "Seu Nome",
    "published_at": "2026-02-23T12:00:00Z",
    "status": "published",
    "cover_image_url": "https://url-da-capa.jpg",
    "translations": [
        {
            "locale": "pt",
            "slug": "meu-primeiro-post",
            "title": "Meu Primeiro Post",
            "excerpt": "Um breve resumo...",
            "content": "## Titulo Markdown\\n\\nEste é o corpo do texto",
            "meta_title": "Título Especial para o Google",
            "meta_description": "Descrição SEO",
            "focus_keyword": "blog, tecnologia"
        },
        {
            "locale": "en",
            "slug": "my-first-post",
            "title": "My First Post",
            "content": "## English Title\\n\\nContent here..."
        }
    ]
}
```

_Toda a regra de salvamento/atualização (Upsert) é abstraída em `UpsertBlogPostAction.php` e `EloquentBlogRepository.php`._

## 💎 Estrutura Clean Code / SOLID

A feature foi montada utilizando as seguintes camadas:

1. **Controllers (Anêmicos):** `BlogWebhookController` e `BlogController` apenas repassam as requisições para as _Actions_.
2. **Data Transfer Objects (DTOs):** `IncomingBlogPostDTO` tipa e filtra os dados que chegam pelo Request JSON, prevenindo que a camada de domínio acesse detalhes do HTTP diretamente.
3. **Actions (Use Cases):** Guardam a regra de negócio (`UpsertBlogPostAction`, `GetPublishedPostsAction`, `GetPostForDisplayAction`).
4. **Contracts & Repositories (DIP):** `BlogRepositoryInterface` é injetado via Injeção de Dependências. `EloquentBlogRepository` é quem de fato conversa com o banco.

## 📈 Estratégia de SEO no Frontend

O grande diferencial está na forma como o Inertia.js (configurado com SSR) renderiza a página React (`Show.tsx`).

### Meta Tags & Open Graph

O componente `<Head>` (do Inertia) injeta automaticamente o `title` otimizado, `meta description`, `keywords` e tags do OpenGraph (`og:image`, `og:title`) para a página ficar atraente ao ser compartilhada nas redes.

### Schema.org (JSON-LD)

A página também cria um `script` dinâmico com o _Schema_ do tipo `BlogPosting`. Quando o robô de busca lê a página, ele consegue estruturar o post perfeitamente (autor, data, imagem, resumo), aumentando drasticamente a chance de aparecer nos _Rich Snippets_ do Google.

### Markdown Parsing

O conteúdo escrito em Markdown é compilado no SSR e no client usando `react-markdown` e `remark-gfm`, suportando tabelas, listas e blocos de código com _Syntax Highlighting_. Utilizamos o pacote do Tailwind `@tailwindcss/typography` (`prose`) para deixar a leitura agradável.

## 🛠 Comandos Úteis

Para testar o visual e ver como os dados ficam salvos, foi criado um Seeder:

```bash
# Rodar as migrações caso ainda não tenha rodado
php artisan migrate

# Criar o post de demonstração (Português e Inglês)
php artisan db:seed --class=BlogPostSeeder
```
