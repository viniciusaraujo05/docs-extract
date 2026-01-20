<?php

namespace Tests\Feature;

use App\Actions\Documents\StoreDocumentAction;
use App\Models\Document;
use App\Models\PlanUsage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Smalot\PdfParser\Parser;
use Tests\TestCase;

class PageBasedUsageTest extends TestCase
{
    use RefreshDatabase;

    public function test_usage_increments_by_page_count_for_new_document()
    {
        $user = User::factory()->create();
        $file = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');

        // Mock PdfParser to return 3 pages
        $mockPdf = \Mockery::mock(\Smalot\PdfParser\Document::class);
        $mockPdf->shouldReceive('getPages')->andReturn([1, 2, 3]); // 3 pages

        $mockParser = \Mockery::mock(Parser::class);
        $mockParser->shouldReceive('parseFile')->andReturn($mockPdf);

        $this->app->instance(Parser::class, $mockParser);

        $action = resolve(StoreDocumentAction::class);

        // Store document
        $document = $action->execute(
            user: $user,
            file: $file,
            type: 'predefined',
            documentTypeId: null,
            newTypeName: null,
            schema: null,
            extractedData: ['some' => 'data'], // This triggers the observer
            forceOverwrite: false
        );

        $this->assertEquals(3, $document->page_count);

        $usage = PlanUsage::firstWhere('user_id', $user->id);
        $this->assertEquals(3, $usage->documents_count);
    }

    public function test_usage_increments_by_one_for_image()
    {
        $user = User::factory()->create();
        $file = UploadedFile::fake()->image('document.jpg');

        $action = resolve(StoreDocumentAction::class);

        // Store document
        $document = $action->execute(
            user: $user,
            file: $file,
            type: 'predefined',
            documentTypeId: null,
            newTypeName: null,
            schema: null,
            extractedData: ['some' => 'data'],
            forceOverwrite: false
        );

        $this->assertEquals(1, $document->page_count);

        $usage = PlanUsage::firstWhere('user_id', $user->id);
        $this->assertEquals(1, $usage->documents_count);
    }
}
