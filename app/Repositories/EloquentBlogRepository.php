<?php

namespace App\Repositories;

use App\Contracts\BlogRepositoryInterface;
use App\DataTransferObjects\IncomingBlogPostDTO;
use App\Models\BlogPost;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class EloquentBlogRepository implements BlogRepositoryInterface
{
    public function upsertFromDto(IncomingBlogPostDTO $dto): BlogPost
    {
        $post = BlogPost::updateOrCreate(
            ['external_id' => $dto->external_id],
            [
                'author_name' => $dto->author_name,
                'published_at' => $dto->published_at,
                'status' => $dto->status,
                'cover_image_url' => $dto->cover_image_url,
            ]
        );

        foreach ($dto->translations as $translationDto) {
            $post->translations()->updateOrCreate(
                ['locale' => $translationDto->locale],
                [
                    'slug' => $translationDto->slug,
                    'title' => $translationDto->title,
                    'excerpt' => $translationDto->excerpt,
                    'content' => $translationDto->content,
                    'meta_title' => $translationDto->meta_title,
                    'meta_description' => $translationDto->meta_description,
                    'focus_keyword' => $translationDto->focus_keyword,
                ]
            );
        }

        return $post;
    }

    public function getBySlug(string $locale, string $slug): ?BlogPost
    {
        return BlogPost::with(['translation' => fn ($q) => $q->where('locale', $locale)])
            ->whereHas('translations', fn ($q) => $q->where('locale', $locale)->where('slug', $slug))
            ->where('status', 'published')
            ->first();
    }

    public function getPublishedPaginated(string $locale, int $perPage = 10): LengthAwarePaginator
    {
        return BlogPost::with(['translation' => fn ($q) => $q->where('locale', $locale)])
            ->whereHas('translations', fn ($q) => $q->where('locale', $locale))
            ->where('status', 'published')
            ->orderByDesc('published_at')
            ->paginate($perPage);
    }
}
