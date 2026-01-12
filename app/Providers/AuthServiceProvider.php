<?php

namespace App\Providers;

use App\Models\Document;
use App\Models\DocumentType;
use App\Models\ReportConfiguration;
use App\Models\ApiClient;
use App\Policies\DocumentPolicy;
use App\Policies\DocumentTypePolicy;
use App\Policies\ReportConfigurationPolicy;
use App\Policies\ApiClientPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Document::class => DocumentPolicy::class,
        DocumentType::class => DocumentTypePolicy::class,
        ReportConfiguration::class => ReportConfigurationPolicy::class,
        ApiClient::class => ApiClientPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
