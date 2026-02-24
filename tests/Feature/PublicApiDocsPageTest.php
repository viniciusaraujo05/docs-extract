<?php

namespace Tests\Feature;

use Tests\TestCase;

class PublicApiDocsPageTest extends TestCase
{
    public function test_public_api_docs_route_renders_for_en_and_pt(): void
    {
        $this->withoutVite();

        $responseEn = $this->get('/en/docs/api-v1');
        $responseEn->assertOk();

        $pageEn = $responseEn->viewData('page');
        $propsEn = $pageEn['props'];

        $this->assertSame('en', $propsEn['locale']);
        $this->assertStringContainsString('/v1/auth/token', $propsEn['markdown']);
        $this->assertStringNotContainsStringIgnoringCase('zapier', $propsEn['markdown']);

        $responsePt = $this->get('/pt/docs/api-v1');
        $responsePt->assertOk();

        $pagePt = $responsePt->viewData('page');
        $propsPt = $pagePt['props'];

        $this->assertSame('pt', $propsPt['locale']);
        $this->assertStringContainsString('/v1/auth/token', $propsPt['markdown']);
        $this->assertStringNotContainsStringIgnoringCase('zapier', $propsPt['markdown']);
    }

    public function test_docs_short_route_redirects_to_api_v1_docs(): void
    {
        $response = $this->get('/en/docs');

        $response->assertStatus(301);
        $response->assertRedirect('/en/docs/api-v1');
    }

    public function test_pt_variants_redirect_to_pt_canonical_docs(): void
    {
        $responsePtBr = $this->get('/pt-br/docs/api-v1');
        $responsePtBr->assertStatus(301);
        $responsePtBr->assertRedirect('/pt/docs/api-v1');

        $responsePtPt = $this->get('/pt-pt/docs/api-v1');
        $responsePtPt->assertStatus(301);
        $responsePtPt->assertRedirect('/pt/docs/api-v1');
    }

    public function test_sitemap_includes_public_api_docs_routes(): void
    {
        $this->withoutVite();

        $response = $this->get('/sitemap.xml');

        $response->assertOk();
        $response->assertSee('/en/docs/api-v1', false);
        $response->assertSee('/pt/docs/api-v1', false);
    }
}
