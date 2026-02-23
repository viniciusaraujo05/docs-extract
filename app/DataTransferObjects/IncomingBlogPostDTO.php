<?php

namespace App\DataTransferObjects;

use Illuminate\Http\Request;

class IncomingBlogPostDTO
{
    /**
     * @param  IncomingBlogPostTranslationDTO[]  $translations
     */
    public function __construct(
        public readonly string $external_id,
        public readonly ?string $author_name,
        public readonly ?\Carbon\Carbon $published_at,
        public readonly string $status,
        public readonly ?string $cover_image_url,
        public readonly array $translations,
    ) {}

    public static function fromRequest(Request $request): self
    {
        $translations = array_map(
            fn (array $t) => IncomingBlogPostTranslationDTO::fromArray($t),
            $request->input('translations', [])
        );

        return new self(
            external_id: $request->input('external_id'),
            author_name: $request->input('author_name'),
            published_at: $request->filled('published_at') ? \Carbon\Carbon::parse($request->input('published_at')) : null,
            status: $request->input('status', 'draft'),
            cover_image_url: $request->input('cover_image_url'),
            translations: $translations,
        );
    }
}
