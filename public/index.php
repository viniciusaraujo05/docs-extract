<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
// EXTREME LOGGING FOR DEBUGGING
file_put_contents(storage_path('logs/request.log'), "[" . date('Y-m-d H:i:s') . "] Request: " . $_SERVER['REQUEST_URI'] . "\n", FILE_APPEND);

if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$app->handleRequest(Request::capture());
