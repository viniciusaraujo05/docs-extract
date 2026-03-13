<?php

namespace App\Helpers;

class SeoHelper
{
    public static function localeTag(string $locale = 'en'): string
    {
        return match (strtolower($locale)) {
            'pt-br' => 'pt-BR',
            'pt-pt', 'pt_pt' => 'pt-PT',
            'pt' => 'pt',
            default => 'en',
        };
    }

    public static function getContent(string $locale = 'en'): array
    {
        $content = [
            'en' => [
                'title' => 'PDF to Excel & Invoice OCR | DOCSET',
                'description' => 'Convert PDFs to Excel in seconds and extract invoice, receipt, and ID data automatically. No code required.',
                'keywords' => 'invoice data entry automation, receipt scanner excel, PDF invoice to excel, automated invoice processing, expense receipt OCR, KYC document extraction, invoice OCR software, PDF to Excel converter, stop typing invoices, automate data entry, receipt scanner, ID verification OCR',
            ],
            'pt-BR' => [
                'title' => 'Conversor PDF para Excel e OCR de Notas | DOCSET',
                'description' => 'Converta PDFs em Excel em segundos e extraia dados de notas, recibos e documentos automaticamente. Sem código.',
                'keywords' => 'automação nota fiscal, digitação automática nfe, PDF para Excel, OCR de recibos, extração de dados CNH, automação contas a pagar, parar de digitar notas fiscais, automatizar entrada de dados, scanner de recibos',
            ],
            'pt-PT' => [
                'title' => 'Conversor PDF para Excel e OCR de Faturas | DOCSET',
                'description' => 'Converta PDFs em Excel em segundos e extraia dados de faturas, recibos e documentos automaticamente. Sem código.',
                'keywords' => 'automação faturas, digitalização faturas excel, PDF para Excel, OCR recibos, extração dados cartão cidadão, automação contas a pagar, parar de digitar faturas, automatizar introdução dados',
            ],
        ];

        $normalizedLocale = strtolower($locale);
        $localeKey = match ($normalizedLocale) {
            'pt', 'pt-br' => 'pt-BR',
            'pt-pt', 'pt_pt' => 'pt-PT',
            default => 'en',
        };

        return $content[$localeKey] ?? $content['en'];
    }

    public static function buildLocalizedPageSeo(
        string $locale,
        string $path,
        string $title,
        string $description,
        array $overrides = []
    ): array {
        $siteUrl = rtrim(config('app.url', 'https://docset.app'), '/');
        $normalizedLocale = strtolower($locale);
        $cleanPath = trim($path, '/');
        $localizedPath = $normalizedLocale.($cleanPath !== '' ? '/'.$cleanPath : '');
        $canonical = $siteUrl.'/'.$localizedPath;

        return array_filter([
            'title' => $title,
            'description' => $description,
            'keywords' => $overrides['keywords'] ?? null,
            'locale' => self::localeTag($normalizedLocale),
            'url' => $canonical,
            'canonical' => $canonical,
            'ogImage' => $overrides['ogImage'] ?? $siteUrl.'/docset.png',
            'structuredData' => $overrides['structuredData'] ?? null,
            'alternateLocales' => $overrides['alternateLocales']
                ?? self::getAlternateLocales($normalizedLocale, $localizedPath),
            'robots' => $overrides['robots'] ?? null,
        ], static fn ($value) => $value !== null && $value !== '');
    }

