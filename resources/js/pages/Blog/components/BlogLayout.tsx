import { Link } from '@inertiajs/react';
import { ArrowRight, Github, Linkedin, Twitter } from 'lucide-react';

interface BlogLayoutProps {
    children: React.ReactNode;
    locale: string;
}

export function BlogLayout({ children, locale }: BlogLayoutProps) {
    const solutionLocale = locale === 'pt' ? 'pt-pt' : 'en';
    const pt = locale === 'pt';

    return (
        <div className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-indigo-500/30">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-8">
                        <Link
                            href={`/${locale}`}
                            className="flex items-center gap-3 transition-opacity hover:opacity-80"
                        >
                            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-border bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                                <img
                                    src="/docset.png"
                                    alt="Docset Logo"
                                    className="h-5 w-5 object-contain"
                                />
                            </div>
                            <span className="text-xl font-bold tracking-tight">
                                DOCSET{' '}
                                <span className="ml-1 font-medium text-muted-foreground">
                                    {pt ? 'Blog' : 'Blog'}
                                </span>
                            </span>
                        </Link>

                        <nav className="hidden gap-6 text-sm font-medium md:flex">
                            <Link
                                href={`/${locale}/blog`}
                                className="text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {pt ? 'Todos os posts' : 'All Posts'}
                            </Link>
                            <Link
                                href={`/${locale}/#features`}
                                className="text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {pt ? 'Funcionalidades' : 'Features'}
                            </Link>
                            <Link
                                href={`/${locale}/docs/api-v1`}
                                className="text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {pt ? 'Docs da API' : 'API Docs'}
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                            href={`/${locale}/login`}
                            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:block"
                        >
                            {pt ? 'Entrar' : 'Log in'}
                        </Link>
                        <Link
                            href={`/${locale}/register`}
                            className="group flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                        >
                            {pt ? 'Começar grátis' : 'Get Started'}
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">{children}</main>

            {/* Footer */}
            <footer className="mt-20 border-t border-border bg-muted/30 px-6 py-12 md:py-16">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-12 md:grid-cols-5 lg:grid-cols-6">
                        <div className="md:col-span-2 lg:col-span-2">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                    <img
                                        src="/docset.png"
                                        alt="Docset"
                                        className="h-5 w-5"
                                    />
                                </div>
                                <span className="text-lg font-bold text-foreground">
                                    DOCSET
                                </span>
                            </div>
                            <p className="mb-8 max-w-xs text-sm leading-relaxed text-muted-foreground">
                                {pt
                                    ? 'Transforme documentos PDF não estruturados em dados limpos via API.'
                                    : 'Transform your unstructured PDF documents into clean, structured data automatically via API.'}
                            </p>
                            <div className="flex items-center gap-4 text-muted-foreground">
                                <a
                                    href="#"
                                    className="transition-colors hover:text-foreground"
                                >
                                    <Twitter className="h-5 w-5" />
                                </a>
                                <a
                                    href="#"
                                    className="transition-colors hover:text-foreground"
                                >
                                    <Github className="h-5 w-5" />
                                </a>
                                <a
                                    href="#"
                                    className="transition-colors hover:text-foreground"
                                >
                                    <Linkedin className="h-5 w-5" />
                                </a>
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-4 font-semibold text-foreground">
                                {pt ? 'Produto' : 'Product'}
                            </h3>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li>
                                    <Link
                                        href={`/${locale}/#features`}
                                        className="transition-colors hover:text-foreground"
                                    >
                                        {pt ? 'Funcionalidades' : 'Features'}
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={`/${locale}/#pricing`}
                                        className="transition-colors hover:text-foreground"
                                    >
                                        {pt ? 'Preços' : 'Pricing'}
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={`/${locale}/blog`}
                                        className="transition-colors hover:text-foreground"
                                    >
                                        Blog
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-4 font-semibold text-foreground">
                                {pt ? 'Desenvolvedores' : 'Developers'}
                            </h3>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li>
                                    <Link
                                        href={`/${locale}/docs/api-v1`}
                                        className="transition-colors hover:text-foreground"
                                    >
                                        {pt ? 'Docs da API' : 'API Docs'}
                                    </Link>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="transition-colors hover:text-foreground"
                                    >
                                        {pt ? 'Webhooks' : 'Webhooks'}
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="transition-colors hover:text-foreground"
                                    >
                                        {pt ? 'Status' : 'Status'}
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-4 font-semibold text-foreground">
                                {pt ? 'Soluções' : 'Solutions'}
                            </h3>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li>
                                    <Link
                                        href={`/${solutionLocale}/invoice-ocr`}
                                        className="transition-colors hover:text-foreground"
                                    >
                                        {pt ? 'OCR de Faturas/Notas' : 'Invoice OCR'}
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={`/${solutionLocale}/receipt-ocr`}
                                        className="transition-colors hover:text-foreground"
                                    >
                                        {pt ? 'OCR de Recibos' : 'Receipt OCR'}
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={`/${solutionLocale}/pdf-to-excel`}
                                        className="transition-colors hover:text-foreground"
                                    >
                                        {pt ? 'PDF para Excel' : 'PDF to Excel'}
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={`/${solutionLocale}/ocr-api`}
                                        className="transition-colors hover:text-foreground"
                                    >
                                        {pt ? 'API OCR' : 'OCR API'}
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={`/${solutionLocale}/invoice-parser`}
                                        className="transition-colors hover:text-foreground"
                                    >
                                        {pt ? 'Parser de Faturas/Notas' : 'Invoice Parser'}
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-4 font-semibold text-foreground">
                                {pt ? 'Legal' : 'Legal'}
                            </h3>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li>
                                    <Link
                                        href={`/${locale}/privacy`}
                                        className="transition-colors hover:text-foreground"
                                    >
                                        {pt ? 'Política de Privacidade' : 'Privacy Policy'}
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={`/${locale}/terms`}
                                        className="transition-colors hover:text-foreground"
                                    >
                                        {pt ? 'Termos de Serviço' : 'Terms of Service'}
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-muted-foreground md:flex-row">
                        <p>
                            {pt
                                ? `© ${new Date().getFullYear()} Docset. Todos os direitos reservados.`
                                : `© ${new Date().getFullYear()} Docset. All rights reserved.`}
                        </p>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span>{pt ? 'Todos os sistemas operando' : 'All systems operational'}</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
