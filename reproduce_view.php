<?php

use Illuminate\Support\Facades\View;

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$kernel->bootstrap();

try {
    echo "Rendering view...\n";
    $page = [
        'component' => 'reports/index',
        'props' => [
            'seo' => [],
            'auth' => ['user' => null],
            // Add other necessary props
        ],
        'url' => '/en/dashboard',
        'version' => '123',
    ];

    // Mock the session for csrf_token
    session()->start();

    // Mock app locale
    app()->setLocale('en');

    $html = View::make('app', ['page' => $page])->render();
    echo 'View rendered successfully. Length: '.strlen($html)."\n";
} catch (\Throwable $e) {
    echo 'Caught exception: '.$e->getMessage()."\n";
    echo 'File: '.$e->getFile()."\n";
    echo 'Line: '.$e->getLine()."\n";
    echo $e->getTraceAsString();
}
