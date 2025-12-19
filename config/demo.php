<?php

return [
    'max_requests_per_window' => env('DEMO_MAX_REQUESTS', 1),
    'window_seconds' => env('DEMO_WINDOW_SECONDS', 60 * 60 * 24),
];
