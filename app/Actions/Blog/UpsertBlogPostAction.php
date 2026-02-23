<?php

namespace App\Actions\Blog;

use App\Contracts\BlogRepositoryInterface;
use App\DataTransferObjects\IncomingBlogPostDTO;
use App\Models\BlogPost;

class UpsertBlogPostAction
{
    public function __construct(
        private readonly BlogRepositoryInterface $repository
    ) {}

    public function execute(IncomingBlogPostDTO $dto): BlogPost
    {
        return $this->repository->upsertFromDto($dto);
    }
}
