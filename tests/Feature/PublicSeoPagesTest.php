<?php

namespace Tests\Feature;

use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class PublicSeoPagesTest extends TestCase
{
    #[DataProvider('routeSeoProvider')]
    public function test_public_pages_render_route_specific_seo_props(
        string $path,
        string $expectedTitle,
        string $expectedDescription,
        string $expectedCanonicalPath
    ): void {
        $this->withoutVite();

        $response = $this->get($path);
        $response->assertOk();

        $page = $response->viewData('page');
        $props = $page['props'];
        $baseUrl = rtrim((string) config('app.url'), '/');

        $this->assertSame($expectedTitle, $props['seo']['title']);
        $this->assertSame($expectedDescription, $props['seo']['description']);
        $this->assertSame($baseUrl.$expectedCanonicalPath, $props['seo']['canonical']);

        $response->assertSee($expectedDescription, false);
        $response->assertSee($baseUrl.$expectedCanonicalPath, false);
    }

    public function test_login_and_register_pages_are_noindex_in_ssr_output(): void
    {
        $this->withoutVite();

        $loginResponse = $this->get('/en/login');
        $loginResponse->assertOk();
        $loginPage = $loginResponse->viewData('page');
        $this->assertSame('noindex, nofollow', $loginPage['props']['seo']['robots']);
        $loginResponse->assertSee('noindex, nofollow', false);

        $registerResponse = $this->get('/pt/register');
        $registerResponse->assertOk();
        $registerPage = $registerResponse->viewData('page');
        $this->assertSame('noindex, nofollow', $registerPage['props']['seo']['robots']);
        $registerResponse->assertSee('noindex, nofollow', false);
    }

    /**
     * @return array<string, array<int, string>>
     */
    public static function routeSeoProvider(): array
    {
        return [
            'home_en' => [
                '/en',
                'PDF to Excel & Invoice OCR | DOCSET',
                'Convert PDFs to Excel in seconds and extract invoice, receipt, and ID data automatically. No code required.',
                '/en',
            ],
            'privacy_en' => [
                '/en/privacy',
                'Privacy Policy | DOCSET',
                'Learn how DOCSET collects, uses, and protects document, account, and integration data.',
                '/en/privacy',
            ],
            'terms_pt' => [
                '/pt/terms',
                'Termos de Serviço | DOCSET',
                'Consulte os termos de utilização da DOCSET, incluindo contas, faturação e uso aceitável da plataforma.',
                '/pt/terms',
            ],
        ];
    }
}
