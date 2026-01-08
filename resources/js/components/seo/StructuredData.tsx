import { Head } from '@inertiajs/react';

interface StructuredDataProps {
  data: object;
}

/**
 * Component to inject JSON-LD structured data into the page
 * Used for rich snippets in search results
 */
export default function StructuredData({ data }: StructuredDataProps) {
  return (
    <Head>
      <script type="application/ld+json">
        {JSON.stringify(data)}
      </script>
    </Head>
  );
}

/**
 * Generate Organization structured data
 */
export function generateOrganizationSchema(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'DOCSET',
    url: siteUrl,
    logo: `${siteUrl}/docset.png`,
    description: 'Document data platform for PDFs and images',
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['English', 'Portuguese'],
    },
  };
}

/**
 * Generate SoftwareApplication structured data
 */
export function generateSoftwareSchema(siteUrl: string, locale: string) {
  const descriptions = {
    en: 'DOCSET turns PDFs and images into structured, usable data. Define custom fields, review extracted data, and export or integrate via API to automate recurring document workflows.',
    'pt-BR': 'O DOCSET transforma PDFs e imagens em dados estruturados. Define campos personalizados, revê os dados extraídos e exporta relatórios para automatizar documentos recorrentes via interface ou API.',
    'pt-PT': 'O DOCSET transforma PDFs e imagens em dados estruturados. Define campos personalizados, revê os dados extraídos e exporta relatórios para automatizar documentos recorrentes via interface ou API.',
  };

  return {
    '@context': 'https://schema.org',
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
    description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
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
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '100',
    },
  };
}

/**
 * Generate WebPage structured data
 */
export function generateWebPageSchema(siteUrl: string, title: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description: description,
    url: siteUrl,
    inLanguage: 'en',
    isPartOf: {
      '@type': 'WebSite',
      name: 'DOCSET',
      url: siteUrl,
    },
  };
}

/**
 * Generate BreadcrumbList structured data
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate FAQPage structured data
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
