<?php

namespace Tests\Feature;

use App\Actions\AnalyzeDocument;
use App\Services\FieldDetectorService;
use App\Services\PdfValidationService;
use App\Services\TextExtractorManager;
use Illuminate\Http\UploadedFile;
use Mockery;
use Tests\TestCase;

class AnalyzeDocumentTest extends TestCase
{
    public function test_analyze_document_falls_back_to_multipage_image_detection_when_text_extraction_fails()
    {
        // Mock Dependencies
        $mockTextExtractor = Mockery::mock(TextExtractorManager::class);
        $mockFieldDetector = Mockery::mock(FieldDetectorService::class);
        $mockPdfValidation = Mockery::mock(PdfValidationService::class);
        // PdfToImageService no longer used

        $file = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');
        $fileContent = file_get_contents($file->getRealPath());

        // 1. Text extraction fails
        $mockTextExtractor->shouldReceive('extract')
            ->once()
            ->with($file)
            ->andThrow(new \Exception('Secured PDF'));

        // 2. Fallback: should call detectFromImage with PDF payload directly
        $mockFieldDetector->shouldReceive('detectFromImage')
            ->once()
            ->withArgs(function ($payloads) use ($fileContent) {
                // Should pass ARRAY of payloads
                if (! is_array($payloads) || empty($payloads[0])) {
                    return false;
                }

                $payload = $payloads[0];

                if (($payload['mime'] ?? '') !== 'application/pdf') {
                    return false;
                }

                // Verify content matches file
                if (($payload['data'] ?? '') !== base64_encode($fileContent)) {
                    return false;
                }

                return true;
            })
            ->andReturn([
                ['name' => 'field1', 'label' => 'Field 1', 'type' => 'string'],
            ]);

        // Bind Mocks
        $this->app->instance(TextExtractorManager::class, $mockTextExtractor);
        $this->app->instance(FieldDetectorService::class, $mockFieldDetector);
        $this->app->instance(PdfValidationService::class, $mockPdfValidation);

        // Execute Action
        $action = resolve(AnalyzeDocument::class);
        $result = $action->execute($file);

        $this->assertEquals('PDF analyzed using AI Vision (Direct Input)', $result['message']);
        $this->assertCount(1, $result['fields']);
    }
}
