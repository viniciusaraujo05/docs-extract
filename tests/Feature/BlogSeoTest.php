<?php

namespace Tests\Feature;

use App\Models\BlogPost;
use App\Models\BlogPostTranslation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class BlogSeoTest extends TestCase
{
    public function test_blog_post_uses_localized_canonical_and_translation_alternates(): void
    {
        if (! $this->databaseIsReady()) {
            $this->markTestSkipped('Database is not available for blog SEO tests.');
        }

        $this->withoutVite();

        $suffix = uniqid('', true);

        $post = BlogPost::create([
            'external_id' => 'blog-seo-post-'.$suffix,
            'author_name' => 'SEO Bot',
            'published_at' => now()->subDay(),
            'status' => 'published',
            'cover_image_url' => 'https://cdn.example.com/docset-blog.png',
        ]);

        BlogPostTranslation::create([
            'blog_post_id' => $post->id,
            'locale' => 'en',
            'slug' => 'invoice-ocr-api-guide-'.$suffix,
            'title' => 'Invoice OCR API Guide',
            'excerpt' => 'Understand invoice OCR API workflows.',
            'content' => 'English content',
            'meta_title' => 'Invoice OCR API Guide for Automation Teams | DOCSET',
            'meta_description' => 'A practical guide to invoice OCR APIs, automation workflows, and export strategies.',
            'focus_keyword' => 'invoice ocr api',
        ]);

        BlogPostTranslation::create([
            'blog_post_id' => $post->id,
            'locale' => 'pt',
            'slug' => 'guia-api-ocr-faturas-'.$suffix,
            'title' => 'Guia de API OCR para Faturas',
            'excerpt' => 'Entenda fluxos com API OCR para faturas.',
            'content' => 'Conteudo em portugues',
            'meta_title' => 'Guia de API OCR para Faturas | DOCSET',
            'meta_description' => 'Um guia prático para fluxos com OCR, automação e exportação de dados de faturas.',
            'focus_keyword' => 'api ocr faturas',
        ]);

        $response = $this->get('/en/blog/invoice-ocr-api-guide-'.$suffix);
        $response->assertOk();

        $page = $response->viewData('page');
        $props = $page['props'];
        $baseUrl = rtrim((string) config('app.url'), '/');

        $this->assertSame(
            'Invoice OCR API Guide for Automation Teams | DOCSET',
            $props['seo']['title']
        );
        $this->assertSame(
            $baseUrl.'/en/blog/invoice-ocr-api-guide-'.$suffix,
            $props['seo']['canonical']
        );

        $this->assertContains(
            ['locale' => 'pt', 'url' => $baseUrl.'/pt/blog/guia-api-ocr-faturas-'.$suffix],
            $props['seo']['alternateLocales']
        );
        $this->assertContains(
            ['locale' => 'x-default', 'url' => $baseUrl.'/en/blog/invoice-ocr-api-guide-'.$suffix],
            $props['seo']['alternateLocales']
        );

        $response->assertSee($baseUrl.'/en/blog/invoice-ocr-api-guide-'.$suffix, false);
        $response->assertSee($baseUrl.'/pt/blog/guia-api-ocr-faturas-'.$suffix, false);
    }

    public function test_blog_index_has_specific_seo_props(): void
    {
        if (! $this->databaseIsReady()) {
            $this->markTestSkipped('Database is not available for blog SEO tests.');
        }

        $this->withoutVite();

        $response = $this->get('/en/blog');
        $response->assertOk();

        $page = $response->viewData('page');
        $props = $page['props'];

        $this->assertSame(
            'DOCSET Blog: OCR, PDFs, and document automation',
            $props['seo']['title']
        );
        $this->assertSame(
            'Guides, comparisons, and tutorials about OCR, data extraction, PDF automation, and API integrations.',
            $props['seo']['description']
        );
    }

    private function databaseIsReady(): bool
    {
        try {
            DB::connection()->getPdo();

            return Schema::hasTable('blog_posts') && Schema::hasTable('blog_post_translations');
        } catch (\Throwable) {
            return false;
        }
    }
}
