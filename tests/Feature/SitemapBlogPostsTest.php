<?php

namespace Tests\Feature;

use App\Models\BlogPost;
use App\Models\BlogPostTranslation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class SitemapBlogPostsTest extends TestCase
{
    public function test_sitemap_includes_published_blog_posts_and_excludes_drafts(): void
    {
        if (! $this->databaseIsReady()) {
            $this->markTestSkipped('Database is not available for sitemap blog tests.');
        }

        $suffix = uniqid('', true);

        $publishedPost = BlogPost::create([
            'external_id' => 'published-post-'.$suffix,
            'author_name' => 'SEO Bot',
            'published_at' => now()->subDay(),
            'status' => 'published',
        ]);

        BlogPostTranslation::create([
            'blog_post_id' => $publishedPost->id,
            'locale' => 'en',
            'slug' => 'invoice-ocr-guide-'.$suffix,
            'title' => 'Invoice OCR guide',
            'content' => 'content',
        ]);

        BlogPostTranslation::create([
            'blog_post_id' => $publishedPost->id,
            'locale' => 'pt',
            'slug' => 'guia-ocr-faturas-'.$suffix,
            'title' => 'Guia OCR faturas',
            'content' => 'conteudo',
        ]);

        $draftPost = BlogPost::create([
            'external_id' => 'draft-post-'.$suffix,
            'author_name' => 'SEO Bot',
            'published_at' => now(),
            'status' => 'draft',
        ]);

        BlogPostTranslation::create([
            'blog_post_id' => $draftPost->id,
            'locale' => 'en',
            'slug' => 'should-not-index-'.$suffix,
            'title' => 'Draft',
            'content' => 'draft',
        ]);

        $response = $this->get('/sitemap.xml');

        $response->assertOk();
        $response->assertSee('/en/blog/invoice-ocr-guide-'.$suffix, false);
        $response->assertSee('/pt/blog/guia-ocr-faturas-'.$suffix, false);
        $response->assertDontSee('/en/blog/should-not-index-'.$suffix, false);
    }

    public function test_sitemap_uses_available_locale_when_post_has_single_translation(): void
    {
        if (! $this->databaseIsReady()) {
            $this->markTestSkipped('Database is not available for sitemap blog tests.');
        }

        $suffix = uniqid('', true);

        $post = BlogPost::create([
            'external_id' => 'single-locale-post-'.$suffix,
            'author_name' => 'SEO Bot',
            'published_at' => now()->subHours(3),
            'status' => 'published',
        ]);

        BlogPostTranslation::create([
            'blog_post_id' => $post->id,
            'locale' => 'en',
            'slug' => 'single-language-post-'.$suffix,
            'title' => 'Single language post',
            'content' => 'content',
        ]);

        $response = $this->get('/sitemap.xml');

        $response->assertOk();
        $response->assertSee('/en/blog/single-language-post-'.$suffix, false);
        $response->assertDontSee('/pt/blog/single-language-post-'.$suffix, false);
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
