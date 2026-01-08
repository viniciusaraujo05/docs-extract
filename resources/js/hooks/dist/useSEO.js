"use strict";
exports.__esModule = true;
exports.extractKeywords = exports.generateSlug = exports.generateMetaDescription = exports.usePageViewTracking = exports.useSEO = void 0;
var react_1 = require("react");
var react_2 = require("@inertiajs/react");
/**
 * Custom hook for SEO utilities
 */
function useSEO() {
    /**
     * Track page views (integrate with analytics)
     */
    var trackPageView = function (url) {
        // Google Analytics 4
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('config', 'GA_MEASUREMENT_ID', {
                page_path: url
            });
        }
        // Google Tag Manager
        if (typeof window !== 'undefined' && window.dataLayer) {
            window.dataLayer.push({
                event: 'pageview',
                page: url
            });
        }
    };
    /**
     * Update canonical URL dynamically
     */
    var updateCanonical = function (url) {
        if (typeof window === 'undefined')
            return;
        var canonical = document.querySelector('link[rel="canonical"]');
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
    var preloadResource = function (href, as, type) {
        if (typeof window === 'undefined')
            return;
        var link = document.createElement('link');
        link.rel = 'preload';
        link.href = href;
        link.as = as;
        if (type)
            link.type = type;
        document.head.appendChild(link);
    };
    /**
     * Add breadcrumb schema dynamically
     */
    var addBreadcrumbSchema = function (items) {
        if (typeof window === 'undefined')
            return;
        var schema = {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: items.map(function (item, index) { return ({
                '@type': 'ListItem',
                position: index + 1,
                name: item.name,
                item: item.url
            }); })
        };
        var script = document.querySelector('script[data-schema="breadcrumb"]');
        if (!script) {
            script = document.createElement('script');
            script.setAttribute('type', 'application/ld+json');
            script.setAttribute('data-schema', 'breadcrumb');
            document.head.appendChild(script);
        }
        script.textContent = JSON.stringify(schema);
    };
    return {
        trackPageView: trackPageView,
        updateCanonical: updateCanonical,
        preloadResource: preloadResource,
        addBreadcrumbSchema: addBreadcrumbSchema
    };
}
exports.useSEO = useSEO;
/**
 * Hook to track page views on route changes
 */
function usePageViewTracking() {
    react_1.useEffect(function () {
        var handlePageView = function () {
            var url = window.location.pathname + window.location.search;
            // Track with Google Analytics
            if (window.gtag) {
                window.gtag('config', 'GA_MEASUREMENT_ID', {
                    page_path: url
                });
            }
            // Track with Google Tag Manager
            if (window.dataLayer) {
                window.dataLayer.push({
                    event: 'pageview',
                    page: url
                });
            }
        };
        // Track initial page view
        handlePageView();
        // Track on Inertia navigation
        var removeListener = react_2.router.on('navigate', handlePageView);
        return function () {
            removeListener();
        };
    }, []);
}
exports.usePageViewTracking = usePageViewTracking;
/**
 * Generate meta description from content
 */
function generateMetaDescription(content, maxLength) {
    if (maxLength === void 0) { maxLength = 160; }
    // Remove HTML tags
    var text = content.replace(/<[^>]*>/g, '');
    // Trim and limit length
    if (text.length <= maxLength) {
        return text.trim();
    }
    // Cut at last complete word before maxLength
    var trimmed = text.substring(0, maxLength);
    var lastSpace = trimmed.lastIndexOf(' ');
    return trimmed.substring(0, lastSpace) + '...';
}
exports.generateMetaDescription = generateMetaDescription;
/**
 * Generate slug from title
 */
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .trim();
}
exports.generateSlug = generateSlug;
/**
 * Extract keywords from content
 */
function extractKeywords(content, count) {
    if (count === void 0) { count = 10; }
    // Remove HTML tags and special characters
    var text = content
        .replace(/<[^>]*>/g, '')
        .replace(/[^\w\s]/g, ' ')
        .toLowerCase();
    // Split into words
    var words = text.split(/\s+/).filter(function (word) { return word.length > 3; });
    // Count word frequency
    var frequency = {};
    words.forEach(function (word) {
        frequency[word] = (frequency[word] || 0) + 1;
    });
    // Sort by frequency and return top keywords
    return Object.entries(frequency)
        .sort(function (a, b) { return b[1] - a[1]; })
        .slice(0, count)
        .map(function (_a) {
        var word = _a[0];
        return word;
    });
}
exports.extractKeywords = extractKeywords;
