import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface FieldExample {
    field: string;
    example: string;
}

interface Step {
    title: string;
    description: string;
}

interface Faq {
    q: string;
    a: string;
}

interface ExampleOutput {
    json: Record<string, unknown>;
    excelMapping: string[];
    note: string;
}

interface SolutionPage {
    slug: string;
    title: string;
    description: string;
    h1: string;
    intro: string[];
    whatIs: string[];
    extractFields: FieldExample[];
    steps: Step[];
    useCases: string[];
    example: ExampleOutput;
    security: string[];
    faqs: Faq[];
}

interface SolutionProps {
    locale: string;
    page: SolutionPage;
}

const SOLUTION_LINKS = [
    { slug: 'invoice-ocr', en: 'Invoice OCR', pt: 'OCR de Faturas/Notas' },
    { slug: 'receipt-ocr', en: 'Receipt OCR', pt: 'OCR de Recibos' },
    { slug: 'pdf-to-excel', en: 'PDF to Excel', pt: 'PDF para Excel' },
    { slug: 'ocr-api', en: 'OCR API', pt: 'API OCR' },
    { slug: 'invoice-parser', en: 'Invoice Parser', pt: 'Parser de Faturas/Notas' },
];

function getCopy(locale: string) {
    const isPt = locale.startsWith('pt');
    const isPtBr = locale === 'pt-br';

    if (!isPt) {
        return {
            localeTag: 'en',
            topLabel: 'Docset solutions',
            ctaEyebrow: 'Start in minutes',
            ctaTitle: 'Run your first extraction workflow today',
            ctaText:
                'Upload a sample document from your computer or Google Drive, validate extracted fields, and export to Excel, Google Sheets, or JSON.',
            ctaPrimary: 'Start Free',
            ctaDocs: 'See API docs',
            ctaPricing: 'Pricing',
            ctaUpload: 'Upload sample PDF',
            navBlog: 'Blog',
            navDocs: 'API docs',
            navPricing: 'Pricing',
            navStart: 'Start Free',
            whatIs: 'What it is',
            whatExtract: 'What you can extract',
            whatExtractText:
                'Field definitions are configurable. Here are common examples teams map in production workflows.',
            howWorks: 'How it works',
            howWorksText:
                'The workflow is intentionally simple: ingest files (including Google Drive imports), run extraction with a reusable schema, validate critical outputs, then move forward with Excel, Google Sheets, or API integrations.',
            useCases: 'Common use cases',
            useCasesText:
                'Most teams start with one high-friction workflow, then scale to adjacent document types once template and review rules are stable.',
            example: 'Example output',
            exampleText:
                'Example JSON response and a short explanation of how teams map fields to Excel and Google Sheets columns.',
            security: 'Security & compliance',
            securityText:
                'Security controls are relevant for financial workflows: encryption in transit, access control, and retention management.',
            faq: 'FAQ',
            faqText:
                'Common implementation questions from finance, operations, and engineering teams evaluating document extraction.',
            learnMore: 'Learn more',
            learnMoreText:
                'Continue with core product actions and supporting resources.',
            learnPricing: 'Pricing',
            learnBlog: 'Blog index',
            learnDocs: 'API docs',
            learnIntegrations: 'Google Drive & Sheets integration (account required)',
            learnStart: 'Start free account',
            learnLogin: 'Existing user login',
            footerSolutions: 'Solutions',
            footerProduct: 'Product',
            footerTagline:
                'Structured extraction for invoices, receipts, forms, and operational PDFs.',
            fieldExampleLabel: 'Example',
        };
    }

    return {
        localeTag: locale === 'pt-br' ? 'pt-BR' : 'pt-PT',
        topLabel: 'Soluções Docset',
        ctaEyebrow: 'Comece em minutos',
        ctaTitle: 'Execute o seu primeiro fluxo de extração hoje',
        ctaText:
            'Envie um documento de exemplo do computador ou Google Drive, valide os campos extraídos e exporte para Excel, Google Sheets ou JSON.',
        ctaPrimary: 'Começar grátis',
        ctaDocs: 'Ver docs da API',
        ctaPricing: 'Preços',
        ctaUpload: 'Enviar PDF de exemplo',
        navBlog: 'Blog',
        navDocs: 'Docs da API',
        navPricing: 'Preços',
        navStart: 'Começar grátis',
        whatIs: 'O que é',
        whatExtract: isPtBr ? 'O que você pode extrair' : 'O que pode extrair',
        whatExtractText:
            'Os campos são configuráveis. Abaixo estão exemplos comuns usados em operações reais.',
        howWorks: 'Como funciona',
        howWorksText:
            'O fluxo é simples: enviar ficheiros (incluindo importação pelo Google Drive), extrair com um esquema reutilizável, validar os campos críticos e seguir para Excel, Google Sheets ou integração por API.',
        useCases: 'Casos de uso comuns',
        useCasesText:
            'A maioria das equipas começa por um processo com maior fricção e depois expande para outros tipos de documento.',
        example: 'Exemplo de saída',
        exampleText:
            'Exemplo de JSON e uma explicação curta de como os campos são mapeados para colunas no Excel e no Google Sheets.',
        security: 'Segurança e conformidade',
        securityText:
            'Controlo de acesso, encriptação e gestão de retenção são pontos essenciais para fluxos financeiros.',
        faq: 'FAQ',
        faqText:
            'Perguntas frequentes de equipas financeiras, operacionais e técnicas durante a implementação.',
        learnMore: 'Saiba mais',
        learnMoreText:
            'Continue para ações principais do produto e conteúdos de apoio.',
        learnPricing: 'Preços',
        learnBlog: 'Índice do blog',
        learnDocs: 'Docs da API',
        learnIntegrations: 'Integração Google Drive e Sheets (requer conta)',
        learnStart: 'Criar conta grátis',
        learnLogin: 'Entrar na conta',
        footerSolutions: 'Soluções',
        footerProduct: 'Produto',
        footerTagline:
            'Extração estruturada para faturas/notas, recibos, formulários e PDFs operacionais.',
        fieldExampleLabel: isPtBr ? 'Exemplo' : 'Exemplo',
    };
}

