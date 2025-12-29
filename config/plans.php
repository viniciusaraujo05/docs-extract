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
            'price' => '€0',
            'interval' => 'month',
            'tagline' => 'Perfect for trying out DOCSET',
            'features' => [
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
            'price' => '€25',
            'interval' => 'month',
            'tagline' => 'For individuals and small businesses',
            'features' => [
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
            'price' => '€49',
            'interval' => 'month',
            'tagline' => 'For teams that need full power',
            'features' => [
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
            'price' => '€99',
            'interval' => 'month',
            'tagline' => 'For enterprises and serious integrations',
            'features' => [
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
