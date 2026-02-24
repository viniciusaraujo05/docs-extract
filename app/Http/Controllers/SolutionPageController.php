<?php

namespace App\Http\Controllers;

use App\Services\SolutionPageService;
use Inertia\Inertia;

class SolutionPageController extends Controller
{
    public function __construct(private readonly SolutionPageService $solutionPageService) {}

    public function show(string $locale, string $slug)
    {
        $normalizedLocale = strtolower($locale);

        if (! in_array($normalizedLocale, ['en', 'pt', 'pt-br', 'pt-pt'], true)) {
            abort(404);
        }

        if ($normalizedLocale === 'pt') {
            return redirect()->route('solutions.show', [
                'locale' => 'pt-pt',
                'slug' => $slug,
            ], 301);
        }

        $page = $this->solutionPageService->find($slug, $normalizedLocale);

        if (! $page) {
            abort(404);
        }

        $baseUrl = rtrim((string) config('app.url'), '/');
        $canonical = "{$baseUrl}/{$normalizedLocale}/{$slug}";
        $structuredData = $this->solutionPageService->buildStructuredData($page, $canonical, $normalizedLocale);
        $seoLocale = $normalizedLocale === 'pt-br' ? 'pt-BR' : ($normalizedLocale === 'pt-pt' ? 'pt-PT' : 'en');
        $alternateLocales = [
            ['locale' => 'en', 'url' => "{$baseUrl}/en/{$slug}"],
            ['locale' => 'pt-BR', 'url' => "{$baseUrl}/pt-br/{$slug}"],
            ['locale' => 'pt-PT', 'url' => "{$baseUrl}/pt-pt/{$slug}"],
            ['locale' => 'x-default', 'url' => "{$baseUrl}/en/{$slug}"],
        ];

        return Inertia::render('Solutions/Show', [
            'locale' => $normalizedLocale,
            'page' => $page,
            'seo' => [
                'title' => $page['title'],
                'description' => $page['description'],
                'keywords' => implode(', ', [
                    str_replace('-', ' ', $slug),
                    'invoice ocr',
                    'receipt ocr',
                    'pdf to excel',
                    'ocr api',
                    'invoice parser',
                    'document extraction',
                ]),
                'locale' => $seoLocale,
                'url' => $canonical,
                'canonical' => $canonical,
                'ogImage' => $baseUrl.'/docset.png',
                'structuredData' => json_encode($structuredData, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                'alternateLocales' => $alternateLocales,
            ],
        ]);
    }
}
