<?php

namespace App\Contracts;

use App\DataTransferObjects\IncomingBlogPostDTO;
use App\Models\BlogPost;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface BlogRepositoryInterface
{
    /**
     * Create or update a blog post from the incoming DTO.
     */
    public function upsertFromDto(IncomingBlogPostDTO $dto): BlogPost;

    /**
     * Get a blog post by its locale and slug.
     */
    public function getBySlug(string $locale, string $slug): ?BlogPost;

    /**
     * Get published posts paginated by locale.
     */
    public function getPublishedPaginated(string $locale, int $perPage = 10): LengthAwarePaginator;
}
