<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /**
     * Generate and return the sitemap.xml
     */
    public function index(): Response
    {
        $baseUrl = config('app.url');
        
        // Define all public pages with their priority and change frequency
        $pages = [
            // Homepage in both languages
            ['url' => '/', 'priority' => '1.0', 'changefreq' => 'daily'],
            ['url' => '/en', 'priority' => '1.0', 'changefreq' => 'daily'],
            ['url' => '/pt', 'priority' => '1.0', 'changefreq' => 'daily'],
            
            // Privacy and Terms pages
            ['url' => '/en/privacy', 'priority' => '0.5', 'changefreq' => 'monthly'],
            ['url' => '/pt/privacy', 'priority' => '0.5', 'changefreq' => 'monthly'],
            ['url' => '/en/terms', 'priority' => '0.5', 'changefreq' => 'monthly'],
            ['url' => '/pt/terms', 'priority' => '0.5', 'changefreq' => 'monthly'],
            
            // Auth pages (lower priority)
            ['url' => '/en/login', 'priority' => '0.3', 'changefreq' => 'monthly'],
            ['url' => '/pt/login', 'priority' => '0.3', 'changefreq' => 'monthly'],
            ['url' => '/en/register', 'priority' => '0.7', 'changefreq' => 'monthly'],
            ['url' => '/pt/register', 'priority' => '0.7', 'changefreq' => 'monthly'],
        ];

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"' . "\n";
        $xml .= '        xmlns:xhtml="http://www.w3.org/1999/xhtml"' . "\n";
        $xml .= '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">' . "\n";

        foreach ($pages as $page) {
            $xml .= "  <url>\n";
            $xml .= "    <loc>{$baseUrl}{$page['url']}</loc>\n";
            $xml .= "    <lastmod>" . now()->toAtomString() . "</lastmod>\n";
            $xml .= "    <changefreq>{$page['changefreq']}</changefreq>\n";
            $xml .= "    <priority>{$page['priority']}</priority>\n";
            
            // Add alternate language links for homepage
            if (in_array($page['url'], ['/', '/en', '/pt'])) {
                $xml .= "    <xhtml:link rel=\"alternate\" hreflang=\"en\" href=\"{$baseUrl}/en\" />\n";
                $xml .= "    <xhtml:link rel=\"alternate\" hreflang=\"pt-BR\" href=\"{$baseUrl}/pt\" />\n";
                $xml .= "    <xhtml:link rel=\"alternate\" hreflang=\"pt-PT\" href=\"{$baseUrl}/pt\" />\n";
                $xml .= "    <xhtml:link rel=\"alternate\" hreflang=\"x-default\" href=\"{$baseUrl}/en\" />\n";
            }
            
            $xml .= "  </url>\n";
        }

        $xml .= '</urlset>';

        return response($xml, 200)
            ->header('Content-Type', 'application/xml')
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
}
