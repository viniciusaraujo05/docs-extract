<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Plan Configuration
    |--------------------------------------------------------------------------
    |
    | Define all available plans with their features, limits and pricing.
    | This configuration serves as the single source of truth for plans.
    |
    */

    'plans' => [
        'free' => [
            'name' => 'FREE',
            'stripe_product_id' => env('STRIPE_PRODUCT_FREE'),
            'display_name' => [
                'en' => 'Free',
                'pt-BR' => 'Grátis',
                'pt-PT' => 'Grátis',
            ],
            'tagline' => [
                'en' => 'Perfect for trying out DOCSET',
                'pt-BR' => 'Perfeito para experimentar o DOCSET',
                'pt-PT' => 'Perfeito para experimentar o DOCSET',
            ],
            'features' => [
                'en' => [
                    '20 documents per month',
                    '2 models',
                    '1 report',
                    'API access',
                    '100 API requests per month',
                    '1 API client',
                    'CSV & JSON exports',
                    'DOCSET branding on exports',
                    'Full UI',
                    'Review before saving',
                ],
                'pt-BR' => [
                    '20 documentos por mês',
                    '2 modelos',
                    '1 relatório',
                    'Acesso à API',
                    '100 requisições de API por mês',
                    '1 cliente de API',
                    'Exportações CSV e JSON',
                    'Branding DOCSET nas exportações',
                    'Interface completa',
                    'Revisão antes de salvar',
                ],
                'pt-PT' => [
                    '20 documentos por mês',
                    '2 modelos',
                    '1 relatório',
                    'Acesso à API',
                    '100 requisições de API por mês',
                    '1 cliente de API',
                    'Exportações CSV e JSON',
                    'Branding DOCSET nas exportações',
                    'Interface completa',
                    'Revisão antes de guardar',
                ],
            ],
            'limits' => [
                'documents' => 20,
                'models' => 2,
                'api_requests' => 100,
                'api_keys' => 1,
                'reports' => 1,
                'exports' => ['csv', 'json'],
                'webhooks' => false,
            ],
            'color' => 'gray',
            'recommended' => false,
        ],

        'starter' => [
            'name' => 'STARTER',
            'stripe_product_id' => env('STRIPE_PRODUCT_STARTER'),
            'display_name' => [
                'en' => 'Starter',
                'pt-BR' => 'Starter',
                'pt-PT' => 'Starter',
            ],
            'tagline' => [
                'en' => 'For individuals and small businesses',
                'pt-BR' => 'Para indivíduos e pequenas empresas',
                'pt-PT' => 'Para indivíduos e pequenas empresas',
            ],
            'features' => [
                'en' => [
                    '300 documents per month',
                    '5 models',
                    '5 reports',
                    'API access',
                    '3,000 API requests per month',
                    '2 API clients',
                    'CSV, JSON & Excel exports',
                    'Reports with filters',
                    'No DOCSET branding',
                    'Standard support',
                    'Full UI',
                ],
                'pt-BR' => [
                    '300 documentos por mês',
                    '5 modelos',
                    '5 relatórios',
                    'Acesso à API',
                    '3.000 requisições de API por mês',
                    '2 clientes de API',
                    'Exportações CSV, JSON e Excel',
                    'Relatórios com filtros',
                    'Sem branding DOCSET',
                    'Suporte padrão',
                    'Interface completa',
                ],
                'pt-PT' => [
                    '300 documentos por mês',
                    '5 modelos',
                    '5 relatórios',
                    'Acesso à API',
                    '3.000 requisições de API por mês',
                    '2 clientes de API',
                    'Exportações CSV, JSON e Excel',
                    'Relatórios com filtros',
                    'Sem branding DOCSET',
                    'Suporte padrão',
                    'Interface completa',
                ],
            ],
            'limits' => [
                'documents' => 300,
                'models' => 5,
                'api_requests' => 3000,
                'api_keys' => 2,
                'reports' => 5,
                'exports' => ['csv', 'json', 'excel'],
                'webhooks' => false,
            ],
            'color' => 'blue',
            'recommended' => false,
        ],

        'pro' => [
            'name' => 'PRO',
            'stripe_product_id' => env('STRIPE_PRODUCT_PRO'),
            'display_name' => [
                'en' => 'Pro',
                'pt-BR' => 'Pro',
                'pt-PT' => 'Pro',
            ],
            'tagline' => [
                'en' => 'For teams that need full power',
                'pt-BR' => 'Para equipes que precisam de poder total',
                'pt-PT' => 'Para equipas que precisam de poder total',
            ],
            'features' => [
                'en' => [
                    '1,500 documents per month',
                    '20 models',
                    'Unlimited reports',
                    'API access',
                    '25,000 API requests per month',
                    '5 API clients',
                    'All export formats (CSV, JSON, Excel, XML)',
                    'Advanced reports',
                    'Priority processing',
                    'Priority support',
                    'No branding',
                    'Full UI',
                ],
                'pt-BR' => [
                    '1.500 documentos por mês',
                    '20 modelos',
                    'Relatórios ilimitados',
                    'Acesso à API',
                    '25.000 requisições de API por mês',
                    '5 clientes de API',
                    'Todos os formatos de exportação (CSV, JSON, Excel, XML)',
                    'Relatórios avançados',
                    'Processamento prioritário',
                    'Suporte prioritário',
                    'Sem branding',
                    'Interface completa',
                ],
                'pt-PT' => [
                    '1.500 documentos por mês',
                    '20 modelos',
                    'Relatórios ilimitados',
                    'Acesso à API',
                    '25.000 requisições de API por mês',
                    '5 clientes de API',
                    'Todos os formatos de exportação (CSV, JSON, Excel, XML)',
                    'Relatórios avançados',
                    'Processamento prioritário',
                    'Suporte prioritário',
                    'Sem branding',
                    'Interface completa',
                ],
            ],
            'limits' => [
                'documents' => 1500,
                'models' => 20,
                'api_requests' => 25000,
                'api_keys' => 5,
                'reports' => -1, // unlimited
                'exports' => ['csv', 'json', 'excel', 'xml'],
                'webhooks' => false,
            ],
            'color' => 'purple',
            'recommended' => true,
        ],

        'business' => [
            'name' => 'BUSINESS',
            'stripe_product_id' => env('STRIPE_PRODUCT_BUSINESS'),
            'display_name' => [
                'en' => 'Business',
                'pt-BR' => 'Business',
                'pt-PT' => 'Business',
            ],
            'tagline' => [
                'en' => 'For enterprises and serious integrations',
                'pt-BR' => 'Para empresas e integrações sérias',
                'pt-PT' => 'Para empresas e integrações sérias',
            ],
            'features' => [
                'en' => [
                    '5,000+ documents per month',
                    'Unlimited models',
                    'Unlimited reports',
                    'API access',
                    '100,000+ API requests per month',
                    '10 API clients',
                    'All export formats',
                    'Webhooks (coming soon)',
                    'Basic SLA',
                    'Priority support',
                    'Custom integrations',
                    'No branding',
                    'Full UI',
                ],
                'pt-BR' => [
                    '5.000+ documentos por mês',
                    'Modelos ilimitados',
                    'Relatórios ilimitados',
                    'Acesso à API',
                    '100.000+ requisições de API por mês',
                    '10 clientes de API',
                    'Todos os formatos de exportação',
                    'Webhooks (em breve)',
                    'SLA básico',
                    'Suporte prioritário',
                    'Integrações personalizadas',
                    'Sem branding',
                    'Interface completa',
                ],
                'pt-PT' => [
                    '5.000+ documentos por mês',
                    'Modelos ilimitados',
                    'Relatórios ilimitados',
                    'Acesso à API',
                    '100.000+ requisições de API por mês',
                    '10 clientes de API',
                    'Todos os formatos de exportação',
                    'Webhooks (brevemente)',
                    'SLA básico',
                    'Suporte prioritário',
                    'Integrações personalizadas',
                    'Sem branding',
                    'Interface completa',
                ],
            ],
            'limits' => [
                'documents' => 5000,
                'models' => -1, // unlimited
                'api_requests' => 100000,
                'api_keys' => 10,
                'reports' => -1, // unlimited
                'exports' => ['csv', 'json', 'excel', 'xml'],
                'webhooks' => true,
            ],
            'color' => 'orange',
            'recommended' => false,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Plan Mappings
    |--------------------------------------------------------------------------
    |
    | Map Stripe product IDs to plan keys for easy lookup.
    |
    */

    'product_mapping' => [
        env('STRIPE_PRODUCT_FREE') => 'free',
        env('STRIPE_PRODUCT_STARTER') => 'starter',
        env('STRIPE_PRODUCT_PRO') => 'pro',
        env('STRIPE_PRODUCT_BUSINESS') => 'business',
    ],

    /*
    |--------------------------------------------------------------------------
    | Usage Warnings
    |--------------------------------------------------------------------------
    |
    | Configure when to show usage warnings (percentage of limit used).
    |
    */

    'usage_warnings' => [
        'warning_threshold' => 80, // Show warning at 80% usage
        'critical_threshold' => 95, // Show critical warning at 95% usage
    ],
];