function CTASection({
    appLocale,
    copy,
}: {
    appLocale: 'en' | 'pt';
    copy: ReturnType<typeof getCopy>;
}) {
    return (
        <section className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6 md:p-8">
            <p className="text-xs font-semibold tracking-wide text-blue-300 uppercase">
                {copy.ctaEyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">
                {copy.ctaTitle}
            </h2>
            <p className="mt-3 max-w-3xl text-zinc-300">{copy.ctaText}</p>
            <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`/${appLocale}/register`}>
                    <Button className="bg-white font-semibold text-zinc-950 hover:bg-zinc-200">
                        {copy.ctaPrimary}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
                <Link href={`/${appLocale}/docs/api-v1`}>
                    <Button
                        variant="outline"
                        className="border-white/15 text-white hover:bg-white/10"
                    >
                        {copy.ctaDocs}
                    </Button>
                </Link>
                <Link href={`/${appLocale}/#pricing`}>
                    <Button
                        variant="outline"
                        className="border-white/15 text-white hover:bg-white/10"
                    >
                        {copy.ctaPricing}
                    </Button>
                </Link>
                <Link href={`/${appLocale}?demo=1`}>
                    <Button
                        variant="outline"
                        className="border-white/15 text-white hover:bg-white/10"
                    >
                        {copy.ctaUpload}
                    </Button>
                </Link>
            </div>
        </section>
    );
}

