<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DemoUsage extends Model
{
    protected $fillable = [
        'ip_address',
        'user_agent',
        'filename',
        'mime_type',
        'file_size',
        'success',
    ];

    protected function casts(): array
    {
        return [
            'success' => 'boolean',
            'file_size' => 'integer',
        ];
    }
}
