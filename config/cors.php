<?php

return [
    'paths' => ['api/webhooks/blog/sync'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'http://208.77.244.35',
        'https://208.77.244.35',
        'https://clawdbot-railway-template-production-8acd.up.railway.app',
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
