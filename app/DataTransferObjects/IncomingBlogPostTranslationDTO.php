<?php

namespace App\DataTransferObjects;

class IncomingBlogPostTranslationDTO
{
    public function __construct(
        public readonly string $locale,
        public readonly string $slug,
        public readonly string $title,
        public readonly ?string $excerpt,
        public readonly string $content,
        public readonly ?string $meta_title,
        public readonly ?string $meta_description,
        public readonly ?string $focus_keyword,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            locale: $data['locale'],
            slug: $data['slug'],
            title: $data['title'],
            excerpt: $data['excerpt'] ?? null,
            content: $data['content'],
            meta_title: $data['meta_title'] ?? null,
            meta_description: $data['meta_description'] ?? null,
            focus_keyword: $data['focus_keyword'] ?? null,
        );
    }
}
