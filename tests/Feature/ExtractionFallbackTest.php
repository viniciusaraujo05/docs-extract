<?php

namespace Tests\Feature;

use App\Models\Document;
use App\Models\User;
use App\Services\DocumentService;
use App\Services\Extraction\ExtractionStrategyFactory;
use App\Services\Extraction\Strategies\TextStrategy;
use App\Services\Extraction\Strategies\VisionStrategy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class ExtractionFallbackTest extends TestCase
{
    use RefreshDatabase;

    public function test_document_service_falls_back_to_vision_when_text_fails_for_pdf()
    {
        $user = User::factory()->create();
        $document = Document::factory()->create([
            'user_id' => $user->id,
            'mime_type' => 'application/pdf',
            'type' => 'invoice',
            'status' => 'pending',
            'file_path' => 'dummy.pdf',
        ]);

        // Mocks
        // Mocks
        $mockTextStrategy = Mockery::mock(TextStrategy::class);
        $mockVisionStrategy = Mockery::mock(VisionStrategy::class);

        // Setup SmartPdfStrategy with mocked dependencies
        $smartStrategy = new \App\Services\Extraction\Strategies\SmartPdfStrategy(
            $mockTextStrategy,
            $mockVisionStrategy
        );

        // Factory returns SmartPdfStrategy
        $mockFactory = Mockery::mock(ExtractionStrategyFactory::class);
        $mockFactory->shouldReceive('getStrategy')->once()->andReturn($smartStrategy);

        // TextStrategy fails
        $mockTextStrategy->shouldReceive('extract')->once()->andThrow(new \Exception('Secured pdf file are currently not supported'));

        // VisionStrategy should be called by SmartPdfStrategy
        $mockVisionStrategy->shouldReceive('supports')->andReturn(true);
        $mockVisionStrategy->shouldReceive('extract')->once()->andReturn([
            'data' => ['invoice_number' => '123'],
            'raw_text' => null,
        ]);

        $this->app->instance(ExtractionStrategyFactory::class, $mockFactory);

        $service = resolve(DocumentService::class);
        $result = $service->processDocument($document);

        $this->assertEquals('completed', $result->status);
        $this->assertEquals(['invoice_number' => '123'], $result->extracted_data);
    }
}
