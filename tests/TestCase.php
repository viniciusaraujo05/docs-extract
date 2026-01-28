<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Define default 'locale' for all routes that require it
        \Illuminate\Support\Facades\URL::defaults(['locale' => 'en']);
    }
}
