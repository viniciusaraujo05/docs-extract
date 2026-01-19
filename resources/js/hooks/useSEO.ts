import { useEffect } from 'react';
import { router } from '@inertiajs/react';

/**
 * Custom hook for SEO utilities
 */
export function useSEO() {
  /**
   * Track page views (integrate with analytics)
   */
  const trackPageView = (url: string) => {
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: url,
      });
    }

    // Google Tag Manager
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'pageview',
        page: url,
      });
    }
  };

  /**
   * Update canonical URL dynamically
   */
  const updateCanonical = (url: string) => {
    if (typeof window === 'undefined') return;

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
  };

  /**
   * Preload critical resources
   */
  const preloadResource = (href: string, as: string, type?: string) => {
    if (typeof window === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (type) link.type = type;
    document.head.appendChild(link);
  };

  /**
   * Add breadcrumb schema dynamically
   */
  const addBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => {
    if (typeof window === 'undefined') return;

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };

    let script = document.querySelector('script[data-schema="breadcrumb"]');
    if (!script) {
      script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-schema', 'breadcrumb');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);
  };

  return {
    trackPageView,
    updateCanonical,
    preloadResource,
    addBreadcrumbSchema,
  };
}

/**
 * Hook to track page views on route changes
 */
export function usePageViewTracking() {
  useEffect(() => {
    const handlePageView = () => {
      if (typeof window === 'undefined') return;
      const url = window.location.pathname + window.location.search;
      
      // Track with Google Analytics
      if ((window as any).gtag) {
        (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
          page_path: url,
        });
      }

      // Track with Google Tag Manager
      if ((window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: 'pageview',
          page: url,
        });
      }
    };

    // Track initial page view
    handlePageView();

    // Track on Inertia navigation
    const removeListener = router.on('navigate', handlePageView);

    return () => {
      removeListener();
    };
  }, []);
}

/**
 * Generate meta description from content
 */
export function generateMetaDescription(content: string, maxLength: number = 160): string {
  // Remove HTML tags
  const text = content.replace(/<[^>]*>/g, '');
  
  // Trim and limit length
  if (text.length <= maxLength) {
    return text.trim();
  }
  
  // Cut at last complete word before maxLength
  const trimmed = text.substring(0, maxLength);
  const lastSpace = trimmed.lastIndexOf(' ');
  
  return trimmed.substring(0, lastSpace) + '...';
}

/**
 * Generate slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
}

/**
 * Extract keywords from content
 */
export function extractKeywords(content: string, count: number = 10): string[] {
  // Remove HTML tags and special characters
  const text = content
    .replace(/<[^>]*>/g, '')
    .replace(/[^\w\s]/g, ' ')
    .toLowerCase();

  // Split into words
  const words = text.split(/\s+/).filter(word => word.length > 3);

  // Count word frequency
  const frequency: Record<string, number> = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  // Sort by frequency and return top keywords
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([word]) => word);
}
