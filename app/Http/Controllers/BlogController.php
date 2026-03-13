<?php

namespace App\Http\Controllers;

use App\Actions\Blog\GetPostForDisplayAction;
use App\Actions\Blog\GetPublishedPostsAction;
use App\Helpers\SeoHelper;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BlogController extends Controller
{
    public function index(string $locale, Request $request, GetPublishedPostsAction $action)
    {
        $posts = $action->execute($locale, 10);
        $isPt = $locale === 'pt';

        return Inertia::render('Blog/Index', [
            'posts' => $posts,
            'locale' => $locale,
            'seo' => SeoHelper::buildLocalizedPageSeo(
                $locale,
                'blog',
                $isPt ? 'Blog DOCSET: OCR, PDFs e automação de documentos' : 'DOCSET Blog: OCR, PDFs, and document automation',
                $isPt
                    ? 'Guias, comparativos e tutoriais sobre OCR, extração de dados, automação de PDFs e integrações com API.'
                    : 'Guides, comparisons, and tutorials about OCR, data extraction, PDF automation, and API integrations.'
            ),
        ]);
    }

    public function show(string $locale, string $slug, GetPostForDisplayAction $action, GetPublishedPostsAction $listAction)
    {
        $post = $action->execute($locale, $slug);
        $post->loadMissing('translations');
        $latestPosts = $listAction->execute($locale, 5); // get 5 recent to show on sidebar
        $translation = $post->translation;
        $title = $translation?->meta_title ?: $translation?->title ?: 'DOCSET Blog';
        $description = $translation?->meta_description ?: $translation?->excerpt ?: '';
        $canonicalPath = $locale.'/blog/'.$translation?->slug;
        $alternatePaths = [];

        foreach ($post->translations as $postTranslation) {
            if (! in_array($postTranslation->locale, ['en', 'pt'], true)) {
                continue;
            }

            $alternatePaths[$postTranslation->locale] = $postTranslation->locale.'/blog/'.$postTranslation->slug;
        }

        $structuredData = [
            '@context' => 'https://schema.org',
            '@type' => 'BlogPosting',
            'mainEntityOfPage' => [
                '@type' => 'WebPage',
                '@id' => rtrim((string) config('app.url'), '/').'/'.$canonicalPath,
            ],
            'headline' => $title,
            'description' => $description,
            'image' => $post->cover_image_url,
            'author' => [
                '@type' => 'Person',
                'name' => $post->author_name,
            ],
            'datePublished' => optional($post->published_at)->toAtomString(),
            'dateModified' => optional($post->updated_at ?? $post->published_at)->toAtomString(),
        ];

        return Inertia::render('Blog/Show', [
            'post' => $post,
            'latestPosts' => $latestPosts,
            'locale' => $locale,
            'seo' => SeoHelper::buildLocalizedPageSeo(
                $locale,
                'blog/'.$translation?->slug,
                $title,
                $description,
                [
                    'keywords' => $translation?->focus_keyword,
                    'ogImage' => $post->cover_image_url ?: null,
                    'structuredData' => json_encode($structuredData, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                    'alternateLocales' => SeoHelper::buildAlternateLocales($alternatePaths),
                ]
            ),
        ]);
    }
}
