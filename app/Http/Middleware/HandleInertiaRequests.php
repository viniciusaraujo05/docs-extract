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
        try {
            $quoteString = Inspiring::quotes()->random();
            $parts = str($quoteString)->explode('-');
            $message = trim($parts[0] ?? 'Build something amazing');
            $author = trim($parts[1] ?? 'Laravel');
        } catch (\Exception $e) {
            $message = 'Build something amazing';
            $author = 'Laravel';
        }

        $locale = $request->route('locale') ?? 'en';

        try {
            $seoContent = SeoHelper::getContent($locale);
            $structuredData = SeoHelper::generateStructuredData($locale);
            $alternateLocales = SeoHelper::getAlternateLocales($locale);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('SEO Helper failed in HandleInertiaRequests', [
                'error' => $e->getMessage(),
                'locale' => $locale,
            ]);

            $seoContent = [
                'title' => config('app.name', 'DOCSET'),
                'description' => 'Document processing platform',
                'keywords' => 'documents, AI, extraction',
            ];
            $structuredData = '{}';
            $alternateLocales = [];
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'appUrl' => config('app.url'),
            'quote' => ['message' => $message, 'author' => $author],
            'auth' => [
                'user' => $request->user(),
            ],
            'locale' => $locale,
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
                'structuredData' => $structuredData,
                'alternateLocales' => $alternateLocales,
            ],
        ];
    }
}
