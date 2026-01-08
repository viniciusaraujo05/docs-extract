"use strict";
exports.__esModule = true;
exports.generateFAQSchema = exports.generateBreadcrumbSchema = exports.generateWebPageSchema = exports.generateSoftwareSchema = exports.generateOrganizationSchema = void 0;
var react_1 = require("@inertiajs/react");
/**
 * Component to inject JSON-LD structured data into the page
 * Used for rich snippets in search results
 */
function StructuredData(_a) {
    var data = _a.data;
    return (React.createElement(react_1.Head, null,
        React.createElement("script", { type: "application/ld+json" }, JSON.stringify(data))));
}
exports["default"] = StructuredData;
/**
 * Generate Organization structured data
 */
function generateOrganizationSchema(siteUrl) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'DOCSET',
        url: siteUrl,
        logo: siteUrl + "/docset.png",
        description: 'Document data platform for PDFs and images',
        sameAs: [],
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Service',
            availableLanguage: ['English', 'Portuguese']
        }
    };
}
exports.generateOrganizationSchema = generateOrganizationSchema;
/**
 * Generate SoftwareApplication structured data
 */
function generateSoftwareSchema(siteUrl, locale) {
    var descriptions = {
        en: 'DOCSET turns PDFs and images into structured, usable data. Define custom fields, review extracted data, and export or integrate via API to automate recurring document workflows.',
        'pt-BR': 'O DOCSET transforma PDFs e imagens em dados estruturados. Define campos personalizados, revê os dados extraídos e exporta relatórios para automatizar documentos recorrentes via interface ou API.',
        'pt-PT': 'O DOCSET transforma PDFs e imagens em dados estruturados. Define campos personalizados, revê os dados extraídos e exporta relatórios para automatizar documentos recorrentes via interface ou API.'
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
            description: 'Free plan available'
        },
        description: descriptions[locale] || descriptions.en,
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
        screenshot: siteUrl + "/docset.png",
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '100'
        }
    };
}
exports.generateSoftwareSchema = generateSoftwareSchema;
/**
 * Generate WebPage structured data
 */
function generateWebPageSchema(siteUrl, title, description) {
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
            url: siteUrl
        }
    };
}
exports.generateWebPageSchema = generateWebPageSchema;
/**
 * Generate BreadcrumbList structured data
 */
function generateBreadcrumbSchema(items) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map(function (item, index) { return ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url
        }); })
    };
}
exports.generateBreadcrumbSchema = generateBreadcrumbSchema;
/**
 * Generate FAQPage structured data
 */
function generateFAQSchema(faqs) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(function (faq) { return ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer
            }
        }); })
    };
}
exports.generateFAQSchema = generateFAQSchema;
