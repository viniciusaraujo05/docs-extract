<?php

namespace App\Actions\Blog;

use App\Contracts\BlogRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class GetPublishedPostsAction
{
    public function __construct(
        private readonly BlogRepositoryInterface $repository
    ) {}

    public function execute(string $locale, int $perPage = 10): LengthAwarePaginator
    {
        return $this->repository->getPublishedPaginated($locale, $perPage);
    }
}
