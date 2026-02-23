<?php

namespace App\Actions\Blog;

use App\Contracts\BlogRepositoryInterface;
use App\Models\BlogPost;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class GetPostForDisplayAction
{
    public function __construct(
        private readonly BlogRepositoryInterface $repository
    ) {}

    public function execute(string $locale, string $slug): BlogPost
    {
        $post = $this->repository->getBySlug($locale, $slug);

        if (! $post) {
            throw new NotFoundHttpException('Post not found.');
        }

        return $post;
    }
}
