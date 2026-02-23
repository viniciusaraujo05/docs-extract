<?php

namespace Database\Seeders;

use App\Models\BlogPost;
use App\Models\BlogPostTranslation;
use Illuminate\Database\Seeder;

class BlogPostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $post = BlogPost::updateOrCreate(
            ['external_id' => 'demo-post-1'],
            [
                'author_name' => 'System Admin',
                'published_at' => now()->subDay(),
                'status' => 'published',
                'cover_image_url' => 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1000&auto=format&fit=crop',
            ]
        );

        $markdownContentPt = <<<'MD'
# Bem-vindo ao Novo Blog com SEO Perfeito!

Este é o nosso primeiro post de demonstração. Ele é totalmente carregado via **API**, armazenado em nosso banco de dados relacional e renderizado com Server-Side Rendering (SSR) pelo Inertia.js!

## Por que usar Markdown?

O Markdown é leve, fácil de escrever e se transforma magicamente em HTML graças ao `react-markdown`.

### Tabela de Vantagens

| Feature | Descrição |
| :--- | :--- |
| **SEO** | Marcação Schema.org (JSON-LD), OpenGraph e Meta tags automáticas |
| **Clean Code** | Separação de Actions, Repositories e DTOs |
| **Multi-idioma** | Suporte a rotas `/pt/blog` e `/en/blog` |
| **Performance** | O bot do Google já lê o HTML compilado no servidor |

> "O futuro da web é dinâmico, mas o Google ainda ama o estático." - *Alguém esperto*

```javascript
// Exemplo de código
const saudacao = "Olá Mundo!";
console.log(saudacao);
```
MD;

        $markdownContentEn = <<<'MD'
# Welcome to the New Blog with Perfect SEO!

This is our first demo post. It is fully loaded via **API**, stored in our relational database, and rendered with Server-Side Rendering (SSR) by Inertia.js!

## Why use Markdown?

Markdown is lightweight, easy to write, and magically transforms into HTML thanks to `react-markdown`.

### Advantages Table

| Feature | Description |
| :--- | :--- |
| **SEO** | Schema.org markup (JSON-LD), OpenGraph, and automatic Meta tags |
| **Clean Code** | Separation of Actions, Repositories, and DTOs |
| **Multi-language** | Support for `/pt/blog` and `/en/blog` routes |
| **Performance** | Googlebot reads the HTML compiled on the server |

> "The future of the web is dynamic, but Google still loves static." - *Someone smart*

```javascript
// Code example
const greeting = "Hello World!";
console.log(greeting);
```
MD;

        BlogPostTranslation::updateOrCreate(
            ['blog_post_id' => $post->id, 'locale' => 'pt'],
            [
                'slug' => 'bem-vindo-ao-novo-blog-seo',
                'title' => 'Bem-vindo ao Novo Blog com SEO Perfeito!',
                'excerpt' => 'Descubra como construímos um blog multi-idioma focado em SEO, Clean Code e Markdown.',
                'content' => $markdownContentPt,
                'meta_title' => 'Novo Blog em Laravel e React | Seu Negócio',
                'meta_description' => 'Aprenda como a nossa arquitetura de ponta garante 100% de SEO com páginas dinâmicas e traduções instantâneas.',
                'focus_keyword' => 'blog seo laravel react',
            ]
        );

        BlogPostTranslation::updateOrCreate(
            ['blog_post_id' => $post->id, 'locale' => 'en'],
            [
                'slug' => 'welcome-to-new-seo-blog',
                'title' => 'Welcome to the New Blog with Perfect SEO!',
                'excerpt' => 'Discover how we built a multi-language blog focused on SEO, Clean Code, and Markdown.',
                'content' => $markdownContentEn,
                'meta_title' => 'New Blog with Laravel and React | Your Business',
                'meta_description' => 'Learn how our cutting-edge architecture guarantees 100% SEO with dynamic pages and instant translations.',
                'focus_keyword' => 'seo blog laravel react',
            ]
        );
    }
}
