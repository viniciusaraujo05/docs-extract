<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Facades\Cache;

/**
 * Small helper to keep locale JSON files cached in Redis.
 */
final class TranslationCacheService
{
    private const CACHE_PREFIX = 'translations:';

    public function __construct(
        private readonly Filesystem $filesystem,
    ) {}

    /**
     * Return the translation array for the requested locale.
     */
    public function get(string $locale): array
    {
        $locale = strtolower($locale);

        return Cache::rememberForever(
            self::CACHE_PREFIX.$locale,
            fn () => $this->loadTranslations($locale)
        );
    }

    /**
     * Warm every provided locale to avoid cold cache misses.
     *
     * @param  array<int, string>  $locales
     */
    public function warm(array $locales): void
    {
        foreach ($locales as $locale) {
            $this->get($locale);
        }
    }

    /**
     * Forget cached locale (used when updating translation files).
     */
    public function forget(string $locale): void
    {
        Cache::forget(self::CACHE_PREFIX.strtolower($locale));
    }

    private function loadTranslations(string $locale): array
    {
        $path = lang_path("{$locale}.json");

        if (!$this->filesystem->exists($path)) {
            return [];
        }

        $contents = $this->filesystem->get($path);

        return json_decode($contents, true) ?? [];
    }
}
