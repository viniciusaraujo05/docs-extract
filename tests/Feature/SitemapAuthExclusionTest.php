<?php

namespace Tests\Feature;

use Tests\TestCase;

class SitemapAuthExclusionTest extends TestCase
{
    public function test_sitemap_excludes_authentication_routes(): void
    {
        $this->withoutVite();

        $response = $this->get('/sitemap.xml');

        $response->assertOk();
        $response->assertDontSee('/en/login', false);
        $response->assertDontSee('/pt/login', false);
        $response->assertDontSee('/en/register', false);
        $response->assertDontSee('/pt/register', false);
    }

    public function test_robots_file_blocks_localized_authentication_routes(): void
    {
        $robots = file_get_contents(public_path('robots.txt'));

        $this->assertIsString($robots);
        $this->assertStringContainsString('Disallow: /en/login', $robots);
        $this->assertStringContainsString('Disallow: /pt/login', $robots);
        $this->assertStringContainsString('Disallow: /en/register', $robots);
        $this->assertStringContainsString('Disallow: /pt/register', $robots);
    }
}
