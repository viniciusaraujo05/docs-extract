<?php

namespace App\Http\Controllers;

use App\Actions\Blog\GetPostForDisplayAction;
use App\Actions\Blog\GetPublishedPostsAction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BlogController extends Controller
{
    public function index(string $locale, Request $request, GetPublishedPostsAction $action)
    {
        $posts = $action->execute($locale, 10);

        return Inertia::render('Blog/Index', [
            'posts' => $posts,
            'locale' => $locale,
        ]);
    }

    public function show(string $locale, string $slug, GetPostForDisplayAction $action, GetPublishedPostsAction $listAction)
    {
        $post = $action->execute($locale, $slug);
        $latestPosts = $listAction->execute($locale, 5); // get 5 recent to show on sidebar

        return Inertia::render('Blog/Show', [
            'post' => $post,
            'latestPosts' => $latestPosts,
            'locale' => $locale,
        ]);
    }
}