    public static function generateStructuredData(string $locale = 'en'): string
    {
        return \Illuminate\Support\Facades\Cache::remember("seo_structured_data_{$locale}", now()->addDay(), function () use ($locale) {
            $siteUrl = config('app.url', 'https://docset.com');
            $normalizedLocale = strtolower($locale);
            $localeCode = match ($normalizedLocale) {
                'pt', 'pt-br' => 'pt-BR',
                'pt-pt', 'pt_pt' => 'pt-PT',
                default => 'en',
            };
            $content = self::getContent($localeCode);

            $data = [
                '@context' => 'https://schema.org',
                '@graph' => [
                    [
                        '@type' => 'WebSite',
                        '@id' => $siteUrl.'/#website',
                        'url' => $siteUrl,
                        'name' => 'DOCSET',
                        'description' => $content['description'],
                        'inLanguage' => $localeCode,
                        'potentialAction' => [
                            '@type' => 'SearchAction',
                            'target' => [
                                '@type' => 'EntryPoint',
                                'urlTemplate' => $siteUrl.'/search?q={search_term_string}',
                            ],
                            'query-input' => 'required name=search_term_string',
                        ],
                    ],
                    [
                        '@type' => 'Organization',
                        '@id' => $siteUrl.'/#organization',
                        'name' => 'DOCSET',
                        'url' => $siteUrl,
                        'logo' => [
                            '@type' => 'ImageObject',
                            'url' => $siteUrl.'/docset.png',
                            'width' => 512,
                            'height' => 512,
                        ],
                        'sameAs' => [],
                    ],
                    [
                        '@type' => 'WebPage',
                        '@id' => $siteUrl.'/#webpage',
                        'url' => $siteUrl,
                        'name' => $content['title'],
                        'description' => $content['description'],
                        'inLanguage' => $localeCode,
                        'isPartOf' => [
                            '@id' => $siteUrl.'/#website',
                        ],
                        'about' => [
                            '@id' => $siteUrl.'/#organization',
                        ],
                    ],
                    [
                        '@type' => 'SoftwareApplication',
                        'name' => 'DOCSET',
                        'applicationCategory' => 'BusinessApplication',
                        'operatingSystem' => 'Web',
                        'offers' => [
                            '@type' => 'Offer',
                            'price' => '0',
                            'priceCurrency' => 'USD',
                            'description' => 'Free plan available',
                        ],
                        'description' => $content['description'],
                        'featureList' => [
                            'PDF data extraction',
                            'Image OCR',
                            'Custom field definition',
                            'Manual review interface',
                            'REST API',
                            'JSON export',
                            'CSV export',
                            'Webhook support',
                        ],
                        'screenshot' => $siteUrl.'/docset.png',
                    ],
                ],
            ];

            return json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        });
    }

    public static function getAlternateLocales(string $currentLocale, string $path = ''): array
    {
        $siteUrl = rtrim(config('app.url', 'https://docset.com'), '/');

        // Remove leading slash from path
        $path = ltrim($path, '/');

        // Strip out existing locale prefix from path if present (e.g., 'en/blog' -> 'blog')
        $pathParts = explode('/', $path);
        if (count($pathParts) > 0 && in_array($pathParts[0], ['en', 'pt', 'pt-pt', 'pt-br'])) {
            array_shift($pathParts);
        }
        $cleanPath = implode('/', $pathParts);
        $suffix = $cleanPath ? '/'.$cleanPath : '';

        // Return supported locales (avoid duplicates for regional variants on same URL)
        return [
            ['locale' => 'en', 'url' => $siteUrl.'/en'.$suffix],
            ['locale' => 'pt', 'url' => $siteUrl.'/pt'.$suffix],
            ['locale' => 'x-default', 'url' => $siteUrl.'/en'.$suffix],
        ];
    }

    /**
     * @param  array<string, string>  $localePaths
     * @return array<int, array{locale: string, url: string}>
     */
    public static function buildAlternateLocales(array $localePaths, string $defaultLocale = 'en'): array
    {
        $siteUrl = rtrim(config('app.url', 'https://docset.com'), '/');
        $alternates = [];

        foreach ($localePaths as $locale => $path) {
            $cleanPath = trim($path, '/');
            $alternates[] = [
                'locale' => $locale,
                'url' => $siteUrl.($cleanPath === '' ? '' : '/'.$cleanPath),
            ];
        }

        if (! array_key_exists('x-default', $localePaths) && isset($localePaths[$defaultLocale])) {
            $cleanPath = trim($localePaths[$defaultLocale], '/');
            $alternates[] = [
                'locale' => 'x-default',
                'url' => $siteUrl.($cleanPath === '' ? '' : '/'.$cleanPath),
            ];
        }

        return $alternates;
    }
}
