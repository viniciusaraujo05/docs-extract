<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Super Admin Password Hash
    |--------------------------------------------------------------------------
    |
    | Prefer provisioning the super admin password via configuration or
    | environment instead of relying on a public first-run setup flow.
    |
    */
    'password_hash' => env('SUPER_ADMIN_PASSWORD_HASH'),

    /*
    |--------------------------------------------------------------------------
    | Allow Interactive Setup
    |--------------------------------------------------------------------------
    |
    | Disabled by default. Enable only in controlled environments when you
    | intentionally want to bootstrap the super admin through the UI.
    |
    */
    'allow_local_setup' => env('SUPER_ADMIN_ALLOW_LOCAL_SETUP', false),
];
