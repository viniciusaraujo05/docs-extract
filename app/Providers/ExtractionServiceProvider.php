<?php

declare(strict_types=1);

namespace App\Providers;

use App\Services\Extractors\ImageTextExtractor;
use App\Services\Extractors\PdfTextExtractor;
use App\Services\FieldDetectorService;
use App\Services\TextExtractorManager;
use Illuminate\Support\ServiceProvider;

/**
 * Service Provider para serviços de extração de documentos.
 * 
 * Regista os extractors de texto e serviços relacionados
 * no container de injeção de dependências.
 */
class ExtractionServiceProvider extends ServiceProvider
{
    /**
     * Regista os serviços no container.
     */
    public function register(): void
    {
        // Regista o TextExtractorManager como singleton
        $this->app->singleton(TextExtractorManager::class, function () {
            $manager = new TextExtractorManager();
            
            // Regista os extractors disponíveis
            $manager->addExtractor(new PdfTextExtractor());
            $manager->addExtractor(new ImageTextExtractor());
            
            return $manager;
        });

        // Regista o FieldDetectorService como singleton
        $this->app->singleton(FieldDetectorService::class);
    }

    /**
     * Bootstrap dos serviços.
     */
    public function boot(): void
    {
        //
    }
}
