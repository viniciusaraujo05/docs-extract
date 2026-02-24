<?php

namespace Tests\Feature;

use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class SolutionPagesSeoTest extends TestCase
{
    #[DataProvider('solutionRoutes')]
    public function test_solution_page_route_renders_with_expected_seo_props(string $path, string $expectedTitle): void
    {
        $this->withoutVite();

        $response = $this->get($path);

        $response->assertStatus(200);

        $page = $response->viewData('page');
        $props = $page['props'];

        $this->assertArrayHasKey('seo', $props);
        $this->assertArrayHasKey('page', $props);
        $this->assertSame($expectedTitle, $props['seo']['title']);
        $this->assertStringContainsString($path, $props['seo']['canonical']);
        $this->assertArrayHasKey('faqs', $props['page']);
        $this->assertGreaterThanOrEqual(5, count($props['page']['faqs']));
    }

    public function test_sitemap_includes_solution_routes(): void
    {
        $this->withoutVite();

        $response = $this->get('/sitemap.xml');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/xml; charset=UTF-8');
        $response->assertSee('/en/invoice-ocr', false);
        $response->assertSee('/en/receipt-ocr', false);
        $response->assertSee('/en/pdf-to-excel', false);
        $response->assertSee('/en/ocr-api', false);
        $response->assertSee('/en/invoice-parser', false);
        $response->assertSee('/pt-br/invoice-ocr', false);
        $response->assertSee('/pt-br/receipt-ocr', false);
        $response->assertSee('/pt-br/pdf-to-excel', false);
        $response->assertSee('/pt-br/ocr-api', false);
        $response->assertSee('/pt-br/invoice-parser', false);
        $response->assertSee('/pt-pt/invoice-ocr', false);
        $response->assertSee('/pt-pt/receipt-ocr', false);
        $response->assertSee('/pt-pt/pdf-to-excel', false);
        $response->assertSee('/pt-pt/ocr-api', false);
        $response->assertSee('/pt-pt/invoice-parser', false);
    }

    public function test_pt_solution_alias_redirects_to_pt_pt_canonical(): void
    {
        $this->withoutVite();

        $response = $this->get('/pt/invoice-ocr');

        $response->assertStatus(301);
        $response->assertRedirect('/pt-pt/invoice-ocr');
    }

    /**
     * @return array<string, array<int, string>>
     */
    public static function solutionRoutes(): array
    {
        return [
            'invoice_ocr' => [
                '/en/invoice-ocr',
                'Invoice OCR Software for AP Teams and ERP Export | DOCSET',
            ],
            'receipt_ocr' => [
                '/en/receipt-ocr',
                'Receipt OCR Software for Expense Teams and Audits | DOCSET',
            ],
            'pdf_to_excel' => [
                '/en/pdf-to-excel',
                'PDF to Excel Converter for Finance Ops and Reports | DOCSET',
            ],
            'ocr_api' => [
                '/en/ocr-api',
                'OCR API for Invoice and Receipt Data Extraction | DOCSET',
            ],
            'invoice_parser' => [
                '/en/invoice-parser',
                'Invoice Parser API for Line Items, Tax, and Totals | DOCSET',
            ],
            'invoice_ocr_pt_br' => [
                '/pt-br/invoice-ocr',
                'OCR de Notas Fiscais para AP e Exportação ERP | DOCSET',
            ],
            'invoice_ocr_pt_pt' => [
                '/pt-pt/invoice-ocr',
                'OCR de Faturas para AP e Exportação ERP | DOCSET',
            ],
            'pdf_to_excel_pt_br' => [
                '/pt-br/pdf-to-excel',
                'Conversor de PDF para Excel para Times Financeiros | DOCSET',
            ],
            'pdf_to_excel_pt_pt' => [
                '/pt-pt/pdf-to-excel',
                'Conversor de PDF para Excel para Operações Financeiras | DOCSET',
            ],
        ];
    }
}
