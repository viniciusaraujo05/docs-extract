<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlogPost extends Model
{
    protected $fillable = [
        'external_id',
        'author_name',
        'published_at',
        'status',
        'cover_image_url',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    public function translations()
    {
        return $this->hasMany(BlogPostTranslation::class);
    }

    public function translation(?string $locale = null)
    {
        return $this->hasOne(BlogPostTranslation::class)->where('locale', $locale ?? app()->getLocale());
    }
}
