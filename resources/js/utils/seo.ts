export interface SEOContent {
    title: string;
    description: string;
    keywords: string;
    h1: string;
    h2s: string[];
}

export const seoContent = {
    en: {
        title: 'PDF to Excel Converter & Invoice OCR | DocSet',
        description:
            'Turn PDFs into Excel in seconds. No coding required. Extract invoice data, receipts, and IDs automatically with our PDF to Excel converter and invoice OCR software.',
        keywords:
            'invoice data entry automation, receipt scanner excel, PDF invoice to excel, automated invoice processing, expense receipt OCR, KYC document extraction, invoice OCR software',
        h1: 'Stop Wasting Hours Typing Invoice Data',
        h2s: [
            'Turn PDF Invoices into Excel in Seconds',
            'Process Expense Receipts 10x Faster',
            'Extract Data from IDs and Passports for KYC',
            'No Developers Needed • Export to Excel or JSON',
        ],
    },
    'pt-BR': {
        title: 'Conversor PDF para Excel e OCR de Notas | DocSet',
        description:
            'Converta PDFs em Excel em segundos. Sem código. Extraia dados de notas fiscais, recibos e documentos automaticamente com nosso conversor PDF para Excel e software de OCR.',
        keywords:
            'automação nota fiscal, digitação automática nfe, PDF para Excel, OCR de recibos, extração de dados CNH, automação contas a pagar',
        h1: 'Pare de Perder Horas Digitando Notas Fiscais',
        h2s: [
            'Converta Notas Fiscais PDF em Excel em Segundos',
            'Processe Recibos de Despesas 10x Mais Rápido',
            'Extraia Dados de CNH e RG para KYC',
            'Sem Desenvolvedores • Exporte para Excel ou JSON',
        ],
    },
    'pt-PT': {
        title: 'Conversor PDF para Excel e OCR de Faturas | DocSet',
        description:
            'Converta PDFs em Excel em segundos. Sem código. Extraia dados de faturas, recibos e documentos automaticamente com nosso conversor PDF para Excel e software de OCR.',
        keywords:
            'automação faturas, digitalização faturas excel, PDF para Excel, OCR recibos, extração dados cartão cidadão, automação contas a pagar',
        h1: 'Pare de Perder Horas a Digitar Faturas',
        h2s: [
            'Converta Faturas PDF em Excel em Segundos',
            'Processe Recibos de Despesas 10x Mais Rápido',
            'Extraia Dados de Cartões de Cidadão para KYC',
            'Sem Programadores • Exporte para Excel ou JSON',
        ],
    },
};

export function getSEOContent(locale: string): SEOContent {
    if (locale === 'pt-BR' || locale === 'pt') return seoContent['pt-BR'];
    if (locale === 'pt-PT') return seoContent['pt-PT'];
    return seoContent.en;
}

export function generateStructuredData(locale: string) {
    const siteUrl =
        typeof window !== 'undefined'
            ? window.location.origin
            : 'https://docset.com';
    const localeCode =
        locale === 'pt-BR' || locale === 'pt'
            ? 'pt-BR'
            : locale === 'pt-PT'
              ? 'pt-PT'
              : 'en';
    const content = getSEOContent(localeCode);

    return {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebSite',
                '@id': `${siteUrl}/#website`,
                url: siteUrl,
                name: 'DOCSET',
                description: content.description,
                inLanguage: localeCode,
                potentialAction: {
                    '@type': 'SearchAction',
                    target: {
                        '@type': 'EntryPoint',
                        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
                    },
                    'query-input': 'required name=search_term_string',
                },
            },
            {
                '@type': 'Organization',
                '@id': `${siteUrl}/#organization`,
                name: 'DOCSET',
                url: siteUrl,
                logo: {
                    '@type': 'ImageObject',
                    url: `${siteUrl}/docset.png`,
                    width: 512,
                    height: 512,
                },
                sameAs: [],
            },
            {
                '@type': 'WebPage',
                '@id': `${siteUrl}/#webpage`,
                url: siteUrl,
                name: content.title,
                description: content.description,
                inLanguage: localeCode,
                isPartOf: {
                    '@id': `${siteUrl}/#website`,
                },
                about: {
                    '@id': `${siteUrl}/#organization`,
                },
                breadcrumb: {
                    '@id': `${siteUrl}/#breadcrumb`,
                },
            },
            {
                '@type': 'BreadcrumbList',
                '@id': `${siteUrl}/#breadcrumb`,
                itemListElement: [
                    {
                        '@type': 'ListItem',
                        position: 1,
                        name: 'Home',
                        item: siteUrl,
                    },
                ],
            },
            {
                '@type': 'SoftwareApplication',
                name: 'DOCSET',
                applicationCategory: 'BusinessApplication',
                operatingSystem: 'Web',
                offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'USD',
                    description: 'Free plan available',
                },
                description: content.description,
                featureList: [
                    'PDF data extraction',
                    'Image OCR',
                    'Custom field definition',
                    'Manual review interface',
                    'REST API',
                    'JSON export',
                    'CSV export',
                    'Webhook support',
                ],
                screenshot: `${siteUrl}/docset.png`,
            },
        ],
    };
}

export function getAlternateLocales(currentPath: string = '/') {
    const siteUrl =
        typeof window !== 'undefined'
            ? window.location.origin
            : 'https://docset.com';

    // Remove leading slash
    const path = currentPath.replace(/^\/+/, '');

    // Strip out existing locale prefix from path if present
    const pathParts = path.split('/');
    if (
        pathParts.length > 0 &&
        ['en', 'pt', 'pt-pt', 'pt-br'].includes(pathParts[0])
    ) {
        pathParts.shift();
    }
    const cleanPath = pathParts.join('/');
    const suffix = cleanPath ? `/${cleanPath}` : '';

    // Return proper hreflang format with x-default
    return [
        { locale: 'en', hreflang: 'en', url: `${siteUrl}/en${suffix}` },
        { locale: 'pt-BR', hreflang: 'pt-BR', url: `${siteUrl}/pt${suffix}` },
        {
            locale: 'pt-PT',
            hreflang: 'pt-PT',
            url: `${siteUrl}/pt-pt${suffix}`,
        },
        {
            locale: 'x-default',
            hreflang: 'x-default',
            url: `${siteUrl}/en${suffix}`,
        }, // Default to EN
    ];
}
