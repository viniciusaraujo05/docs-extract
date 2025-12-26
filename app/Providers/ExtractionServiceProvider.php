<?php

declare(strict_types=1);

namespace App\Providers;

use App\Contracts\ExtractionLoggerInterface;
use App\Contracts\FieldValidatorInterface;
use App\Services\EnhancedExtractionService;
use App\Services\Extractors\ImageTextExtractor;
use App\Services\Extractors\PdfTextExtractor;
use App\Services\FieldDetectorService;
use App\Services\Logging\ExtractionLogger;
use App\Services\TextExtractorManager;
use App\Services\Validation\FieldValidator;
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
        // Register TextExtractorManager as singleton
        $this->app->singleton(TextExtractorManager::class, function () {
            $manager = new TextExtractorManager;

            // Register available extractors
            $manager->addExtractor(new PdfTextExtractor);
            $manager->addExtractor(new ImageTextExtractor);

            return $manager;
        });

        // Register FieldDetectorService as singleton
        $this->app->singleton(FieldDetectorService::class);

        // Register validation and logging contracts
        $this->app->singleton(FieldValidatorInterface::class, FieldValidator::class);
        $this->app->singleton(ExtractionLoggerInterface::class, ExtractionLogger::class);

        // Register EnhancedExtractionService as singleton
        $this->app->singleton(EnhancedExtractionService::class);
    }

    /**
     * Bootstrap dos serviços.
     */
    public function boot(): void {}
}
