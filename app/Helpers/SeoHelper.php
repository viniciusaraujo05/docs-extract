<?php

namespace App\Helpers;

class SeoHelper
{
    public static function getContent(string $locale = 'en'): array
    {
        $content = [
            'en' => [
                'title' => 'DOCSET – Document Data Platform for PDFs and Images',
                'description' => 'DOCSET turns PDFs and images into structured, usable data. Define custom fields, review extracted data, and export or integrate via API to automate recurring document workflows.',
                'keywords' => 'PDF data extraction, extract data from PDF, PDF to structured data, document data extraction software, automated document processing, PDF OCR API, document parsing API, invoice data extraction, receipt OCR software, recurring document automation, PDF to Excel automation, extract custom fields from PDF, review extracted data before export, PDF data extraction with custom templates, document workflow automation tool, alternative to Docparser, zonal OCR API, Docparser alternative, best PDF extraction tool for developers, affordable document OCR API, PDF extraction REST API, document OCR webhook, structured data from images API, PDF parsing JSON response, batch PDF processing API',
            ],
            'pt-BR' => [
                'title' => 'DOCSET – Plataforma de dados de documentos para PDFs e imagens',
                'description' => 'O DOCSET transforma PDFs e imagens em dados estruturados. Define campos personalizados, revê os dados extraídos e exporta relatórios para automatizar documentos recorrentes via interface ou API.',
                'keywords' => 'plataforma de dados de documentos, extrair dados de PDF, extração de dados de documentos, software de extração de PDF, processar documentos automaticamente, PDF para dados estruturados, API de extração de PDF, OCR para faturas, automatizar recibos, extração de dados de contratos, PDF para Excel automático, extrair campos personalizados de PDF, revisar dados extraídos antes de guardar, alternativa ao Docparser, API de OCR para documentos recorrentes, API REST de extração de PDF, processar PDFs em lote, OCR com resposta JSON',
            ],
            'pt-PT' => [
                'title' => 'DOCSET – Plataforma de dados de documentos para PDFs e imagens',
                'description' => 'O DOCSET transforma PDFs e imagens em dados estruturados. Define campos personalizados, revê os dados extraídos e exporta relatórios para automatizar documentos recorrentes via interface ou API.',
                'keywords' => 'plataforma de dados de documentos, extrair dados de PDF, extração de dados de documentos, software de extração de PDF, processar documentos automaticamente, PDF para dados estruturados, API de extração de PDF, OCR para faturas, automatizar recibos, extração de dados de contratos, PDF para Excel automático, extrair campos personalizados de PDF, revisar dados extraídos antes de guardar, alternativa ao Docparser, API de OCR para documentos recorrentes, API REST de extração de PDF, processar PDFs em lote, OCR com resposta JSON',
            ],
        ];

        $localeKey = $locale === 'pt' ? 'pt-BR' : ($locale === 'pt-PT' ? 'pt-PT' : 'en');

        return $content[$localeKey] ?? $content['en'];
    }

    public static function generateStructuredData(string $locale = 'en'): string
    {
        $siteUrl = config('app.url', 'https://docset.com');
        $localeCode = $locale === 'pt' ? 'pt-BR' : ($locale === 'pt-PT' ? 'pt-PT' : 'en');
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
    }

    public static function getAlternateLocales(string $currentLocale): array
    {
        $siteUrl = config('app.url', 'https://docset.com');
        $locales = [
            ['locale' => 'en', 'url' => $siteUrl.'/en'],
            ['locale' => 'pt-BR', 'url' => $siteUrl.'/pt'],
            ['locale' => 'pt-PT', 'url' => $siteUrl.'/pt'],
        ];

        return array_filter($locales, fn ($l) => $l['locale'] !== $currentLocale);
    }
}
