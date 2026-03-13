<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Services\SolutionPageService;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function __construct(private readonly SolutionPageService $solutionPageService) {}

    /**
     * Generate and return the sitemap.xml
     */
    public function index(): Response
    {
        $baseUrl = rtrim((string) config('app.url'), '/');
        $lastmod = now()->toAtomString();

        $pages = [];
        $pairedPaths = [
            ['path' => '', 'priority' => '1.0', 'changefreq' => 'daily', 'images' => ['/docset.png']],
            ['path' => 'blog', 'priority' => '0.9', 'changefreq' => 'daily'],
            ['path' => 'docs/api-v1', 'priority' => '0.8', 'changefreq' => 'weekly'],
            ['path' => 'privacy', 'priority' => '0.5', 'changefreq' => 'monthly'],
            ['path' => 'terms', 'priority' => '0.5', 'changefreq' => 'monthly'],
        ];

        foreach ($pairedPaths as $pairedPath) {
            foreach (['en', 'pt'] as $locale) {
                $suffix = $pairedPath['path'] === '' ? '' : '/'.$pairedPath['path'];
                $url = '/'.$locale.$suffix;
                $xDefault = '/en'.$suffix;

                $pages[] = [
                    'url' => $url,
                    'priority' => $pairedPath['priority'],
                    'changefreq' => $pairedPath['changefreq'],
                    'lastmod' => $lastmod,
                    'alternates' => [
                        ['hreflang' => 'en', 'url' => $baseUrl.'/en'.$suffix],
                        ['hreflang' => 'pt', 'url' => $baseUrl.'/pt'.$suffix],
                        ['hreflang' => 'x-default', 'url' => $baseUrl.$xDefault],
                    ],
                    'images' => $pairedPath['images'] ?? null,
                ];
            }
        }

        foreach ($this->solutionPageService->slugs() as $slug) {
            foreach (['en', 'pt-br', 'pt-pt'] as $locale) {
                $pages[] = [
                    'url' => '/'.$locale.'/'.$slug,
                    'priority' => '0.85',
                    'changefreq' => 'weekly',
                    'lastmod' => $lastmod,
                    'alternates' => [
                        ['hreflang' => 'en', 'url' => $baseUrl.'/en/'.$slug],
                        ['hreflang' => 'pt-BR', 'url' => $baseUrl.'/pt-br/'.$slug],
                        ['hreflang' => 'pt-PT', 'url' => $baseUrl.'/pt-pt/'.$slug],
                        ['hreflang' => 'x-default', 'url' => $baseUrl.'/en/'.$slug],
                    ],
                ];
            }
        }

        $this->appendBlogPostPages($pages, $baseUrl, $lastmod);

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'."\n";
        $xml .= '        xmlns:xhtml="http://www.w3.org/1999/xhtml"'."\n";
        $xml .= '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">'."\n";

        foreach ($pages as $page) {
            $pageLastmod = $page['lastmod'] ?? $lastmod;

            $xml .= "  <url>\n";
            $xml .= "    <loc>{$baseUrl}{$page['url']}</loc>\n";
            $xml .= "    <lastmod>{$pageLastmod}</lastmod>\n";
            $xml .= "    <changefreq>{$page['changefreq']}</changefreq>\n";
            $xml .= "    <priority>{$page['priority']}</priority>\n";

            // Add alternate language links when provided
            if (! empty($page['alternates'])) {
                foreach ($page['alternates'] as $alternate) {
                    $xml .= '    <xhtml:link rel="alternate" hreflang="'.$alternate['hreflang'].'" href="'.$alternate['url'].'" />'."\n";
                }
            }

            // Add images if present
            if (isset($page['images'])) {
                foreach ($page['images'] as $image) {
                    $xml .= "    <image:image>\n";
                    $xml .= "      <image:loc>{$baseUrl}{$image}</image:loc>\n";
                    $xml .= "      <image:title>DOCSET - Document Data Extraction Platform</image:title>\n";
                    $xml .= "      <image:caption>DOCSET logo - Extract structured data from PDFs and images</image:caption>\n";
                    $xml .= "    </image:image>\n";
                }
            }

            $xml .= "  </url>\n";
        }

        $xml .= '</urlset>';

        return response($xml, 200)
            ->header('Content-Type', 'application/xml; charset=UTF-8')
            ->header('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    }

    /**
     * Generate robots.txt dynamically (alternative to static file)
     */
    public function robots(): Response
    {
        $baseUrl = config('app.url');

        $content = "# DOCSET - Document Data Platform\n";
        $content .= "# Robots.txt for optimal SEO crawling\n\n";
        $content .= "# Allow all crawlers\n";
        $content .= "User-agent: *\n";
        $content .= "Allow: /\n";
        $content .= "Disallow: /api/\n";
        $content .= "Disallow: /dashboard\n";
        $content .= "Disallow: /documents\n";
        $content .= "Disallow: /document-types\n";
        $content .= "Disallow: /settings\n";
        $content .= "Disallow: /subscription\n";
        $content .= "Disallow: /login\n";
        $content .= "Disallow: /register\n";
        $content .= "Disallow: /forgot-password\n";
        $content .= "Disallow: /reset-password\n";
        $content .= "Disallow: /email/verify\n\n";
        $content .= "# Sitemap location\n";
        $content .= "Sitemap: {$baseUrl}/sitemap.xml\n\n";
        $content .= "# Crawl-delay for specific bots\n";
        $content .= "User-agent: Googlebot\n";
        $content .= "Allow: /\n";
        $content .= "Disallow: /api/\n";
        $content .= "Crawl-delay: 0\n\n";
        $content .= "User-agent: Bingbot\n";
        $content .= "Allow: /\n";
        $content .= "Disallow: /api/\n";
        $content .= "Crawl-delay: 0\n\n";
        $content .= "# Block bad bots\n";
        $content .= "User-agent: AhrefsBot\n";
        $content .= "Crawl-delay: 10\n\n";
        $content .= "User-agent: SemrushBot\n";
        $content .= "Crawl-delay: 10\n";

        return response($content, 200)
            ->header('Content-Type', 'text/plain')
            ->header('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    }

    /**
     * @param  array<int, array<string, mixed>>  $pages
     */
    private function appendBlogPostPages(array &$pages, string $baseUrl, string $fallbackLastmod): void
    {
        try {
            $posts = BlogPost::query()
                ->where('status', 'published')
                ->with(['translations' => fn ($query) => $query->whereIn('locale', ['en', 'pt'])])
                ->orderByDesc('published_at')
                ->get();
        } catch (\Throwable $exception) {
            \Illuminate\Support\Facades\Log::warning('Skipping blog posts in sitemap: database unavailable.', [
                'error' => $exception->getMessage(),
            ]);

            return;
        }

        foreach ($posts as $post) {
            $translations = $post->translations->keyBy('locale');
            $enTranslation = $translations->get('en');
            $ptTranslation = $translations->get('pt');

            if (! $enTranslation && ! $ptTranslation) {
                continue;
            }

            $alternates = [];
            if ($enTranslation) {
                $alternates[] = ['hreflang' => 'en', 'url' => $baseUrl.'/en/blog/'.$enTranslation->slug];
            }
            if ($ptTranslation) {
                $ptUrl = $baseUrl.'/pt/blog/'.$ptTranslation->slug;
                $alternates[] = ['hreflang' => 'pt', 'url' => $ptUrl];
            }

            $xDefaultUrl = $enTranslation
                ? $baseUrl.'/en/blog/'.$enTranslation->slug
                : $baseUrl.'/pt/blog/'.$ptTranslation->slug;
            $alternates[] = ['hreflang' => 'x-default', 'url' => $xDefaultUrl];

            if ($enTranslation) {
                $pages[] = [
                    'url' => '/en/blog/'.$enTranslation->slug,
                    'priority' => '0.85',
                    'changefreq' => 'daily',
                    'lastmod' => ($enTranslation->updated_at ?? $post->updated_at ?? $post->published_at)?->toAtomString() ?? $fallbackLastmod,
                    'alternates' => $alternates,
                ];
            }

            if ($ptTranslation) {
                $pages[] = [
                    'url' => '/pt/blog/'.$ptTranslation->slug,
                    'priority' => '0.85',
                    'changefreq' => 'daily',
                    'lastmod' => ($ptTranslation->updated_at ?? $post->updated_at ?? $post->published_at)?->toAtomString() ?? $fallbackLastmod,
                    'alternates' => $alternates,
                ];
            }
        }
    }
}
