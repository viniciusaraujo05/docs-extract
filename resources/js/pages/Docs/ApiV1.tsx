import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Link, usePage } from '@inertiajs/react';
import { isValidElement, useEffect, useMemo, useState, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ApiV1DocsProps {
    locale: 'en' | 'pt';
    markdown: string;
    lastUpdated: string;
}

interface OutlineItem {
    id: string;
    title: string;
    level: 2 | 3;
}

function slugifyHeading(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

function cleanHeadingText(text: string): string {
    return text.replace(/`/g, '').trim();
}

function extractOutline(markdown: string): OutlineItem[] {
    const lines = markdown.split('\n');
    const items: OutlineItem[] = [];
    let inCodeBlock = false;

    for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith('```')) {
            inCodeBlock = !inCodeBlock;
            continue;
        }

        if (inCodeBlock) {
            continue;
        }

        const match = line.match(/^(##|###)\s+(.+)$/);
        if (!match) {
            continue;
        }

        const level = match[1] === '##' ? 2 : 3;
        const title = cleanHeadingText(match[2]);
        const id = slugifyHeading(title);

        if (!id) {
            continue;
        }

        items.push({
            id,
            title,
            level,
        });
    }

    return items;
}

function childrenToText(children: ReactNode): string {
    if (typeof children === 'string' || typeof children === 'number') {
        return String(children);
    }

    if (Array.isArray(children)) {
        return children.map(childrenToText).join('');
    }

    if (isValidElement(children)) {
        return childrenToText((children.props as { children?: ReactNode }).children);
    }

    return '';
}

function getCopy(locale: string) {
    if (locale === 'pt') {
        return {
            title: 'Documentacao API v1 para OCR e Extracao | DOCSET',
            description:
                'Documentacao publica da API v1 da Docset: autenticacao, document types, extracao de documentos, filtros e pesquisa.',
            topTag: 'API publica',
            h1: 'Documentacao API v1',
            intro:
                'Referencia oficial para autenticar, criar modelos e extrair dados de documentos com a API v1.',
            updated: 'Ultima atualizacao',
            navBlog: 'Blog',
            navPricing: 'Precos',
            navStart: 'Comecar gratis',
            navSections: 'Secoes',
            introSection: 'Introducao',
            introText:
                'Use esta documentacao para integrar autenticacao, modelos de documento e extracao via API v1. A navegacao lateral permite ir direto para cada endpoint.',
            quickStart: 'Quick start',
            quickStartText:
                'Obtenha o token JWT e use o bearer token para as chamadas protegidas.',
            authTitle: 'Autenticacao',
            authText:
                'A API v1 publica usa autenticacao JWT para endpoints /v1.',
            ctaTitle: 'Pronto para testar a API?',
            ctaText:
                'Crie uma conta, gere um API Client e rode o fluxo completo com upload e extracao em poucos minutos.',
            ctaPrimary: 'Criar conta gratis',
            ctaSecondary: 'Ver precos',
        };
    }

    return {
        title: 'API v1 Documentation for OCR and Extraction | DOCSET',
        description:
            'Public DOCSET API v1 docs: auth, document types, extraction, filters, and search.',
        topTag: 'Public API',
        h1: 'API v1 Documentation',
        intro:
            'Official reference for authentication, document type management, and extraction workflows in API v1.',
        updated: 'Last updated',
        navBlog: 'Blog',
        navPricing: 'Pricing',
        navStart: 'Start Free',
        navSections: 'Sections',
        introSection: 'Introduction',
        introText:
            'Use this reference to integrate authentication, document types, and extraction with API v1. Use the left sidebar to jump directly to each endpoint section.',
        quickStart: 'Quick start',
        quickStartText:
            'Get a JWT token first, then send it as a bearer token on protected endpoints.',
        authTitle: 'Authentication',
        authText:
            'Public API v1 uses JWT authentication on /v1 endpoints.',
        ctaTitle: 'Ready to test the API?',
        ctaText:
            'Create an account, generate an API client, and run the full upload + extraction flow in minutes.',
        ctaPrimary: 'Create free account',
        ctaSecondary: 'See pricing',
    };
}

export default function ApiV1({ locale, markdown, lastUpdated }: ApiV1DocsProps) {
    const appUrl = usePage<{ appUrl?: string }>().props.appUrl || 'https://docset.app';
    const baseUrl = appUrl.replace(/\/$/, '');
    const appLocale: 'en' | 'pt' = locale === 'pt' ? 'pt' : 'en';
    const copy = getCopy(appLocale);
    const canonical = `${baseUrl}/${appLocale}/docs/api-v1`;
    const outline = useMemo(() => extractOutline(markdown), [markdown]);
    const navigation = useMemo<OutlineItem[]>(
        () => [{ id: 'introduction', title: copy.introSection, level: 2 }, ...outline],
        [copy.introSection, outline],
    );
    const [activeId, setActiveId] = useState<string>('introduction');

    const schema = {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: copy.h1,
        description: copy.description,
        inLanguage: appLocale === 'pt' ? 'pt' : 'en',
        dateModified: lastUpdated,
        author: {
            '@type': 'Organization',
            name: 'DOCSET',
        },
        publisher: {
            '@type': 'Organization',
            name: 'DOCSET',
            logo: {
                '@type': 'ImageObject',
                url: `${baseUrl}/docset.png`,
            },
        },
        url: canonical,
    };

    useEffect(() => {
        const headingIds = navigation.map((item) => item.id);
        const headingElements = headingIds
            .map((id) => document.getElementById(id))
            .filter((element): element is HTMLElement => element !== null);

        if (headingElements.length === 0) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

                if (visible?.target.id) {
                    setActiveId(visible.target.id);
                }
            },
            {
                rootMargin: '-30% 0px -60% 0px',
                threshold: [0.1, 0.25, 0.5],
            },
        );

        headingElements.forEach((element) => observer.observe(element));

        return () => observer.disconnect();
    }, [navigation]);

    const markdownComponents: Components = {
        h2: ({ children, ...props }) => {
            const id = slugifyHeading(cleanHeadingText(childrenToText(children)));

            return (
                <h2
                    id={id}
                    className="scroll-mt-28 border-b border-white/10 pb-2 text-2xl font-semibold text-white"
                    {...props}
                >
                    {children}
                </h2>
            );
        },
        h3: ({ children, ...props }) => {
            const id = slugifyHeading(cleanHeadingText(childrenToText(children)));

            return (
                <h3
                    id={id}
                    className="scroll-mt-28 text-xl font-semibold text-zinc-100"
                    {...props}
                >
                    {children}
                </h3>
            );
        },
        code: ({ className, children, ...props }) => {
            return (
                <code
                    className={className ?? 'rounded bg-zinc-800 px-1.5 py-0.5 text-blue-200'}
                    {...props}
                >
                    {children}
                </code>
            );
        },
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100">
            <SEOHead
                title={copy.title}
                description={copy.description}
                canonical={canonical}
                locale={appLocale === 'pt' ? 'pt-PT' : 'en'}
                structuredData={schema}
                alternateLocales={[
                    { locale: 'en', url: `${baseUrl}/en/docs/api-v1` },
                    { locale: 'pt-BR', url: `${baseUrl}/pt/docs/api-v1` },
                    { locale: 'pt-PT', url: `${baseUrl}/pt/docs/api-v1` },
                    { locale: 'x-default', url: `${baseUrl}/en/docs/api-v1` },
                ]}
            />

            <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/90 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                    <Link href={`/${appLocale}`} className="flex items-center gap-3">
                        <img src="/docset.png" alt="Docset" className="h-8 w-8 rounded-md" />
                        <span className="text-lg font-bold">DOCSET</span>
                    </Link>
                    <nav className="hidden items-center gap-5 text-sm text-zinc-300 md:flex">
                        <Link href={`/${appLocale}/blog`} className="hover:text-white">
                            {copy.navBlog}
                        </Link>
                        <Link href={`/${appLocale}/#pricing`} className="hover:text-white">
                            {copy.navPricing}
                        </Link>
                        <Link href={`/${appLocale}/register`} className="hover:text-white">
                            {copy.navStart}
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
                <section className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 md:p-8">
                    <p className="text-sm text-blue-300">{copy.topTag}</p>
                    <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">{copy.h1}</h1>
                    <p className="mt-4 max-w-3xl text-zinc-300">{copy.intro}</p>
                    <p className="mt-3 text-sm text-zinc-400">
                        {copy.updated}: {lastUpdated}
                    </p>
                </section>

                <div className="mt-6 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
                    <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)] lg:overflow-y-auto">
                        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-4">
                            <p className="mb-3 text-xs font-semibold tracking-wide text-zinc-400 uppercase">
                                {copy.navSections}
                            </p>
                            <nav aria-label={copy.navSections}>
                                <ul className="space-y-1">
                                    {navigation.map((item) => (
                                        <li key={item.id}>
                                            <a
                                                href={`#${item.id}`}
                                                className={`block rounded-md px-3 py-2 transition ${
                                                    item.level === 3 ? 'ml-3 text-xs' : 'text-sm font-medium'
                                                } ${
                                                    activeId === item.id
                                                        ? 'bg-blue-500/15 text-blue-200'
                                                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                                                }`}
                                            >
                                                {item.title}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        </div>
                    </aside>

                    <div className="space-y-6">
                        <section
                            id="introduction"
                            className="scroll-mt-28 rounded-2xl border border-white/10 bg-zinc-900/50 p-6 md:p-8"
                        >
                            <h2 className="text-2xl font-semibold text-white">{copy.introSection}</h2>
                            <p className="mt-3 text-zinc-300">{copy.introText}</p>

                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                                <div className="rounded-lg border border-white/10 bg-zinc-950/70 p-4">
                                    <p className="text-xs font-medium tracking-wide text-zinc-400 uppercase">
                                        JWT API
                                    </p>
                                    <code className="mt-2 block text-sm text-blue-200">
                                        https://api.docset.app/v1
                                    </code>
                                </div>
                            </div>

                            <div className="mt-5 rounded-lg border border-white/10 bg-zinc-950/70 p-4">
                                <h3 className="text-base font-semibold text-white">{copy.authTitle}</h3>
                                <p className="mt-2 text-sm text-zinc-300">{copy.authText}</p>
                            </div>

                            <div className="mt-5 rounded-lg border border-white/10 bg-zinc-950/70 p-4">
                                <h3 className="text-base font-semibold text-white">{copy.quickStart}</h3>
                                <p className="mt-2 text-sm text-zinc-300">{copy.quickStartText}</p>
                                <pre className="mt-3 overflow-x-auto rounded border border-white/10 bg-black p-3 text-xs text-zinc-200">
                                    <code>{`curl -X POST https://api.docset.app/v1/auth/token \\
  -H "Accept: application/json" \\
  -H "Content-Type: application/json" \\
  -d '{"client_id":"YOUR_CLIENT_ID","client_secret":"YOUR_CLIENT_SECRET"}'`}</code>
                                </pre>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6 md:p-8">
                            <article className="prose prose-invert max-w-none prose-headings:text-white prose-a:text-blue-300 prose-code:text-blue-200 prose-pre:border prose-pre:border-white/10 prose-pre:bg-zinc-950 prose-strong:text-white prose-li:text-zinc-300 prose-p:text-zinc-300">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                    {markdown}
                                </ReactMarkdown>
                            </article>
                        </section>

                        <section className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6 md:p-8">
                            <h2 className="text-2xl font-bold text-white md:text-3xl">{copy.ctaTitle}</h2>
                            <p className="mt-3 max-w-3xl text-zinc-300">{copy.ctaText}</p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link href={`/${appLocale}/register`}>
                                    <Button className="bg-white font-semibold text-zinc-950 hover:bg-zinc-200">
                                        {copy.ctaPrimary}
                                    </Button>
                                </Link>
                                <Link href={`/${appLocale}/#pricing`}>
                                    <Button variant="outline" className="border-white/15 text-white hover:bg-white/10">
                                        {copy.ctaSecondary}
                                    </Button>
                                </Link>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
