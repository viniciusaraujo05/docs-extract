<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Stripe Product IDs
    |--------------------------------------------------------------------------
    |
    | Your Stripe product IDs from the Stripe Dashboard
    |
    */
    'products' => [
        'free' => env('STRIPE_PRODUCT_FREE', 'prod_Tfz97HtVyQvmlR'),
        'starter' => env('STRIPE_PRODUCT_STARTER', 'prod_TfzAvd964MUvV8'),
        'pro' => env('STRIPE_PRODUCT_PRO', 'prod_TfzBnLwkWQPd0w'),
        'business' => env('STRIPE_PRODUCT_BUSINESS', 'prod_TfzBXfGMUW6COP'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Plan Features Mapping
    |--------------------------------------------------------------------------
    |
    | Map product IDs to their features for display
    |
    */
    'features' => [
        'prod_Tfz97HtVyQvmlR' => [ // FREE
            'documents_limit' => 100,
            'models_limit' => 1,
            'api_enabled' => false,
            'reports' => 'none',
        ],
        'prod_TfzAvd964MUvV8' => [ // STARTER
            'documents_limit' => 300,
            'models_limit' => 5,
            'api_enabled' => false,
            'reports' => 'basic',
        ],
        'prod_TfzBnLwkWQPd0w' => [ // PRO
            'documents_limit' => 1500,
            'models_limit' => -1, // unlimited
            'api_enabled' => true,
            'api_requests' => 5000,
            'reports' => 'advanced',
        ],
        'prod_TfzBXfGMUW6COP' => [ // BUSINESS
            'documents_limit' => 5000,
            'models_limit' => -1, // unlimited
            'api_enabled' => true,
            'api_requests' => 25000,
            'reports' => 'advanced',
            'webhooks' => true,
        ],
    ],
];
