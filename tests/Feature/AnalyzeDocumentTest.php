<?php

namespace Tests\Feature;

use App\Actions\AnalyzeDocument;
use App\Services\FieldDetectorService;
use App\Services\PdfToImageService;
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
        $mockPdfService = Mockery::mock(PdfToImageService::class);

        $file = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');

        // Create dummy temp images so file_get_contents works
        $tempImg1 = tempnam(sys_get_temp_dir(), 'test_p1_');
        $tempImg2 = tempnam(sys_get_temp_dir(), 'test_p2_');
        file_put_contents($tempImg1, 'image1data');
        file_put_contents($tempImg2, 'image2data');

        // 1. Text extraction fails
        $mockTextExtractor->shouldReceive('extract')
            ->once()
            ->with($file)
            ->andThrow(new \Exception('Secured PDF'));

        // 2. Fallback: PdfToImageService returns paths to existing files
        $mockPdfService->shouldReceive('convertPdf')
            ->once()
            ->with($file)
            ->andReturn([$tempImg1, $tempImg2]);

        $mockPdfService->shouldReceive('cleanup')
            ->once()
            ->with([$tempImg1, $tempImg2]);

        // 3. FieldDetectorService should receive array of 2 images
        $mockFieldDetector->shouldReceive('detectFromImage')
            ->once()
            ->withArgs(function ($images) {
                if (! is_array($images) || count($images) !== 2) {
                    return false;
                }
                if ($images[0]['mime'] !== 'image/png') {
                    return false;
                }
                // verify data is base64 of 'image1data'
                if ($images[0]['data'] !== base64_encode('image1data')) {
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
        $this->app->instance(PdfToImageService::class, $mockPdfService);

        // Execute Action
        $action = resolve(AnalyzeDocument::class);
        $result = $action->execute($file);

        // Cleanup
        @unlink($tempImg1);
        @unlink($tempImg2);

        $this->assertEquals('PDF analyzed using AI Vision (converted to image)', $result['message']);
        $this->assertCount(1, $result['fields']);
    }
}
