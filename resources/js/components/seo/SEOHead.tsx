import { Head, usePage } from '@inertiajs/react';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  locale?: string;
  alternateLocales?: Array<{ locale: string; url: string }>;
  structuredData?: object;
  noindex?: boolean;
}

export default function SEOHead({
  title,
  description,
  keywords,
  canonical,
  ogImage = '/docset.png',
  ogType = 'website',
  locale = 'en',
  alternateLocales = [],
  structuredData,
  noindex = false,
}: SEOHeadProps) {
  const { url: pageUrl, props } = usePage<{ appUrl?: string }>();
  const baseUrlFromProps = props.appUrl;
  const siteUrl =
    baseUrlFromProps ||
    (typeof window !== 'undefined' ? window.location.origin : '') ||
    'https://docset.com';
  const path =
    typeof window !== 'undefined'
      ? window.location.pathname + window.location.search
      : pageUrl || '/';
  const fullTitle = title.includes('DOCSET') ? title : `${title} | DOCSET`;
  const fullCanonical = canonical || `${siteUrl}${path}`;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullCanonical} />
      
      {/* Alternate Language Links */}
      {alternateLocales.map(({ locale: altLocale, url }) => (
        <link key={altLocale} rel="alternate" hrefLang={altLocale} href={url} />
      ))}
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:locale" content={locale.replace('-', '_')} />
      <meta property="og:site_name" content="DOCSET" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />
      
      {/* Additional SEO Meta Tags */}
      <meta name="author" content="DOCSET" />
      <meta name="language" content={locale} />
      <meta httpEquiv="content-language" content={locale} />
      
      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Head>
  );
}
