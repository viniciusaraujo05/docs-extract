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
                    '100 pages per month',
                    '5 models',
                    '1 report',
                    'API access',
                    '150 API requests per month',
                    'Full UI',
                ],
                'pt-BR' => [
                    '100 páginas por mês',
                    '5 modelos',
                    '1 relatório',
                    'Acesso à API',
                    '150 requisições de API por mês',
                    'Interface completa',
                ],
                'pt-PT' => [
                    '100 páginas por mês',
                    '5 modelos',
                    '1 relatório',
                    'Acesso à API',
                    '150 requisições de API por mês',
                    'Interface completa',
                ],
            ],
            'limits' => [
                'documents' => 100,
                'models' => 5,
                'api_requests' => 150,
                'reports' => 1,
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
                    '500 pages per month',
                    '10 models',
                    '5 reports',
                    'API access',
                    '3,000 API requests per month',
                    'Standard support',
                    'Full UI',
                ],
                'pt-BR' => [
                    '500 páginas por mês',
                    '10 modelos',
                    '5 relatórios',
                    'Acesso à API',
                    '3.000 requisições de API por mês',
                    'Interface completa',
                ],
                'pt-PT' => [
                    '500 páginas por mês',
                    '10 modelos',
                    '5 relatórios',
                    'Acesso à API',
                    '3.000 requisições de API por mês',
                    'Interface completa',
                ],
            ],
            'limits' => [
                'documents' => 500,
                'models' => 10,
                'api_requests' => 3000,
                'reports' => 5,
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
                    '1,500 pages per month',
                    '20 models',
                    'Unlimited reports',
                    'API access',
                    '25,000 API requests per month',
                    'Priority support',
                    'Full UI',
                ],
                'pt-BR' => [
                    '1.500 páginas por mês',
                    '20 modelos',
                    'Relatórios ilimitados',
                    'Acesso à API',
                    '25.000 requisições de API por mês',
                    'Processamento prioritário',
                    'Suporte prioritário',
                    'Interface completa',
                ],
                'pt-PT' => [
                    '1.500 páginas por mês',
                    '20 modelos',
                    'Relatórios ilimitados',
                    'Acesso à API',
                    '25.000 requisições de API por mês',
                    'Processamento prioritário',
                    'Suporte prioritário',
                    'Interface completa',
                ],
            ],
            'limits' => [
                'documents' => 1500,
                'models' => 20,
                'api_requests' => 25000,
                'reports' => -1, // unlimited
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
                    '5,000+ pages per month',
                    'Unlimited models',
                    'Unlimited reports',
                    'API access',
                    '100,000+ API requests per month',
                    'Webhooks (coming soon)',
                    'Priority support',
                    'Full UI',
                ],
                'pt-BR' => [
                    '5.000+ páginas por mês',
                    'Modelos ilimitados',
                    'Relatórios ilimitados',
                    'Acesso à API',
                    '100.000+ requisições de API por mês',
                    'Webhooks (em breve)',
                    'SLA básico',
                    'Suporte prioritário',
                    'Interface completa',
                ],
                'pt-PT' => [
                    '5.000+ páginas por mês',
                    'Modelos ilimitados',
                    'Relatórios ilimitados',
                    'Acesso à API',
                    '100.000+ requisições de API por mês',
                    'Webhooks (brevemente)',
                    'SLA básico',
                    'Suporte prioritário',
                    'Interface completa',
                ],
            ],
            'limits' => [
                'documents' => 5000,
                'models' => -1, // unlimited
                'api_requests' => 100000,
                'reports' => -1, // unlimited
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
