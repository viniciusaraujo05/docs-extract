<?php

namespace App\Http\Middleware;

use App\Helpers\SeoHelper;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $locale = $request->route('locale') ?? 'en';
        $seoContent = SeoHelper::getContent($locale);

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'appUrl' => config('app.url'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'newClient' => $request->session()->get('newClient'),
            ],
            'seo' => [
                'title' => $seoContent['title'],
                'description' => $seoContent['description'],
                'keywords' => $seoContent['keywords'],
                'locale' => $locale,
                'url' => $request->url(),
                'canonical' => $request->url(),
                'ogImage' => config('app.url').'/docset.png',
                'structuredData' => SeoHelper::generateStructuredData($locale),
                'alternateLocales' => SeoHelper::getAlternateLocales($locale),
            ],
        ];
    }
}
