<?php

namespace App\Helpers;

class SeoHelper
{
    public static function getContent(string $locale = 'en'): array
    {
        $content = [
            'en' => [
                'title' => 'Stop Typing Invoices & Receipts | PDF to Excel Converter - DocSet',
                'description' => 'Turn PDFs into Excel in seconds. No coding required. Extract invoice data, receipts, and IDs automatically with our PDF to Excel converter and invoice OCR software.',
                'keywords' => 'invoice data entry automation, receipt scanner excel, PDF invoice to excel, automated invoice processing, expense receipt OCR, KYC document extraction, invoice OCR software, PDF to Excel converter, stop typing invoices, automate data entry, receipt scanner, ID verification OCR',
            ],
            'pt-BR' => [
                'title' => 'Pare de Digitar Notas Fiscais | Conversor PDF para Excel - DocSet',
                'description' => 'Converta PDFs em Excel em segundos. Sem código. Extraia dados de notas fiscais, recibos e documentos automaticamente com nosso conversor PDF para Excel e software de OCR.',
                'keywords' => 'automação nota fiscal, digitação automática nfe, PDF para Excel, OCR de recibos, extração de dados CNH, automação contas a pagar, parar de digitar notas fiscais, automatizar entrada de dados, scanner de recibos',
            ],
            'pt-PT' => [
                'title' => 'Pare de Digitar Faturas | Conversor PDF para Excel - DocSet',
                'description' => 'Converta PDFs em Excel em segundos. Sem código. Extraia dados de faturas, recibos e documentos automaticamente com nosso conversor PDF para Excel e software de OCR.',
                'keywords' => 'automação faturas, digitalização faturas excel, PDF para Excel, OCR recibos, extração dados cartão cidadão, automação contas a pagar, parar de digitar faturas, automatizar introdução dados',
            ],
        ];

        $localeKey = $locale === 'pt' ? 'pt-BR' : ($locale === 'pt-PT' ? 'pt-PT' : 'en');

        return $content[$localeKey] ?? $content['en'];
    }

    public static function generateStructuredData(string $locale = 'en'): string
    {
        return \Illuminate\Support\Facades\Cache::remember("seo_structured_data_{$locale}", now()->addDay(), function () use ($locale) {
            $siteUrl = config('app.url', 'https://docset.com');
            $localeCode = $locale === 'pt' ? 'pt-BR' : ($locale === 'pt-PT' ? 'pt-PT' : 'en');
            $content = self::getContent($localeCode);

            $data = [
                '@context' => 'https://schema.org',
                '@graph' => [
                    [
                        '@type' => 'WebSite',
                        '@id' => $siteUrl . '/#website',
                        'url' => $siteUrl,
                        'name' => 'DOCSET',
                        'description' => $content['description'],
                        'inLanguage' => $localeCode,
                        'potentialAction' => [
                            '@type' => 'SearchAction',
                            'target' => [
                                '@type' => 'EntryPoint',
                                'urlTemplate' => $siteUrl . '/search?q={search_term_string}',
                            ],
                            'query-input' => 'required name=search_term_string',
                        ],
                    ],
                    [
                        '@type' => 'Organization',
                        '@id' => $siteUrl . '/#organization',
                        'name' => 'DOCSET',
                        'url' => $siteUrl,
                        'logo' => [
                            '@type' => 'ImageObject',
                            'url' => $siteUrl . '/docset.png',
                            'width' => 512,
                            'height' => 512,
                        ],
                        'sameAs' => [],
                    ],
                    [
                        '@type' => 'WebPage',
                        '@id' => $siteUrl . '/#webpage',
                        'url' => $siteUrl,
                        'name' => $content['title'],
                        'description' => $content['description'],
                        'inLanguage' => $localeCode,
                        'isPartOf' => [
                            '@id' => $siteUrl . '/#website',
                        ],
                        'about' => [
                            '@id' => $siteUrl . '/#organization',
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
                        'screenshot' => $siteUrl . '/docset.png',
                    ],
                ],
            ];

            return json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        });
    }

    public static function getAlternateLocales(string $currentLocale): array
    {
        $siteUrl = config('app.url', 'https://docset.com');
        // Return all locales including x-default for proper hreflang
        return [
            ['locale' => 'en', 'url' => $siteUrl . '/en'],
            ['locale' => 'pt-BR', 'url' => $siteUrl . '/pt'],
            ['locale' => 'pt-PT', 'url' => $siteUrl . '/pt-pt'],
            ['locale' => 'x-default', 'url' => $siteUrl . '/en'],
        ];
    }
}
