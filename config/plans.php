<?php

$limits = [
    'free' => [
        'documents' => 20,
        'models' => 5,
        'reports' => 1,
        'api_requests' => 150,
    ],
    'starter' => [
        'documents' => 300,
        'models' => 10,
        'reports' => 5,
        'api_requests' => 3000,
    ],
    'pro' => [
        'documents' => 1200,
        'models' => 20,
        'reports' => -1, // unlimited
        'api_requests' => 25000,
    ],
    'business' => [
        'documents' => 3500,
        'models' => -1, // unlimited
        'reports' => -1, // unlimited
        'api_requests' => 100000,
    ],
];

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
                    "{$limits['free']['documents']} pages per month",
                    "{$limits['free']['models']} models",
                    "{$limits['free']['reports']} report",
                    'API access',
                    "{$limits['free']['api_requests']} API requests per month",
                    'Webhooks',
                    'Full UI',
                ],
                'pt-BR' => [
                    "{$limits['free']['documents']} páginas por mês",
                    "{$limits['free']['models']} modelos",
                    "{$limits['free']['reports']} relatório",
                    'Acesso à API',
                    "{$limits['free']['api_requests']} requisições de API por mês",
                    'Webhooks',
                    'Interface completa',
                ],
                'pt-PT' => [
                    "{$limits['free']['documents']} páginas por mês",
                    "{$limits['free']['models']} modelos",
                    "{$limits['free']['reports']} relatório",
                    'Acesso à API',
                    "{$limits['free']['api_requests']} requisições de API por mês",
                    'Webhooks',
                    'Interface completa',
                ],
            ],
            'limits' => $limits['free'],
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
                    "{$limits['starter']['documents']} pages per month",
                    "{$limits['starter']['models']} models",
                    "{$limits['starter']['reports']} reports",
                    'API access',
                    number_format($limits['starter']['api_requests']).' API requests per month',
                    'Webhooks',
                    'Standard support',
                    'Full UI',
                ],
                'pt-BR' => [
                    "{$limits['starter']['documents']} páginas por mês",
                    "{$limits['starter']['models']} modelos",
                    "{$limits['starter']['reports']} relatórios",
                    'Acesso à API',
                    number_format($limits['starter']['api_requests'], 0, ',', '.').' requisições de API por mês',
                    'Webhooks',
                    'Suporte padrão',
                    'Interface completa',
                ],
                'pt-PT' => [
                    "{$limits['starter']['documents']} páginas por mês",
                    "{$limits['starter']['models']} modelos",
                    "{$limits['starter']['reports']} relatórios",
                    'Acesso à API',
                    number_format($limits['starter']['api_requests'], 0, ',', '.').' requisições de API por mês',
                    'Webhooks',
                    'Suporte padrão',
                    'Interface completa',
                ],
            ],
            'limits' => $limits['starter'],
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
                    number_format($limits['pro']['documents']).' pages per month',
                    "{$limits['pro']['models']} models",
                    'Unlimited reports',
                    'API access',
                    number_format($limits['pro']['api_requests']).' API requests per month',
                    'Priority support',
                    'Webhooks',
                    'Full UI',
                ],
                'pt-BR' => [
                    number_format($limits['pro']['documents'], 0, ',', '.').' páginas por mês',
                    "{$limits['pro']['models']} modelos",
                    'Relatórios ilimitados',
                    'Acesso à API',
                    number_format($limits['pro']['api_requests'], 0, ',', '.').' requisições de API por mês',
                    'Processamento prioritário',
                    'Suporte prioritário',

                    'Interface completa',
                ],
                'pt-PT' => [
                    number_format($limits['pro']['documents'], 0, ',', '.').' páginas por mês',
                    "{$limits['pro']['models']} modelos",
                    'Relatórios ilimitados',
                    'Acesso à API',
                    number_format($limits['pro']['api_requests'], 0, ',', '.').' requisições de API por mês',
                    'Processamento prioritário',
                    'Suporte prioritário',
                    'Webhooks',
                    'Interface completa',
                ],
            ],
            'limits' => $limits['pro'],
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
                    number_format($limits['business']['documents']).'+ pages per month',
                    'Unlimited models',
                    'Unlimited reports',
                    'API access',
                    number_format($limits['business']['api_requests']).'+ API requests per month',
                    'Webhooks',
                    'Priority support',
                    'Full UI',
                ],
                'pt-BR' => [
                    number_format($limits['business']['documents'], 0, ',', '.').'+ páginas por mês',
                    'Modelos ilimitados',
                    'Relatórios ilimitados',
                    'Acesso à API',
                    number_format($limits['business']['api_requests'], 0, ',', '.').'+ requisições de API por mês',
                    'Webhooks',
                    'Suporte prioritário',
                    'Interface completa',
                ],
                'pt-PT' => [
                    number_format($limits['business']['documents'], 0, ',', '.').'+ páginas por mês',
                    'Modelos ilimitados',
                    'Relatórios ilimitados',
                    'Acesso à API',
                    number_format($limits['business']['api_requests'], 0, ',', '.').'+ requisições de API por mês',
                    'Webhooks',
                    'Suporte prioritário',
                    'Interface completa',
                ],
            ],
            'limits' => $limits['business'],
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
