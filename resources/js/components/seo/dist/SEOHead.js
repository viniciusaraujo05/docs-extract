"use strict";
exports.__esModule = true;
var react_1 = require("@inertiajs/react");
function SEOHead(_a) {
    var title = _a.title, description = _a.description, keywords = _a.keywords, canonical = _a.canonical, _b = _a.ogImage, ogImage = _b === void 0 ? '/docset.png' : _b, _c = _a.ogType, ogType = _c === void 0 ? 'website' : _c, _d = _a.locale, locale = _d === void 0 ? 'en' : _d, _e = _a.alternateLocales, alternateLocales = _e === void 0 ? [] : _e, structuredData = _a.structuredData, _f = _a.noindex, noindex = _f === void 0 ? false : _f;
    var _g = react_1.usePage(), pageUrl = _g.url, props = _g.props;
    var baseUrlFromProps = props.appUrl;
    var siteUrl = baseUrlFromProps ||
        (typeof window !== 'undefined' ? window.location.origin : '') ||
        'https://docset.com';
    var path = typeof window !== 'undefined'
        ? window.location.pathname + window.location.search
        : pageUrl || '/';
    var fullTitle = title.includes('DOCSET') ? title : title + " | DOCSET";
    var fullCanonical = canonical || "" + siteUrl + path;
    var fullOgImage = ogImage.startsWith('http') ? ogImage : "" + siteUrl + ogImage;
    return (React.createElement(react_1.Head, null,
        React.createElement("title", null, fullTitle),
        React.createElement("meta", { name: "description", content: description }),
        keywords && React.createElement("meta", { name: "keywords", content: keywords }),
        noindex && React.createElement("meta", { name: "robots", content: "noindex, nofollow" }),
        !noindex && React.createElement("meta", { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" }),
        React.createElement("link", { rel: "canonical", href: fullCanonical }),
        alternateLocales.map(function (_a) {
            var altLocale = _a.locale, url = _a.url;
            return (React.createElement("link", { key: altLocale, rel: "alternate", hrefLang: altLocale, href: url }));
        }),
        React.createElement("meta", { property: "og:title", content: fullTitle }),
        React.createElement("meta", { property: "og:description", content: description }),
        React.createElement("meta", { property: "og:type", content: ogType }),
        React.createElement("meta", { property: "og:url", content: fullCanonical }),
        React.createElement("meta", { property: "og:image", content: fullOgImage }),
        React.createElement("meta", { property: "og:locale", content: locale.replace('-', '_') }),
        React.createElement("meta", { property: "og:site_name", content: "DOCSET" }),
        React.createElement("meta", { name: "twitter:card", content: "summary_large_image" }),
        React.createElement("meta", { name: "twitter:title", content: fullTitle }),
        React.createElement("meta", { name: "twitter:description", content: description }),
        React.createElement("meta", { name: "twitter:image", content: fullOgImage }),
        React.createElement("meta", { name: "author", content: "DOCSET" }),
        React.createElement("meta", { name: "language", content: locale }),
        React.createElement("meta", { httpEquiv: "content-language", content: locale }),
        structuredData && (React.createElement("script", { type: "application/ld+json" }, JSON.stringify(structuredData)))));
}
exports["default"] = SEOHead;
