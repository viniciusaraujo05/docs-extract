export interface SEOContent {
  title: string;
  description: string;
  keywords: string;
  h1: string;
  h2s: string[];
}

export const seoContent = {
  en: {
    title: 'DOCSET – Document Data Platform for PDFs and Images',
    description: 'DOCSET turns PDFs and images into structured, usable data. Define custom fields, review extracted data, and export or integrate via API to automate recurring document workflows.',
    keywords: 'PDF data extraction, extract data from PDF, PDF to structured data, document data extraction software, automated document processing, PDF OCR API, document parsing API, invoice data extraction, receipt OCR software, recurring document automation, PDF to Excel automation, extract custom fields from PDF, review extracted data before export, PDF data extraction with custom templates, document workflow automation tool, alternative to Docparser, zonal OCR API, Docparser alternative, best PDF extraction tool for developers, affordable document OCR API, PDF extraction REST API, document OCR webhook, structured data from images API, PDF parsing JSON response, batch PDF processing API',
    h1: 'Document data platform for recurring PDFs and images',
    h2s: [
      'Turn unstructured documents into reliable data',
      'Custom data fields, instant review, and flexible exports',
      'Automate recurring document workflows with API or UI',
      'Built for recurring documents',
      'Simple REST API with JSON responses',
      'Privacy and security first',
    ],
  },
  'pt-BR': {
    title: 'DOCSET – Plataforma de dados de documentos para PDFs e imagens',
    description: 'O DOCSET transforma PDFs e imagens em dados estruturados. Define campos personalizados, revê os dados extraídos e exporta relatórios para automatizar documentos recorrentes via interface ou API.',
    keywords: 'plataforma de dados de documentos, extrair dados de PDF, extração de dados de documentos, software de extração de PDF, processar documentos automaticamente, PDF para dados estruturados, API de extração de PDF, OCR para faturas, automatizar recibos, extração de dados de contratos, PDF para Excel automático, extrair campos personalizados de PDF, revisar dados extraídos antes de guardar, alternativa ao Docparser, API de OCR para documentos recorrentes, API REST de extração de PDF, processar PDFs em lote, OCR com resposta JSON',
    h1: 'Plataforma de dados de documentos para PDFs e imagens',
    h2s: [
      'Transforma documentos recorrentes em dados fiáveis',
      'Campos personalizados, revisão rápida e exportação flexível',
      'Elimina o trabalho manual em PDFs com uma interface simples ou API',
      'Feito para documentos recorrentes',
      'API REST simples com respostas JSON',
      'Privacidade e segurança em primeiro lugar',
    ],
  },
  'pt-PT': {
    title: 'DOCSET – Plataforma de dados de documentos para PDFs e imagens',
    description: 'O DOCSET transforma PDFs e imagens em dados estruturados. Define campos personalizados, revê os dados extraídos e exporta relatórios para automatizar documentos recorrentes via interface ou API.',
    keywords: 'plataforma de dados de documentos, extrair dados de PDF, extração de dados de documentos, software de extração de PDF, processar documentos automaticamente, PDF para dados estruturados, API de extração de PDF, OCR para faturas, automatizar recibos, extração de dados de contratos, PDF para Excel automático, extrair campos personalizados de PDF, revisar dados extraídos antes de guardar, alternativa ao Docparser, API de OCR para documentos recorrentes, API REST de extração de PDF, processar PDFs em lote, OCR com resposta JSON',
    h1: 'Plataforma de dados de documentos para PDFs e imagens',
    h2s: [
      'Transforma documentos recorrentes em dados fiáveis',
      'Campos personalizados, revisão rápida e exportação flexível',
      'Elimina o trabalho manual em PDFs com uma interface simples ou API',
      'Feito para documentos recorrentes',
      'API REST simples com respostas JSON',
      'Privacidade e segurança em primeiro lugar',
    ],
  },
};

export function getSEOContent(locale: string): SEOContent {
  if (locale === 'pt-BR' || locale === 'pt') return seoContent['pt-BR'];
  if (locale === 'pt-PT') return seoContent['pt-PT'];
  return seoContent.en;
}

export function generateStructuredData(locale: string) {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://docset.com';
  const localeCode = locale === 'pt-BR' || locale === 'pt' ? 'pt-BR' : locale === 'pt-PT' ? 'pt-PT' : 'en';
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

export function getAlternateLocales(currentLocale: string) {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://docset.com';
  const locales = [
    { locale: 'en', url: `${siteUrl}/en` },
    { locale: 'pt-BR', url: `${siteUrl}/pt` },
    { locale: 'pt-PT', url: `${siteUrl}/pt` },
  ];
  
  return locales.filter(l => l.locale !== currentLocale);
}
