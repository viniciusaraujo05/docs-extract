<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;

class ApiDocsController extends Controller
{
    public function show(string $locale): Response|RedirectResponse
    {
        $incomingLocale = strtolower($locale);

        if (in_array($incomingLocale, ['pt-br', 'pt-pt'], true)) {
            return redirect()->route('docs.api.v1', ['locale' => 'pt'], 301);
        }

        if (! in_array($incomingLocale, ['en', 'pt'], true)) {
            abort(404);
        }

        $normalizedLocale = $incomingLocale;
        $docsPath = base_path("docs/public/API_V1_{$normalizedLocale}.md");

        if (! file_exists($docsPath)) {
            $docsPath = base_path('docs/public/API_V1_en.md');
        }

        $markdown = file_get_contents($docsPath) ?: '';

        return Inertia::render('Docs/ApiV1', [
            'locale' => $normalizedLocale,
            'markdown' => $markdown,
            'lastUpdated' => date('Y-m-d', filemtime($docsPath)),
        ]);
    }
}