export default function Show({ locale, page }: SolutionProps) {
    const appUrl = usePage<{ appUrl?: string }>().props.appUrl || 'https://docset.app';
    const baseUrl = appUrl.replace(/\/$/, '');
    const normalizedLocale = locale.toLowerCase();
    const solutionLocale = ['en', 'pt-br', 'pt-pt'].includes(normalizedLocale)
        ? normalizedLocale
        : 'en';
    const appLocale: 'en' | 'pt' = solutionLocale.startsWith('pt') ? 'pt' : 'en';
    const canonical = `${baseUrl}/${solutionLocale}/${page.slug}`;
    const copy = getCopy(solutionLocale);

    const schema = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'SoftwareApplication',
                name: 'DOCSET',
                applicationCategory: 'BusinessApplication',
                operatingSystem: 'Web',
                url: canonical,
                description: page.description,
                offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'USD',
                    description: 'Free plan available',
                },
            },
            {
                '@type': 'FAQPage',
                mainEntity: page.faqs.map((faq) => ({
                    '@type': 'Question',
                    name: faq.q,
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: faq.a,
                    },
                })),
            },
        ],
    };

    const solutionLinks = SOLUTION_LINKS.map((item) => ({
        href: `/${solutionLocale}/${item.slug}`,
        label: solutionLocale.startsWith('pt') ? item.pt : item.en,
    }));

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100">
            <SEOHead
                title={page.title}
                description={page.description}
                canonical={canonical}
                locale={copy.localeTag}
                structuredData={schema}
                alternateLocales={[
                    { locale: 'en', url: `${baseUrl}/en/${page.slug}` },
                    { locale: 'pt-BR', url: `${baseUrl}/pt-br/${page.slug}` },
                    { locale: 'pt-PT', url: `${baseUrl}/pt-pt/${page.slug}` },
                    { locale: 'x-default', url: `${baseUrl}/en/${page.slug}` },
                ]}
            />

            <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/90 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                    <Link href={`/${appLocale}`} className="flex items-center gap-3">
                        <img
                            src="/docset.png"
                            alt="Docset"
                            className="h-8 w-8 rounded-md"
                        />
                        <span className="text-lg font-bold">DOCSET</span>
                    </Link>
                    <nav className="hidden items-center gap-5 text-sm text-zinc-300 md:flex">
                        <Link href={`/${appLocale}/blog`} className="hover:text-white">
                            {copy.navBlog}
                        </Link>
                        <Link href={`/${appLocale}/docs/api-v1`} className="hover:text-white">
                            {copy.navDocs}
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

            <main className="mx-auto max-w-6xl space-y-12 px-4 py-10 md:py-14">
                <article className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 md:p-10">
                    <p className="text-sm text-blue-300">{copy.topLabel}</p>
                    <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">
                        {page.h1}
                    </h1>
                    <div className="mt-5 space-y-4 text-zinc-300">
                        {page.intro.map((paragraph) => (
                            <p key={paragraph}>{paragraph}</p>
                        ))}
                    </div>
                </article>

                <CTASection appLocale={appLocale} copy={copy} />

                <section
                    className="space-y-3 rounded-2xl border border-white/10 bg-zinc-900/40 p-6 md:p-8"
                    aria-labelledby="what-it-is"
                >
                    <h2 id="what-it-is" className="text-2xl font-semibold text-white">
                        {copy.whatIs}
                    </h2>
                    <div className="space-y-4 text-zinc-300">
                        {page.whatIs.map((paragraph) => (
                            <p key={paragraph}>{paragraph}</p>
                        ))}
                    </div>
                </section>

                <section
                    className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6 md:p-8"
                    aria-labelledby="what-you-can-extract"
                >
                    <h2
                        id="what-you-can-extract"
                        className="text-2xl font-semibold text-white"
                    >
                        {copy.whatExtract}
                    </h2>
                    <p className="mt-3 text-zinc-300">{copy.whatExtractText}</p>
                    <ul className="mt-5 grid gap-3 md:grid-cols-2">
                        {page.extractFields.map((item) => (
                            <li
                                key={item.field}
                                className="rounded-lg border border-white/10 bg-zinc-950/50 p-4"
                            >
                                <p className="font-medium text-white">{item.field}</p>
                                <p className="mt-1 text-sm text-zinc-400">
                                    {copy.fieldExampleLabel}: {item.example}
                                </p>
                            </li>
                        ))}
                    </ul>
                </section>

                <section
                    className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6 md:p-8"
                    aria-labelledby="how-it-works"
                >
                    <h2 id="how-it-works" className="text-2xl font-semibold text-white">
                        {copy.howWorks}
                    </h2>
                    <p className="mt-3 text-zinc-300">{copy.howWorksText}</p>
                    <ol className="mt-5 space-y-4">
                        {page.steps.map((step, index) => (
                            <li
                                key={step.title}
                                className="rounded-lg border border-white/10 bg-zinc-950/50 p-4"
                            >
                                <p className="font-semibold text-white">
                                    {index + 1}. {step.title}
                                </p>
                                <p className="mt-2 text-zinc-300">{step.description}</p>
                            </li>
                        ))}
                    </ol>
                </section>

                <section
                    className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6 md:p-8"
                    aria-labelledby="common-use-cases"
                >
                    <h2 id="common-use-cases" className="text-2xl font-semibold text-white">
                        {copy.useCases}
                    </h2>
                    <p className="mt-3 text-zinc-300">{copy.useCasesText}</p>
                    <ul className="mt-5 space-y-3">
                        {page.useCases.map((item) => (
                            <li key={item} className="flex items-start gap-3 text-zinc-300">
                                <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-400" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                <section
                    className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6 md:p-8"
                    aria-labelledby="example-output"
                >
                    <h2 id="example-output" className="text-2xl font-semibold text-white">
                        {copy.example}
                    </h2>
                    <p className="mt-3 text-zinc-300">{copy.exampleText}</p>
                    <pre className="mt-5 overflow-x-auto rounded-lg border border-white/10 bg-zinc-950 p-4 text-xs text-zinc-200 md:text-sm">
                        <code>{JSON.stringify(page.example.json, null, 2)}</code>
                    </pre>
                    <ul className="mt-4 space-y-2 text-zinc-300">
                        {page.example.excelMapping.map((map) => (
                            <li key={map}>{map}</li>
                        ))}
                    </ul>
                    <p className="mt-4 text-sm text-zinc-400">{page.example.note}</p>
                </section>

                <section
                    className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6 md:p-8"
                    aria-labelledby="security-compliance"
                >
                    <h2
                        id="security-compliance"
                        className="text-2xl font-semibold text-white"
                    >
                        {copy.security}
                    </h2>
                    <p className="mt-3 text-zinc-300">{copy.securityText}</p>
                    <ul className="mt-4 space-y-3">
                        {page.security.map((line) => (
                            <li key={line} className="text-zinc-300">
                                {line}
                            </li>
                        ))}
                    </ul>
                </section>

                <section
                    className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6 md:p-8"
                    aria-labelledby="faq"
                >
                    <h2 id="faq" className="text-2xl font-semibold text-white">
                        {copy.faq}
                    </h2>
                    <p className="mt-3 text-zinc-300">{copy.faqText}</p>
                    <div className="mt-5 space-y-4">
                        {page.faqs.map((faq) => (
                            <article
                                key={faq.q}
                                className="rounded-lg border border-white/10 bg-zinc-950/50 p-4"
                            >
                                <h3 className="text-lg font-medium text-white">{faq.q}</h3>
                                <p className="mt-2 text-zinc-300">{faq.a}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section
                    className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6 md:p-8"
                    aria-labelledby="learn-more"
                >
                    <h2 id="learn-more" className="text-2xl font-semibold text-white">
                        {copy.learnMore}
                    </h2>
                    <p className="mt-3 text-zinc-300">{copy.learnMoreText}</p>
                    <ul className="mt-4 space-y-2 text-zinc-300">
                        <li>
                            <Link
                                href={`/${appLocale}/#pricing`}
                                className="text-blue-300 hover:text-blue-200"
                            >
                                {copy.learnPricing}
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={`/${appLocale}/blog`}
                                className="text-blue-300 hover:text-blue-200"
                            >
                                {copy.learnBlog}
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={`/${appLocale}/docs/api-v1`}
                                className="text-blue-300 hover:text-blue-200"
                            >
                                {copy.learnDocs}
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={`/${appLocale}/settings/integrations`}
                                className="text-blue-300 hover:text-blue-200"
                            >
                                {copy.learnIntegrations}
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={`/${appLocale}/register`}
                                className="text-blue-300 hover:text-blue-200"
                            >
                                {copy.learnStart}
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={`/${appLocale}/login`}
                                className="text-blue-300 hover:text-blue-200"
                            >
                                {copy.learnLogin}
                            </Link>
                        </li>
                    </ul>
                </section>

                <CTASection appLocale={appLocale} copy={copy} />
            </main>

            <footer className="border-t border-white/10 bg-zinc-950 px-4 py-10">
                <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-4">
                    <div className="md:col-span-2">
                        <p className="text-lg font-semibold text-white">DOCSET</p>
                        <p className="mt-2 max-w-xl text-sm text-zinc-400">
                            {copy.footerTagline}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-white">
                            {copy.footerSolutions}
                        </p>
                        <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                            {solutionLinks.map((item) => (
                                <li key={item.href}>
                                    <Link href={item.href} className="hover:text-white">
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-white">
                            {copy.footerProduct}
                        </p>
                        <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                            <li>
                                <Link href={`/${appLocale}/#pricing`} className="hover:text-white">
                                    {copy.ctaPricing}
                                </Link>
                            </li>
                            <li>
                                <Link href={`/${appLocale}/register`} className="hover:text-white">
                                    {copy.ctaPrimary}
                                </Link>
                            </li>
                            <li>
                                <Link href={`/${appLocale}/blog`} className="hover:text-white">
                                    {copy.navBlog}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </footer>
        </div>
    );
}
