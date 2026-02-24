<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        
        @php
            $seo = $page['props']['seo'] ?? [];
            $seoTitle = $seo['title'] ?? config('app.name');
            $seoDescription = $seo['description'] ?? '';
            $seoKeywords = $seo['keywords'] ?? '';
            $seoCanonical = $seo['canonical'] ?? url()->current();
            $seoOgImage = $seo['ogImage'] ?? url('/docset.png');
            $seoLocale = $seo['locale'] ?? 'en';
            $seoStructuredData = $seo['structuredData'] ?? '';
            $seoAlternateLocales = $seo['alternateLocales'] ?? [];
        @endphp
        
        {{-- SEO Meta Tags --}}
        <meta name="description" content="{{ $seoDescription }}">
        @if($seoKeywords)
        <meta name="keywords" content="{{ $seoKeywords }}">
        @endif
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
        <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
        <meta name="theme-color" content="#000000">
        <meta name="format-detection" content="telephone=no">
        <meta name="author" content="DOCSET">
        <meta name="language" content="{{ $seoLocale }}">
        <meta http-equiv="content-language" content="{{ $seoLocale }}">
        
        {{-- Canonical URL --}}
        <link rel="canonical" href="{{ $seoCanonical }}">
        
        {{-- Alternate Language Links --}}
        @foreach($seoAlternateLocales as $altLocale)
        <link rel="alternate" hreflang="{{ $altLocale['locale'] }}" href="{{ $altLocale['url'] }}">
        @endforeach
        
        {{-- Open Graph Meta Tags --}}
        <meta property="og:title" content="{{ $seoTitle }}">
        <meta property="og:description" content="{{ $seoDescription }}">
        <meta property="og:type" content="website">
        <meta property="og:url" content="{{ $seoCanonical }}">
        <meta property="og:image" content="{{ $seoOgImage }}">
        <meta property="og:locale" content="{{ str_replace('-', '_', $seoLocale) }}">
        <meta property="og:site_name" content="DOCSET">
        
        {{-- Twitter Card Meta Tags --}}
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ $seoTitle }}">
        <meta name="twitter:description" content="{{ $seoDescription }}">
        <meta name="twitter:image" content="{{ $seoOgImage }}">
        
        {{-- Preconnect for Performance --}}
        <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
        <link rel="dns-prefetch" href="https://fonts.bunny.net">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>
        
        {{-- No-Script Fallback for animations --}}
        <noscript>
            <style>
                .ssr-fade-in {
                    opacity: 1 !important;
                    transform: none !important;
                }
            </style>
        </noscript>

        <title inertia>{{ $seoTitle }}</title>

        {{-- Favicons and Icons --}}
        <link rel="icon" href="/docset.png" sizes="any">
        <link rel="icon" href="/docset.png" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/docset.png">
        <link rel="manifest" href="/site.webmanifest">

        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        {{-- Google Picker API for drive.file scope compliance --}}
        <script async defer src="https://apis.google.com/js/api.js"></script>

        {{-- Structured Data (JSON-LD) --}}
        @if($seoStructuredData)
        <script type="application/ld+json">{!! $seoStructuredData !!}</script>
        @endif

        {{-- Analytics & Cookies (Production Only) --}}
        @production
            {{-- Google tag (gtag.js) --}}
            <script async defer src="https://www.googletagmanager.com/gtag/js?id=G-5EFQBMVB3G"></script>
            <script>
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-5EFQBMVB3G');
              gtag('config', 'AW-958866825');
            </script>

            {{-- Google Consent Mode v2 --}}
            <script>
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('consent', 'default', {
                    'ad_storage': 'denied',
                    'ad_user_data': 'denied',
                    'ad_personalization': 'denied',
                    'analytics_storage': 'denied',
                    'wait_for_update': 500
                });
            </script>
            <script async defer type="text/javascript" charset="UTF-8" src="//cdn.cookie-script.com/s/515ed2cba50c7a9fc9f575d03a7aa1df.js"></script>

            {{-- Apollo.io Website Tracker --}}
            <script>
                function initApollo(){
                    var n=Math.random().toString(36).substring(7),
                        o=document.createElement("script");
                    o.src="https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache="+n;
                    o.async=!0;
                    o.defer=!0;
                    o.onload=function(){window.trackingFunctions.onLoad({appId:"699c707353bb4b0015c49db3"})};
                    document.head.appendChild(o)
                }
                initApollo();
            </script>
        @endproduction
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
