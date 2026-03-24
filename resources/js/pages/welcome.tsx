import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { setPortugueseVariant } from '@/i18n/config';
import { router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import {
    ArrowRight,
    Check,
    CheckCircle,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Cloud,
    Database,
    Download,
    FileJson,
    FileSpreadsheet,
    FileText,
    Link,
    Lock,
    Menu,
    Play,
    Server,
    Shield,
    Sparkles,
    Upload,
    X,
    Zap,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

// ─── Browser Frame (wraps screenshots in app chrome) ─────────────────────────
function BrowserFrame({
    src,
    alt,
    className = '',
}: {
    src: string;
    alt: string;
    className?: string;
}) {
    return (
        <div
            className={`overflow-hidden rounded-xl border border-border shadow-2xl shadow-black/50 ${className}`}
        >
            <div className="flex items-center gap-1.5 border-b border-border bg-card px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-500/70" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                <div className="h-3 w-3 rounded-full bg-green-500/70" />
                <div className="mx-4 flex-1 rounded bg-muted px-3 py-1 text-center text-xs text-muted-foreground">
                    docset.app
                </div>
            </div>
            <img
                src={src}
                alt={alt}
                width={1200}
                height={800}
                className="w-full"
                loading="lazy"
            />
        </div>
    );
}

// ─── Hero PDF Extraction Animation ───────────────────────────────────────────
function HeroPdfAnimation() {
    const [scanY, setScanY] = useState(0);
    const [extractedCount, setExtractedCount] = useState(0);
    const [phase, setPhase] = useState<'scanning' | 'done'>('scanning');

    const fields = [
        { label: 'Invoice #', value: 'INV-2024-001', triggerAt: 18 },
        { label: 'Date', value: '15 Jan 2024', triggerAt: 35 },
        { label: 'Vendor', value: 'Acme Corp.', triggerAt: 52 },
        { label: 'Total', value: '€12,450.00', triggerAt: 68 },
        { label: 'Tax', value: '€2,860.50', triggerAt: 84 },
    ];
    const lineWidths = [88, 72, 95, 65, 80, 70, 60, 85, 78, 90, 68, 75];

    useEffect(() => {
        let raf: number;
        let startTime: number | null = null;
        const SCAN = 3200;
        const PAUSE = 1800;
        const tick = (now: number) => {
            if (startTime === null) startTime = now;
            const p = Math.min(((now - startTime) / SCAN) * 100, 100);
            setScanY(p);
            setExtractedCount(fields.filter((f) => p >= f.triggerAt).length);
            if (p < 100) {
                raf = requestAnimationFrame(tick);
            } else {
                setPhase('done');
                setTimeout(() => {
                    setPhase('scanning');
                    setScanY(0);
                    setExtractedCount(0);
                    startTime = null;
                    raf = requestAnimationFrame(tick);
                }, PAUSE);
            }
        };
        const t = setTimeout(() => {
            raf = requestAnimationFrame(tick);
        }, 600);
        return () => {
            clearTimeout(t);
            cancelAnimationFrame(raf);
        };
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: 'easeOut' }}
            className="w-full"
        >
            <div className="overflow-hidden rounded-xl border border-border shadow-2xl shadow-black/50">
                <div className="flex items-center gap-1.5 border-b border-border bg-card px-4 py-3">
                    <div className="h-3 w-3 rounded-full bg-red-500/70" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                    <div className="h-3 w-3 rounded-full bg-green-500/70" />
                    <div className="mx-4 flex-1 rounded bg-muted px-3 py-1 text-center text-xs text-muted-foreground">
                        docset.app
                    </div>
                </div>
                <div className="bg-muted/30 p-4 md:p-5">
                    <div className="mb-4 flex items-center gap-2">
                        <div className="h-2.5 w-28 rounded-full bg-muted" />
                        <div className="ml-auto h-6 w-20 rounded-md bg-blue-500/20" />
                    </div>
                    <div className="grid grid-cols-[1fr,24px,1fr] items-start gap-2">
                        {/* PDF panel */}
                        <div className="relative overflow-hidden rounded-lg border border-border bg-card p-3">
                            <div className="mb-2.5 flex items-center gap-2 border-b border-border pb-2">
                                <div className="flex h-6 w-6 items-center justify-center rounded bg-red-100">
                                    <FileText className="h-3.5 w-3.5 text-red-600" />
                                </div>
                                <div className="h-1.5 w-20 rounded-full bg-muted" />
                            </div>
                            <div className="space-y-1.5">
                                {lineWidths.map((w, i) => {
                                    const pos = (i / lineWidths.length) * 100;
                                    const active =
                                        phase === 'scanning' &&
                                        Math.abs(scanY - pos) < 10;
                                    const scanned =
                                        phase === 'scanning' && scanY > pos;
                                    return (
                                        <div
                                            key={i}
                                            className={`rounded-full transition-colors duration-150 ${active ? 'bg-blue-400/50' : scanned ? 'bg-background/10' : 'bg-muted'}`}
                                            style={{
                                                height: '5px',
                                                width: `${w}%`,
                                            }}
                                        />
                                    );
                                })}
                            </div>
                            {phase === 'scanning' && (
                                <div
                                    className="pointer-events-none absolute right-3 left-3 h-px"
                                    style={{
                                        top: `calc(${scanY * 0.68}% + 44px)`,
                                        background:
                                            'linear-gradient(to right, transparent, rgba(96,165,250,0.9), transparent)',
                                        boxShadow:
                                            '0 0 10px 3px rgba(96,165,250,0.25)',
                                    }}
                                />
                            )}
                        </div>
                        {/* Arrow */}
                        <div className="flex items-center justify-center pt-10">
                            <motion.div
                                animate={{ x: [0, 4, 0] }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 1.2,
                                    ease: 'easeInOut',
                                }}
                            >
                                <ArrowRight className="h-4 w-4 text-blue-600" />
                            </motion.div>
                        </div>
                        {/* Data panel */}
                        <div className="rounded-lg border border-border bg-card p-3">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase">
                                    Extracted
                                </span>
                                <AnimatePresence>
                                    {phase === 'done' && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-center gap-1 rounded-full bg-green-100 px-1.5 py-0.5"
                                        >
                                            <CheckCircle className="h-2.5 w-2.5 text-green-600" />
                                            <span className="text-[9px] text-green-600">
                                                Done
                                            </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <div className="space-y-1.5">
                                {fields.map((field, i) => (
                                    <motion.div
                                        key={field.label}
                                        initial={false}
                                        animate={
                                            i < extractedCount
                                                ? { opacity: 1, x: 0 }
                                                : { opacity: 0, x: 8 }
                                        }
                                        transition={{ duration: 0.25 }}
                                        className="grid grid-cols-2 gap-1 rounded border border-border bg-muted px-2 py-1.5"
                                    >
                                        <span className="truncate text-[9px] text-muted-foreground">
                                            {field.label}
                                        </span>
                                        <span className="truncate text-right font-mono text-[9px] text-blue-700">
                                            {field.value}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                            <motion.div
                                initial={false}
                                animate={
                                    phase === 'done'
                                        ? { opacity: 1, y: 0 }
                                        : { opacity: 0, y: 4 }
                                }
                                transition={{ duration: 0.3 }}
                                className="mt-3 flex items-center justify-center gap-1.5 rounded border border-blue-500/20 bg-blue-500/10 py-1.5"
                            >
                                <Download className="h-3 w-3 text-blue-600" />
                                <span className="text-[9px] font-medium text-blue-700">
                                    Export Excel
                                </span>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default function Welcome() {
    const { t, i18n } = useTranslation();
    const { props } = usePage<{
        auth?: { user?: any };
        canRegister: boolean;
        locale: string;
        plans: any[];
    }>();
    const isAuthenticated = !!props.auth?.user;
    const [locale, setLocale] = useState<'pt' | 'en'>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('selected-locale') as
                | 'pt'
                | 'en'
                | null;
            if (saved) return saved;
        }
        return props.locale === 'pt' ? 'pt' : 'en';
    });
    const [ptVariant, setPtVariant] = useState<'pt-PT' | 'pt-BR'>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('pt-variant') as
                | 'pt-PT'
                | 'pt-BR'
                | null;
            return saved ?? 'pt-PT';
        }
        return 'pt-PT';
    });
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [showDemo, setShowDemo] = useState(false);

    useEffect(() => {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');

        const currentUrlLocale = props.locale as 'pt' | 'en';
        const savedLocale = localStorage.getItem('selected-locale') as
            | 'pt'
            | 'en'
            | null;

        if (
            window.location.pathname === '/' &&
            savedLocale &&
            savedLocale !== currentUrlLocale
        ) {
            window.location.href = `/${savedLocale}`;
            return;
        }

        if (currentUrlLocale && currentUrlLocale !== locale) {
            setLocale(currentUrlLocale);
            i18n.changeLanguage(currentUrlLocale);
        }
    }, [props.locale]);

    const toggleTheme = useCallback(() => {
        // Theme toggle disabled to force light mode
        setTheme('light');
    }, []);

    useEffect(() => {
        if (locale === 'pt') {
            setPortugueseVariant(ptVariant);
        }
    }, [locale, ptVariant]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('demo') === '1') {
            setShowDemo(true);
        }
    }, []);

    const handleLocaleChange = useCallback(
        (value: string) => {
            if (value === 'en') {
                setLocale('en');
                localStorage.setItem('selected-locale', 'en');
                i18n.changeLanguage('en');
                window.location.href = `/en`;
            } else if (value === 'pt-BR') {
                setLocale('pt');
                setPtVariant('pt-BR');
                setPortugueseVariant('pt-BR');
                localStorage.setItem('selected-locale', 'pt');
                localStorage.setItem('pt-variant', 'pt-BR');
                i18n.changeLanguage('pt');
                window.location.href = `/pt`;
            } else if (value === 'pt-PT') {
                setLocale('pt');
                setPtVariant('pt-PT');
                setPortugueseVariant('pt-PT');
                localStorage.setItem('selected-locale', 'pt');
                localStorage.setItem('pt-variant', 'pt-PT');
                i18n.changeLanguage('pt');
                window.location.href = `/pt`;
            }
        },
        [i18n],
    );

    const getCurrentLocaleValue = () => {
        if (locale === 'en') return 'en';
        return locale === 'pt' && ptVariant === 'pt-BR' ? 'pt-BR' : 'pt-PT';
    };

    const getFullLocale = () => {
        if (locale === 'en') return 'en';
        return locale === 'pt' && ptVariant === 'pt-BR' ? 'pt-BR' : 'pt-PT';
    };

    const fullLocale = getFullLocale();

    return (
        <div className="bg-background text-foreground antialiased">
            <Header
                locale={getCurrentLocaleValue()}
                onLocaleChange={handleLocaleChange}
                theme={theme}
                onToggleTheme={toggleTheme}
                isAuthenticated={isAuthenticated}
            />
            <Hero locale={fullLocale} onOpenDemo={() => setShowDemo(true)} />
            <SocialProofStrip locale={fullLocale} />
            <TransformationDemo locale={fullLocale} />
            <TheNewStandard locale={fullLocale} />
            <HowItWorks locale={fullLocale} />
            <ProductShowcase locale={fullLocale} />
            <Integrations locale={fullLocale} />
            <SavingsCalculator
                locale={fullLocale}
                localeShort={locale}
                isAuthenticated={isAuthenticated}
            />
            <Pricing
                locale={fullLocale}
                isAuthenticated={isAuthenticated}
                localeShort={locale}
                plans={props.plans}
            />
            <FAQ locale={fullLocale} />
            <FinalCTA locale={fullLocale} localeShort={locale} />
            <Footer locale={locale} localeVariant={fullLocale} />
            {showDemo && (
                <DemoModal
                    onClose={() => setShowDemo(false)}
                    locale={locale}
                    onDemoComplete={() => {
                        setShowDemo(false);
                        router.visit(`/${locale}/register`);
                    }}
                />
            )}
        </div>
    );
}

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({
    locale,
    onLocaleChange,
    theme,
    onToggleTheme,
    isAuthenticated,
}: {
    locale: string;
    onLocaleChange: (value: string) => void;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
    isAuthenticated?: boolean;
}) {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { t } = useTranslation();
    const localeBase = locale.split('-')[0];
    const isPt = locale.startsWith('pt');

    const headerText = {
        features: t('landing.nav.product'),
        pricing: t('landing.nav.pricing'),
        api: isPt ? 'Docs da API' : 'API Docs',
        login: t('Login'),
        startFree: t('Get Started'),
        dashboard: t('Dashboard'),
    };

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const getLocaleFlag = (loc: string) => {
        if (loc === 'en') return '🇬🇧';
        if (loc === 'pt-BR') return '🇧🇷';
        return '🇵🇹';
    };

    const getLocaleLabel = (loc: string) => {
        if (loc === 'en') return 'English';
        if (loc === 'pt-BR') return 'Português (BR)';
        return 'Português (PT)';
    };

    return (
        <>
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className={`fixed top-0 z-50 w-full transition-all duration-300 ${
                    scrolled
                        ? 'border-b border-border bg-background/80 backdrop-blur-xl'
                        : 'bg-transparent'
                }`}
            >
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
                    <div className="flex items-center gap-8">
                        <motion.div
                            whileHover={{ scale: 1.04 }}
                            className="flex cursor-pointer items-center gap-2"
                            onClick={() =>
                                router.visit(`/${locale.split('-')[0]}`)
                            }
                        >
                            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-muted">
                                <img
                                    src="/docset.png"
                                    alt="Docset"
                                    width={32}
                                    height={32}
                                    className="h-full w-full object-contain"
                                />
                            </div>
                            <span className="text-lg font-bold">DOCSET</span>
                        </motion.div>

                        <nav className="hidden gap-6 text-sm md:flex">
                            <a
                                href="#features"
                                className="text-muted-foreground transition hover:text-foreground"
                            >
                                {headerText.features}
                            </a>
                            <a
                                href="#pricing"
                                className="text-muted-foreground transition hover:text-foreground"
                            >
                                {headerText.pricing}
                            </a>
                            <a
                                href={`/${localeBase}/docs/api-v1`}
                                className="text-muted-foreground transition hover:text-foreground"
                            >
                                {headerText.api}
                            </a>
                        </nav>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden items-center gap-3 md:flex">
                            <Select
                                value={locale}
                                onValueChange={onLocaleChange}
                            >
                                <SelectTrigger className="w-[140px] border-border bg-muted text-foreground">
                                    <SelectValue>
                                        <span className="flex items-center gap-2">
                                            <span>{getLocaleFlag(locale)}</span>
                                            <span className="text-sm">
                                                {
                                                    getLocaleLabel(
                                                        locale,
                                                    ).split(' ')[0]
                                                }
                                            </span>
                                        </span>
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="border-border bg-card">
                                    <SelectItem
                                        value="en"
                                        className="text-foreground"
                                    >
                                        <span className="flex items-center gap-2">
                                            🇬🇧 <span>English</span>
                                        </span>
                                    </SelectItem>
                                    <SelectItem
                                        value="pt-BR"
                                        className="text-foreground"
                                    >
                                        <span className="flex items-center gap-2">
                                            🇧🇷 <span>Português (BR)</span>
                                        </span>
                                    </SelectItem>
                                    <SelectItem
                                        value="pt-PT"
                                        className="text-foreground"
                                    >
                                        <span className="flex items-center gap-2">
                                            🇵🇹 <span>Português (PT)</span>
                                        </span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            {isAuthenticated ? (
                                <Button
                                    onClick={() =>
                                        router.visit(
                                            `/${locale.split('-')[0]}/dashboard`,
                                        )
                                    }
                                    className="bg-blue-500 text-white hover:bg-blue-600"
                                >
                                    {headerText.dashboard}
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        variant="ghost"
                                        onClick={() =>
                                            router.visit(
                                                `/${locale.split('-')[0]}/login`,
                                            )
                                        }
                                        className="text-foreground hover:bg-muted"
                                    >
                                        {headerText.login}
                                    </Button>
                                    <Button
                                        onClick={() =>
                                            router.visit(
                                                `/${locale.split('-')[0]}/register`,
                                            )
                                        }
                                        className="bg-white text-black hover:bg-gray-200"
                                    >
                                        {headerText.startFree}
                                    </Button>
                                </>
                            )}
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-foreground md:hidden"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <Menu className="h-6 w-6" />
                        </Button>
                    </div>
                </div>
            </motion.header>

            {mobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, x: '100%' }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed inset-0 z-[60] flex flex-col bg-muted/30 md:hidden"
                >
                    <div className="flex items-center justify-between border-b border-border p-6">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                                <img
                                    src="/docset.png"
                                    alt="Docset"
                                    width={32}
                                    height={32}
                                    className="h-full w-full object-contain"
                                />
                            </div>
                            <span className="text-lg font-bold">DOCSET</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-foreground"
                        >
                            <X className="h-6 w-6" />
                        </Button>
                    </div>

                    <div className="flex-1 space-y-8 overflow-y-auto p-6">
                        <nav className="flex flex-col gap-6 text-xl">
                            <a
                                href="#features"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-muted-foreground transition hover:text-foreground"
                            >
                                {headerText.features}
                            </a>
                            <a
                                href="#pricing"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-muted-foreground transition hover:text-foreground"
                            >
                                {headerText.pricing}
                            </a>
                            <a
                                href={`/${localeBase}/docs/api-v1`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-muted-foreground transition hover:text-foreground"
                            >
                                {headerText.api}
                            </a>
                        </nav>

                        <div className="space-y-6 border-t border-border pt-8">
                            <div className="space-y-3">
                                <p className="text-sm tracking-wider text-muted-foreground uppercase">
                                    Language
                                </p>
                                <div className="grid grid-cols-1 gap-2">
                                    {['en', 'pt-BR', 'pt-PT'].map((loc) => (
                                        <button
                                            key={loc}
                                            onClick={() => {
                                                onLocaleChange(loc);
                                                setMobileMenuOpen(false);
                                            }}
                                            className={`flex items-center gap-3 rounded-lg p-3 transition ${locale === loc ? 'bg-blue-500/10 text-blue-600' : 'text-muted-foreground hover:bg-muted'}`}
                                        >
                                            <span className="text-xl">
                                                {getLocaleFlag(loc)}
                                            </span>
                                            <span>{getLocaleLabel(loc)}</span>
                                            {locale === loc && (
                                                <Check className="ml-auto h-4 w-4" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 pt-4">
                                {isAuthenticated ? (
                                    <Button
                                        onClick={() =>
                                            router.visit(
                                                `/${locale.split('-')[0]}/dashboard`,
                                            )
                                        }
                                        className="h-12 w-full bg-blue-500 text-lg text-white hover:bg-blue-600"
                                    >
                                        {headerText.dashboard}
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                router.visit(
                                                    `/${locale.split('-')[0]}/login`,
                                                )
                                            }
                                            className="h-12 w-full border-border text-lg text-foreground hover:bg-muted"
                                        >
                                            {headerText.login}
                                        </Button>
                                        <Button
                                            onClick={() =>
                                                router.visit(
                                                    `/${locale.split('-')[0]}/register`,
                                                )
                                            }
                                            className="h-12 w-full bg-white text-lg text-black hover:bg-gray-200"
                                        >
                                            {headerText.startFree}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </>
    );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero({
    locale,
    onOpenDemo,
}: {
    locale: string;
    onOpenDemo: () => void;
}) {
    const pt = locale.startsWith('pt');

    const copy = pt
        ? {
          line1: 'Chega de digitar',
          line2: 'PDFs',
          line3: 'à mão.',
          sub: 'Chega de digitar PDFs à mão — o DocSet lê qualquer PDF, monta a tabela e exporta para Excel ou JSON. Sem código. Em segundos.',
          cta1: 'Criar conta grátis',
          cta2: 'Ver em 30 segundos',
          trust: 'Sem cartão de crédito. Cancele quando quiser.',
          }
        : {
              line1: 'Stop typing',
              line2: 'from PDFs',
              line3: 'by hand.',
              sub: 'Stop typing from PDFs by hand — DocSet reads any PDF, builds the table, and exports to Excel or JSON. No code. Done in seconds.',
              cta1: 'Start for free',
              cta2: 'See it in 30s',
              trust: 'No credit card required. Cancel anytime.',
          };

    return (
        <section className="relative overflow-hidden bg-background pt-28 pb-16 md:pt-36 md:pb-24">
            {/* Subtle grid */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:48px_48px]" />
            {/* Static glow */}
            <div className="pointer-events-none absolute top-0 left-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-blue-500/6 blur-[140px]" />

            <div className="relative mx-auto max-w-7xl px-4 md:px-6">
                <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16">
                    {/* ── Left: copy ── */}
                    <div className="text-center md:text-left">
                        {/* Main headline: stop typing / from PDFs / by hand. */}
                        <h1 className="mb-8 space-y-1 md:space-y-2">
                            <span className="sr-only">
                                {pt
                                    ? 'Conversor PDF para Excel e OCR de Notas'
                                    : 'PDF to Excel Converter and Invoice OCR'}
                            </span>
                            {/* Line 1: stop typing — Caveat handwriting */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <span
                                    className="block text-4xl leading-none text-foreground/80 md:text-5xl lg:text-6xl"
                                    style={{
                                        fontFamily: "'Caveat', cursive",
                                        fontWeight: 600,
                                    }}
                                >
                                    {copy.line1}
                                </span>
                            </motion.div>

                            {/* Line 2: from PDFs — strikethrough */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <span className="block text-4xl leading-none font-bold text-red-600/80 line-through decoration-red-400/60 decoration-[3px] md:text-5xl lg:text-6xl">
                                    {copy.line2}
                                </span>
                            </motion.div>

                            {/* Line 3: by hand. — marker highlight */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                <span className="relative inline-block text-4xl leading-none font-bold md:text-5xl lg:text-6xl">
                                    {/* Marker background */}
                                    <span
                                        className="absolute inset-0 rounded-sm bg-amber-300"
                                        style={{
                                            transform:
                                                'rotate(-0.8deg) scaleX(1.04) scaleY(1.08)',
                                        }}
                                    />
                                    {/* Hand-drawn underline SVG */}
                                    <svg
                                        className="absolute -bottom-2 left-0 w-full"
                                        viewBox="0 0 120 8"
                                        preserveAspectRatio="none"
                                        style={{ height: '8px' }}
                                        aria-hidden="true"
                                    >
                                        <motion.path
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 1 }}
                                            transition={{
                                                duration: 0.8,
                                                delay: 0.6,
                                                ease: 'easeOut',
                                            }}
                                            d="M3,5 Q30,2 60,5 Q90,8 117,4"
                                            stroke="#f59e0b"
                                            strokeWidth="2.5"
                                            fill="none"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <span className="relative z-10 px-1.5 text-zinc-900">
                                        {copy.line3}
                                    </span>
                                </span>
                            </motion.div>
                        </h1>

                        {/* Subheadline */}
                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="mx-auto mb-8 max-w-lg text-base leading-relaxed text-muted-foreground md:mx-0 md:text-lg"
                        >
                            {copy.sub}
                        </motion.p>

                        {/* CTAs */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="flex flex-col items-center gap-3 sm:flex-row sm:items-start md:justify-start"
                        >
                            <Button
                                size="lg"
                                onClick={() =>
                                    router.visit(
                                        `/${locale.split('-')[0]}/register`,
                                    )
                                }
                                className="h-12 w-full max-w-xs rounded-xl bg-white px-8 font-semibold text-black shadow-lg shadow-black/5 transition-all hover:scale-[1.02] hover:bg-gray-100 sm:h-14 sm:w-auto sm:max-w-none"
                            >
                                {copy.cta1}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={onOpenDemo}
                                className="h-12 w-full max-w-xs rounded-xl border-border bg-transparent px-8 font-semibold text-foreground hover:bg-muted sm:h-14 sm:w-auto sm:max-w-none"
                            >
                                <Play className="mr-2 h-4 w-4" />
                                {copy.cta2}
                            </Button>
                        </motion.div>

                        {/* Trust micro-text */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.65 }}
                            className="mt-4 text-sm text-gray-600"
                        >
                            {copy.trust}
                        </motion.p>
                    </div>

                    {/* ── Right: PDF extraction animation ── */}
                    <div className="px-2 sm:px-0">
                        <HeroPdfAnimation />
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── Social Proof Strip ───────────────────────────────────────────────────────
function SocialProofStrip({ locale }: { locale: string }) {
    const pt = locale.startsWith('pt');

    const roles = pt
        ? [
              { icon: '📊', label: 'Contadores' },
              { icon: '⚖️', label: 'Advogados' },
              { icon: '📈', label: 'Analistas' },
              { icon: '🏦', label: 'Finanças' },
              { icon: '🏢', label: 'Operações' },
          ]
        : [
              { icon: '📊', label: 'Accountants' },
              { icon: '⚖️', label: 'Lawyers' },
              { icon: '📈', label: 'Analysts' },
              { icon: '🏦', label: 'Finance teams' },
              { icon: '🏢', label: 'Operations' },
          ];

    return (
        <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="border-y border-border bg-muted/30 py-8"
        >
            <div className="mx-auto max-w-5xl px-4">
                <p className="mb-5 text-center text-xs tracking-widest text-gray-600 uppercase">
                    {pt
                        ? 'Já utilizado por profissionais de'
                        : 'Already saving hours for'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-5 md:gap-10">
                    {roles.map((role, i) => (
                        <motion.div
                            key={role.label}
                            initial={{ opacity: 0, y: 8 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3, delay: i * 0.08 }}
                            className="flex items-center gap-2 text-muted-foreground"
                        >
                            <span className="text-base">{role.icon}</span>
                            <span className="text-sm font-medium">
                                {role.label}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.section>
    );
}

// ─── Transformation Demo ──────────────────────────────────────────────────────
function TransformationDemo({ locale }: { locale: string }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });
    const [activeField, setActiveField] = useState(0);
    const pt = locale.startsWith('pt');

    const fields = [
        { key: 'invoice_number', value: 'INV-2024-001' },
        { key: 'date', value: '2024-01-15' },
        { key: 'vendor', value: 'Acme Corporation' },
        { key: 'total', value: '€12,450.00' },
        { key: 'tax', value: '€2,860.50' },
    ];

    useEffect(() => {
        if (isInView) {
            const interval = setInterval(() => {
                setActiveField((prev) => (prev + 1) % fields.length);
            }, 1500);
            return () => clearInterval(interval);
        }
    }, [isInView, fields.length]);

    return (
        <section ref={ref} className="relative bg-muted/30 py-20 md:py-28">
            <div className="pointer-events-none absolute top-0 left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

            <div className="mx-auto max-w-6xl px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-12 text-center"
                >
                    <h2 className="mb-3 text-2xl font-bold text-foreground md:text-3xl">
                        {pt
                            ? 'O que levava 47 minutos agora leva 4 segundos'
                            : 'What took 47 minutes now takes 4 seconds'}
                    </h2>
                    <p className="text-muted-foreground">
                        {pt
                            ? 'Veja a transformação acontecendo em tempo real'
                            : 'Watch the transformation happen in real-time'}
                    </p>
                </motion.div>

                <div className="grid items-center gap-6 md:grid-cols-2 md:gap-12">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="rounded-2xl border border-border bg-card p-5">
                            <div className="mb-4 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                    invoice_2024.pdf
                                </span>
                            </div>
                            <div className="space-y-3">
                                {fields.map((field, i) => (
                                    <motion.div
                                        key={field.key}
                                        animate={{
                                            backgroundColor:
                                                activeField === i
                                                    ? 'rgba(59,130,246,0.15)'
                                                    : 'rgba(255,255,255,0.03)',
                                        }}
                                        className={`rounded-lg p-3 ring-1 transition-all duration-300 ${activeField === i ? 'ring-blue-500/50' : 'ring-transparent'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground uppercase">
                                                {field.key.replace('_', ' ')}
                                            </span>
                                            {activeField === i && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="h-2 w-2 rounded-full bg-blue-400"
                                                />
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                        <div className="absolute top-1/2 -right-4 z-10 hidden -translate-y-1/2 md:block">
                            <motion.div
                                animate={{ x: [0, 8, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                <ArrowRight className="h-8 w-8 text-blue-600" />
                            </motion.div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <div className="rounded-2xl border border-emerald-500/20 bg-card p-5">
                            <div className="mb-4 flex items-center gap-2">
                                <FileJson className="h-5 w-5 text-emerald-400" />
                                <span className="text-sm text-muted-foreground">
                                    extracted_data.json
                                </span>
                                <Badge className="ml-auto bg-emerald-500/20 text-emerald-400">
                                    {pt ? 'Extraído' : 'Extracted'}
                                </Badge>
                            </div>
                            <div className="space-y-3 font-mono text-sm">
                                {fields.map((field, i) => (
                                    <motion.div
                                        key={field.key}
                                        initial={{ opacity: 0.3 }}
                                        animate={{
                                            opacity: activeField >= i ? 1 : 0.3,
                                            x: activeField === i ? 4 : 0,
                                        }}
                                        transition={{ duration: 0.3 }}
                                        className="flex items-center gap-3 rounded bg-muted px-3 py-2"
                                    >
                                        <span className="text-muted-foreground">
                                            "{field.key}":
                                        </span>
                                        <span className="text-emerald-400">
                                            "{field.value}"
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

// ─── The New Standard ─────────────────────────────────────────────────────────
function TheNewStandard({ locale }: { locale: string }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });
    const pt = locale.startsWith('pt');

    const metrics = [
        {
            value: 500,
            suffix: '+',
            label: pt
                ? 'faturas em uma pausa para café'
                : 'invoices in one coffee break',
            icon: FileText,
        },
        {
            value: 99.2,
            suffix: '%',
            label: pt
                ? 'precisão sem verificação manual'
                : 'accuracy without manual check',
            icon: CheckCircle,
        },
        {
            value: 0,
            suffix: '',
            label: pt ? 'escala ilimitada via API' : 'infinite scale via API',
            icon: Database,
            isInfinite: true,
        },
        {
            value: 100,
            suffix: '%',
            label: pt ? 'seus dados, seu controle' : 'your data, your control',
            icon: Shield,
        },
    ];

    return (
        <section ref={ref} className="relative bg-background py-20 md:py-28">
            <div className="pointer-events-none absolute top-0 left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            <div className="mx-auto max-w-7xl px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-12 text-center"
                >
                    <h2 className="mb-3 text-2xl font-bold text-foreground md:text-3xl">
                        {pt
                            ? 'O novo padrão para processamento de documentos'
                            : 'The new standard for document processing'}
                    </h2>
                    <p className="text-muted-foreground">
                        {pt
                            ? 'Velocidade, precisão e controle que você nunca experimentou'
                            : 'Speed, accuracy, and control you have never experienced'}
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
                    {metrics.map((metric, i) => (
                        <motion.div
                            key={metric.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.08 }}
                            whileHover={{ y: -4 }}
                            className="group rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:border-blue-500/30 hover:bg-muted"
                        >
                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 transition-colors group-hover:bg-blue-500/20">
                                <metric.icon className="h-5 w-5" />
                            </div>
                            <div className="mb-2 text-3xl font-bold text-foreground">
                                {metric.isInfinite ? (
                                    <span>∞</span>
                                ) : (
                                    <CountUp
                                        value={metric.value}
                                        isInView={isInView}
                                    />
                                )}
                                <span className="text-blue-600">
                                    {metric.suffix}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground md:text-sm">
                                {metric.label}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function CountUp({ value, isInView }: { value: number; isInView: boolean }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (isInView) {
            const duration = 1500;
            const steps = 30;
            const increment = value / steps;
            let current = 0;
            const timer = setInterval(() => {
                current += increment;
                if (current >= value) {
                    setCount(value);
                    clearInterval(timer);
                } else {
                    setCount(Math.floor(current * 10) / 10);
                }
            }, duration / steps);
            return () => clearInterval(timer);
        }
    }, [isInView, value]);

    return <>{count}</>;
}

// ─── How It Works ─────────────────────────────────────────────────────────────
// ─── Step mini-screen previews ───────────────────────────────────────────────
function UploadPreview() {
    const [pdfY, setPdfY] = useState(-40);
    const [dropped, setDropped] = useState(false);

    useEffect(() => {
        let raf: number;
        let start: number | null = null;
        const run = (now: number) => {
            if (!start) start = now;
            const p = Math.min((now - start) / 900, 1);
            const y = -40 + p * 70;
            setPdfY(y);
            if (p < 1) {
                raf = requestAnimationFrame(run);
            } else {
                setDropped(true);
                setTimeout(() => {
                    setDropped(false);
                    setPdfY(-40);
                    start = null;
                    raf = requestAnimationFrame(run);
                }, 1800);
            }
        };
        const t = setTimeout(() => {
            raf = requestAnimationFrame(run);
        }, 400);
        return () => {
            clearTimeout(t);
            cancelAnimationFrame(raf);
        };
    }, []);

    return (
        <div className="relative mx-auto mb-5 flex h-28 w-full max-w-[180px] flex-col items-center justify-center overflow-hidden rounded-xl border border-border bg-card">
            <div
                className={`absolute inset-3 rounded-lg border-2 border-dashed transition-colors duration-300 ${dropped ? 'border-blue-500/60 bg-blue-50' : 'border-border'}`}
            />
            <motion.div
                animate={{ y: pdfY, opacity: pdfY > -20 ? 1 : 0 }}
                transition={{ duration: 0 }}
                className="absolute z-10 flex flex-col items-center gap-1"
            >
                <div className="flex h-9 w-7 flex-col overflow-hidden rounded-sm border border-red-400/50 bg-muted shadow-lg">
                    <div className="h-2 bg-red-500/30" />
                    <div className="flex flex-1 flex-col gap-0.5 p-1">
                        <div className="h-0.5 rounded-full bg-muted" />
                        <div className="h-0.5 rounded-full bg-background/10" />
                        <div className="h-0.5 w-3/4 rounded-full bg-background/10" />
                    </div>
                </div>
            </motion.div>
            {dropped && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute bottom-4 flex items-center gap-1"
                >
                    <CheckCircle className="h-3 w-3 text-blue-600" />
                    <span className="text-[9px] text-blue-700">
                        PDF uploaded
                    </span>
                </motion.div>
            )}
        </div>
    );
}

function ExtractPreview() {
    const [scanY, setScanY] = useState(0);
    const [fields, setFields] = useState(0);
    const lineW = [85, 68, 90, 72, 80, 60];

    useEffect(() => {
        let raf: number;
        let start: number | null = null;
        const run = (now: number) => {
            if (!start) start = now;
            const p = Math.min((now - start) / 2000, 1) * 100;
            setScanY(p);
            setFields(Math.floor(p / 30));
            if (p < 100) {
                raf = requestAnimationFrame(run);
            } else {
                setTimeout(() => {
                    setScanY(0);
                    setFields(0);
                    start = null;
                    raf = requestAnimationFrame(run);
                }, 1500);
            }
        };
        const t = setTimeout(() => {
            raf = requestAnimationFrame(run);
        }, 300);
        return () => {
            clearTimeout(t);
            cancelAnimationFrame(raf);
        };
    }, []);

    return (
        <div className="mx-auto mb-5 grid h-28 w-full max-w-[180px] grid-cols-[1fr,20px,1fr] items-center gap-1 overflow-hidden rounded-xl border border-border bg-card p-2">
            <div className="relative space-y-1 overflow-hidden rounded-lg bg-muted p-2">
                {lineW.map((w, i) => {
                    const pos = (i / lineW.length) * 100;
                    const active = Math.abs(scanY - pos) < 18;
                    return (
                        <div
                            key={i}
                            className={`rounded-full transition-colors duration-100 ${active ? 'bg-blue-400/60' : 'bg-muted'}`}
                            style={{ height: '4px', width: `${w}%` }}
                        />
                    );
                })}
                <div
                    className="pointer-events-none absolute right-2 left-2 h-px"
                    style={{
                        top: `calc(${scanY * 0.72}% + 6px)`,
                        background:
                            'linear-gradient(to right, transparent, rgba(96,165,250,0.8), transparent)',
                    }}
                />
            </div>
            <ArrowRight className="h-3 w-3 text-blue-600/70" />
            <div className="space-y-1 rounded-lg bg-muted p-2">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        animate={i < fields ? { opacity: 1 } : { opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="rounded bg-muted px-1.5 py-0.5"
                    >
                        <div className="h-1.5 w-full rounded-full bg-blue-300/40" />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function ExportPreview() {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const cycle = () => {
            setStep(0);
            setTimeout(() => setStep(1), 800);
            setTimeout(() => setStep(2), 1600);
            setTimeout(() => setStep(0), 3200);
        };
        cycle();
        const interval = setInterval(cycle, 3400);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="mx-auto mb-5 flex h-28 w-full max-w-[180px] flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-3">
            <div className="space-y-1">
                {[
                    ['Vendor', 'Acme Corp.'],
                    ['Total', '€12,450'],
                    ['Tax', '€2,860'],
                ].map(([k, v]) => (
                    <div
                        key={k}
                        className="flex items-center justify-between rounded bg-muted px-2 py-0.5"
                    >
                        <span className="text-[8px] text-muted-foreground">{k}</span>
                        <span className="font-mono text-[8px] text-muted-foreground">
                            {v}
                        </span>
                    </div>
                ))}
            </div>
            <motion.div
                animate={
                    step === 0
                        ? { scale: 1, backgroundColor: 'rgba(59,130,246,0.15)' }
                        : step === 1
                          ? {
                                scale: 0.96,
                                backgroundColor: 'rgba(59,130,246,0.3)',
                            }
                          : { scale: 1, backgroundColor: 'rgba(34,197,94,0.2)' }
                }
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center gap-1 rounded-md border border-border py-1"
            >
                {step < 2 ? (
                    <>
                        <Download className="h-2.5 w-2.5 text-blue-600" />
                        <span className="text-[9px] text-blue-700">
                            Export .xlsx
                        </span>
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-1"
                    >
                        <CheckCircle className="h-2.5 w-2.5 text-green-600" />
                        <span className="text-[9px] text-green-300">
                            Downloaded!
                        </span>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}

function HowItWorks({ locale }: { locale: string }) {
    const pt = locale.startsWith('pt');

    const steps = [
        {
            num: '01',
            icon: Upload,
            title: pt ? 'Carregar' : 'Upload',
            desc: pt
                ? 'Arraste o PDF que está atrasando seu trabalho para a plataforma'
                : 'Drop the PDF that has been slowing you down',
        },
        {
            num: '02',
            icon: Sparkles,
            title: pt ? 'Extrair' : 'Extract',
            desc: pt
                ? 'O DocSet lê cada linha e monta uma tabela limpa e organizada'
                : 'DocSet reads every line and builds a clean, organized table',
        },
        {
            num: '03',
            icon: Download,
            title: pt ? 'Exportar' : 'Export',
            desc: pt
                ? 'Exporte para Excel ou JSON com um clique. Feito.'
                : 'Export to Excel or JSON in one click. Done.',
        },
    ];

    return (
        <section id="features" className="relative bg-muted/30 py-20 md:py-28">
            <div className="pointer-events-none absolute top-0 left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
            <div className="mx-auto max-w-5xl px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-12 text-center"
                >
                    <h2 className="mb-3 text-2xl font-bold text-foreground md:text-3xl">
                        {pt
                            ? 'Três passos. Sem curva de aprendizado.'
                            : 'Three steps. No learning curve.'}
                    </h2>
                    <p className="text-muted-foreground">
                        {pt
                            ? 'Simples o suficiente para usar hoje mesmo'
                            : 'Simple enough to use today, right now'}
                    </p>
                </motion.div>

                <div className="relative">
                    <div className="absolute top-20 right-0 left-0 hidden h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent md:block" />
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {steps.map((step, i) => (
                            <motion.div
                                key={step.num}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.12 }}
                                whileHover={{ y: -4 }}
                                className="relative rounded-2xl border border-border bg-card/40 p-6 text-center"
                            >
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl font-black text-foreground/4">
                                    {step.num}
                                </div>
                                {i === 0 && <UploadPreview />}
                                {i === 1 && <ExtractPreview />}
                                {i === 2 && <ExportPreview />}
                                <div className="relative z-10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted ring-1 ring-white/10">
                                    <step.icon className="h-5 w-5 text-blue-600" />
                                </div>
                                <h3 className="mb-2 text-lg font-bold text-foreground">
                                    {step.title}
                                </h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    {step.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── Product Showcase ─────────────────────────────────────────────────────────
function ProductShowcase({ locale }: { locale: string }) {
    const pt = locale.startsWith('pt');
    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);

    const screenshots = [
        {
            src: '/screenshot-2.png',
            alt: pt ? 'Dashboard DocSet' : 'DocSet Dashboard',
            label: 'Dashboard',
        },
        {
            src: '/screenshot-1.png',
            alt: pt ? 'Upload de documentos' : 'Document Upload',
            label: 'Upload',
        },
        {
            src: '/screenshot-3.png',
            alt: pt ? 'Definição de Campos' : 'Define Fields',
            label: pt ? 'Campos' : 'Fields',
        },
        {
            src: '/screenshot-4.png',
            alt: pt ? 'Revisão e Extração' : 'Review and Extract',
            label: pt ? 'Extração' : 'Extract',
        },
        {
            src: '/screenshot-5.png',
            alt: pt ? 'Relatórios Financeiros' : 'Financial Reports',
            label: pt ? 'Relatórios' : 'Reports',
        },
    ];

    useEffect(() => {
        if (paused) return;
        const interval = setInterval(() => {
            setActive((prev) => (prev + 1) % screenshots.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [paused, screenshots.length]);

    const goPrev = () => {
        setActive((p) => (p - 1 + screenshots.length) % screenshots.length);
        setPaused(true);
    };
    const goNext = () => {
        setActive((p) => (p + 1) % screenshots.length);
        setPaused(true);
    };

    return (
        <section className="relative bg-background py-20 md:py-28">
            <div className="pointer-events-none absolute top-0 left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent" />

            <div className="mx-auto max-w-6xl px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-10 text-center"
                >
                    <span className="mb-4 inline-block rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
                        {pt ? 'Plataforma' : 'Platform'}
                    </span>
                    <h2 className="mt-4 mb-3 text-2xl font-bold text-foreground md:text-3xl">
                        {pt ? 'Veja o DocSet em ação' : 'See DocSet in action'}
                    </h2>
                    <p className="text-muted-foreground">
                        {pt
                            ? 'Uma plataforma poderosa, simples de usar'
                            : 'A powerful platform, simple to use'}
                    </p>
                </motion.div>

                {/* Carousel */}
                <div
                    className="relative"
                    onMouseEnter={() => setPaused(true)}
                    onMouseLeave={() => setPaused(false)}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={active}
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.35, ease: 'easeInOut' }}
                        >
                            <BrowserFrame
                                src={screenshots[active].src}
                                alt={screenshots[active].alt}
                            />
                        </motion.div>
                    </AnimatePresence>

                    <button
                        onClick={goPrev}
                        className="absolute top-1/2 left-3 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/60 text-foreground backdrop-blur-sm transition hover:bg-background/10"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={goNext}
                        className="absolute top-1/2 right-3 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/60 text-foreground backdrop-blur-sm transition hover:bg-background/10"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>

                {/* Progress dots */}
                <div className="mt-5 flex items-center justify-center gap-2">
                    {screenshots.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                setActive(i);
                                setPaused(true);
                            }}
                            className={`rounded-full transition-all duration-300 ${
                                i === active
                                    ? 'h-1.5 w-6 bg-white'
                                    : 'h-1.5 w-1.5 bg-muted hover:bg-muted0'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── Integrations ─────────────────────────────────────────────────────────────
function Integrations({ locale }: { locale: string }) {
    const pt = locale.startsWith('pt');

    const integrations = [
        {
            icon: Cloud,
            title: 'Google Drive',
            desc: pt
                ? 'Importe documentos diretamente do Drive. Sincronização automática.'
                : 'Import documents directly from Drive. Automatic sync.',
            features: pt
                ? [
                      'Acesso direto aos arquivos',
                      'Processamento em lote',
                      'Sincronização automática',
                  ]
                : ['Direct file access', 'Batch processing', 'Automatic sync'],
            color: 'blue',
        },
        {
            icon: FileSpreadsheet,
            title: 'Google Sheets',
            desc: pt
                ? 'Exporte dados extraídos diretamente para planilhas.'
                : 'Export extracted data directly to spreadsheets.',
            features: pt
                ? [
                      'Exportação com um clique',
                      'Formatação automática',
                      'Colaboração em equipe',
                  ]
                : ['One-click export', 'Auto formatting', 'Team collaboration'],
            color: 'emerald',
        },
        {
            icon: Zap,
            title: 'Webhooks',
            desc: pt
                ? 'Receba notificações em tempo real quando uma extração for concluída.'
                : 'Get real-time notifications the moment an extraction completes.',
            features: pt
                ? [
                      'Eventos em tempo real',
                      'Payload configurável',
                      'Retry automático',
                  ]
                : [
                      'Real-time events',
                      'Configurable payload',
                      'Automatic retry',
                  ],
            color: 'violet',
        },
        {
            icon: Server,
            title: 'REST API',
            desc: pt
                ? 'Integre o DocSet diretamente nos seus sistemas via API REST documentada.'
                : 'Integrate DocSet directly into your systems via documented REST API.',
            features: pt
                ? [
                      'Autenticação via API key',
                      'Endpoints JSON',
                      'Documentação OpenAPI',
                  ]
                : ['API key authentication', 'JSON endpoints', 'OpenAPI docs'],
            color: 'orange',
        },
    ];

    return (
        <section id="api" className="relative bg-muted/30 py-20 md:py-28">
            <div className="pointer-events-none absolute top-0 left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-blue-500/15 to-transparent" />
            <div className="mx-auto max-w-6xl px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-12 text-center"
                >
                    <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
                        <Link className="h-3.5 w-3.5" />
                        {pt ? 'Integrações' : 'Integrations'}
                    </span>
                    <h2 className="mt-4 mb-3 text-2xl font-bold text-foreground md:text-3xl">
                        {pt
                            ? 'Conectado ao seu fluxo de trabalho'
                            : 'Connected to your workflow'}
                    </h2>
                    <p className="text-muted-foreground">
                        {pt
                            ? 'Configure uma vez, funcione para sempre'
                            : 'Set once, works forever'}
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {integrations.map((item, i) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.1 }}
                            whileHover={{ y: -4 }}
                            className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-border hover:bg-muted md:p-8"
                        >
                            <div
                                className={`mb-5 inline-flex rounded-2xl p-3 ${
                                    item.color === 'blue'
                                        ? 'bg-blue-500/10 text-blue-600'
                                        : item.color === 'emerald'
                                          ? 'bg-emerald-500/10 text-emerald-400'
                                          : item.color === 'violet'
                                            ? 'bg-violet-500/10 text-violet-400'
                                            : 'bg-orange-500/10 text-orange-400'
                                }`}
                            >
                                <item.icon className="h-7 w-7" />
                            </div>
                            <h3 className="mb-2 text-xl font-bold text-foreground">
                                {item.title}
                            </h3>
                            <p className="mb-5 text-muted-foreground">{item.desc}</p>
                            <ul className="space-y-2">
                                {item.features.map((feature) => (
                                    <li
                                        key={feature}
                                        className="flex items-center gap-2 text-sm text-muted-foreground"
                                    >
                                        <Check
                                            className={`h-4 w-4 ${
                                                item.color === 'blue'
                                                    ? 'text-blue-600'
                                                    : item.color === 'emerald'
                                                      ? 'text-emerald-400'
                                                      : item.color === 'violet'
                                                        ? 'text-violet-400'
                                                        : 'text-orange-400'
                                            }`}
                                        />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── Savings Calculator (standalone section) ───────────────────────────────────
function SavingsCalculator({
    locale,
    localeShort,
    isAuthenticated,
}: {
    locale: string;
    localeShort: string;
    isAuthenticated: boolean;
}) {
    const pt = locale.startsWith('pt');
    const [docCount, setDocCount] = useState(100);

    const hours = Math.round(((docCount * 5) / 60) * 10) / 10;
    const savings = Math.round(((docCount * 5) / 60) * 25);

    return (
        <section className="relative bg-background py-20 md:py-28">
            <div className="pointer-events-none absolute top-0 left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent" />

            <div className="mx-auto max-w-3xl px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <h2 className="mb-3 text-2xl font-bold text-foreground md:text-3xl">
                        {pt
                            ? 'Quanto os seus PDFs estão realmente a custar?'
                            : 'How much are your PDFs really costing you?'}
                    </h2>
                    <p className="mb-10 text-muted-foreground">
                        {pt
                            ? 'Deslize para ver o impacto real no seu dia a dia'
                            : 'Slide to see the real impact on your daily work'}
                    </p>

                    {/* Slider */}
                    <div className="mb-10 rounded-2xl border border-border bg-card p-6 md:p-8">
                        <label className="mb-3 block text-sm text-muted-foreground">
                            {pt ? 'Documentos por mês' : 'Documents per month'}:{' '}
                            <span className="font-semibold text-foreground">
                                {docCount}
                            </span>
                        </label>
                        <input
                            type="range"
                            min="10"
                            max="2000"
                            step="10"
                            value={docCount}
                            onChange={(e) =>
                                setDocCount(Number(e.target.value))
                            }
                            className="w-full accent-blue-500"
                        />
                        <div className="mt-2 flex justify-between text-xs text-gray-600">
                            <span>10</span>
                            <span>2 000</span>
                        </div>
                    </div>

                    {/* Result — big, emotional */}
                    <motion.div
                        key={docCount}
                        initial={{ opacity: 0.7, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.25 }}
                        className="mb-8 rounded-2xl border border-blue-500/20 bg-blue-50 p-6 md:p-10"
                    >
                        <p className="mb-6 text-sm text-muted-foreground">
                            {pt
                                ? `Com ${docCount} documentos por mês…`
                                : `With ${docCount} documents per month…`}
                        </p>

                        <div className="grid grid-cols-2 gap-4 md:gap-8">
                            <div>
                                <div className="text-4xl font-bold text-foreground md:text-5xl">
                                    {hours}h
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {pt
                                        ? 'desperdiçadas a digitar'
                                        : 'wasted typing manually'}
                                </p>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-blue-600 md:text-5xl">
                                    €{savings}
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {pt
                                        ? 'do seu tempo, todo mês'
                                        : 'of your time, every month'}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* CTA below calculator */}
                    <Button
                        size="lg"
                        onClick={() =>
                            router.visit(
                                isAuthenticated
                                    ? `/${localeShort}/dashboard`
                                    : `/${localeShort}/register`,
                            )
                        }
                        className="h-12 w-full rounded-xl bg-white px-8 font-semibold text-black hover:scale-[1.02] hover:bg-gray-100 sm:h-14 sm:w-auto"
                    >
                        {pt
                            ? 'Criar conta grátis — e recuperar esse tempo'
                            : 'Start free — and get that time back'}
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <p className="mt-3 text-sm text-gray-600">
                        {pt
                            ? 'Sem cartão de crédito. Primeiras extrações gratuitas.'
                            : 'No credit card. First extractions free.'}
                    </p>
                </motion.div>
            </div>
        </section>
    );
}

// ─── Pricing (plans only) ─────────────────────────────────────────────────────
interface Plan {
    id: string;
    name: string;
    display_name: string;
    tagline: string;
    description?: string;
    price: string | null;
    interval: string | null;
    features: string[];
    recommended: boolean;
    price_id: string | null;
    currency?: string;
}

function Pricing({
    locale,
    isAuthenticated,
    localeShort,
    plans,
}: {
    locale: string;
    isAuthenticated: boolean;
    localeShort: string;
    plans: any[];
}) {
    const { t } = useTranslation();
    const pt = locale.startsWith('pt');
    const plansData = plans || [];

    return (
        <section id="pricing" className="relative bg-muted/30 py-20 md:py-28">
            <div className="pointer-events-none absolute top-0 left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-blue-500/15 to-transparent" />
            <div className="mx-auto max-w-6xl px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-12 text-center"
                >
                    <h2 className="mb-3 text-2xl font-bold text-foreground md:text-3xl">
                        {t('landing.pricing.title')}
                    </h2>
                    <p className="text-muted-foreground">
                        {t('landing.pricing.subtitle')}
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {plansData.length === 0
                        ? Array.from({ length: 4 }).map((_, i) => (
                              <div
                                  key={i}
                                  className="h-[400px] animate-pulse rounded-2xl bg-muted"
                              />
                          ))
                        : plansData.map((plan, index) => {
                              const recommended =
                                  plan.recommended || plan.is_popular;
                              return (
                                  <motion.div
                                      key={plan.id}
                                      initial={{ opacity: 0, y: 20 }}
                                      whileInView={{ opacity: 1, y: 0 }}
                                      viewport={{ once: true }}
                                      transition={{ delay: index * 0.08 }}
                                      whileHover={{ y: -4 }}
                                      className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-300 ${
                                          recommended
                                              ? 'border-blue-200 bg-blue-50 shadow-lg shadow-blue-500/10'
                                              : 'border-border bg-card hover:border-border'
                                      }`}
                                  >
                                      {recommended && (
                                          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                              <Badge className="bg-blue-500 text-white">
                                                  {pt
                                                      ? 'Recomendado'
                                                      : 'Recommended'}
                                              </Badge>
                                          </div>
                                      )}
                                      <div className="mb-5">
                                          <h3 className="mb-1.5 text-lg font-bold text-foreground">
                                              {plan.display_name || plan.name}
                                          </h3>
                                          <p className="text-sm text-muted-foreground">
                                              {plan.tagline || plan.description}
                                          </p>
                                      </div>
                                      <div className="mb-5">
                                          <div className="flex items-baseline gap-1">
                                              <span className="text-3xl font-bold text-foreground">
                                                  {plan.price === null ||
                                                  plan.price === 0 ||
                                                  parseFloat(
                                                      String(plan.price),
                                                  ) === 0
                                                      ? new Intl.NumberFormat(
                                                            locale,
                                                            {
                                                                style: 'currency',
                                                                currency:
                                                                    plan.currency ||
                                                                    'EUR',
                                                            },
                                                        ).format(0)
                                                      : new Intl.NumberFormat(
                                                            locale,
                                                            {
                                                                style: 'currency',
                                                                currency:
                                                                    plan.currency,
                                                            },
                                                        ).format(plan.price)}
                                              </span>
                                              {plan.interval && (
                                                  <span className="text-muted-foreground">
                                                      /{t(plan.interval)}
                                                  </span>
                                              )}
                                          </div>
                                      </div>
                                      <div className="mb-5 flex-1 space-y-2">
                                          {plan.features?.map(
                                              (feature: string, i: number) => (
                                                  <div
                                                      key={i}
                                                      className="flex items-start gap-2 text-sm text-muted-foreground"
                                                  >
                                                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                                                      <span>{feature}</span>
                                                  </div>
                                              ),
                                          )}
                                      </div>
                                      <Button
                                          className={`mt-auto w-full ${recommended ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                                          onClick={() => {
                                              if (isAuthenticated) {
                                                  router.visit(
                                                      `/${localeShort}/settings/billing`,
                                                  );
                                              } else if (plan.price_id) {
                                                  router.visit(
                                                      `/${localeShort}/register?plan=${plan.price_id}&plan_name=${encodeURIComponent(plan.display_name || plan.name)}`,
                                                  );
                                              } else {
                                                  router.visit(
                                                      `/${localeShort}/register`,
                                                  );
                                              }
                                          }}
                                      >
                                          {parseFloat(
                                              String(plan.price).replace(
                                                  /[^0-9.]/g,
                                                  '',
                                              ) || '0',
                                          ) === 0
                                              ? t('Start free')
                                              : t('Get Started')}
                                      </Button>
                                  </motion.div>
                              );
                          })}
                </div>
                <p className="mt-8 text-center text-sm text-muted-foreground">
                    {t('landing.pricing.disclaimer')}
                </p>
            </div>
        </section>
    );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FAQ({ locale }: { locale: string }) {
    const pt = locale.startsWith('pt');
    const [openItem, setOpenItem] = useState<number | null>(null);

    const faqs = pt
        ? [
              {
                  q: 'Os meus dados estão seguros?',
                  a: 'Os documentos são processados exclusivamente para extração de dados. Nunca usamos os seus ficheiros para treinar modelos de IA, nunca partilhamos com terceiros e pode eliminar tudo a qualquer momento. Servidores na EU, conformidade GDPR.',
              },
              {
                  q: 'Preciso de saber programar?',
                  a: 'Não. Carregue o PDF, configure os campos uma vez e exporte. É isso. Sem linha de código, sem IT, sem fricção.',
              },
              {
                  q: 'Que tipos de ficheiros funcionam?',
                  a: 'PDF, JPG e PNG. Se consegue imprimir, o DocSet consegue ler. Tabelas, formulários, notas manuscritas, layouts complexos — tudo funciona.',
              },
              {
                  q: 'Existe um plano gratuito?',
                  a: 'Sim — comece grátis sem cartão de crédito. As primeiras extrações são gratuitas para experimentar sem compromisso.',
              },
              {
                  q: 'E se o meu PDF tiver tabelas ou layouts complexos?',
                  a: 'O DocSet lida com isso. Se algum campo não extrair perfeitamente, pode rever e corrigir antes de exportar — mantém sempre o controlo.',
              },
          ]
        : [
              {
                  q: 'Is my data safe?',
                  a: 'Documents are processed for extraction only. We never use your files to train AI models, never share them with third parties, and you can delete everything at any time. EU servers, full GDPR compliance.',
              },
              {
                  q: 'Do I need to know how to code?',
                  a: "No. Upload the PDF, configure your fields once, and export. That's it. No code, no IT department, no friction.",
              },
              {
                  q: 'What file types work?',
                  a: 'PDF, JPG, and PNG. If you can print it, DocSet can read it. Tables, forms, handwritten notes, complex layouts — all supported.',
              },
              {
                  q: 'Is there a free plan?',
                  a: 'Yes — start free, no credit card required. Your first extractions are free so you can try it without any commitment.',
              },
              {
                  q: 'What if my PDF has complex tables or layouts?',
                  a: "DocSet handles it. If any field doesn't extract perfectly, you can review and fix before exporting — you always stay in control.",
              },
          ];

    return (
        <section className="relative bg-muted/30 py-20 md:py-28">
            <div className="pointer-events-none absolute top-0 left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            <div className="mx-auto max-w-2xl px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-10 text-center"
                >
                    <h2 className="mb-3 text-2xl font-bold text-foreground md:text-3xl">
                        {pt
                            ? 'Perguntas frequentes'
                            : 'Frequently asked questions'}
                    </h2>
                    <p className="text-muted-foreground">
                        {pt
                            ? 'Respostas rápidas às dúvidas mais comuns'
                            : 'Quick answers to common questions'}
                    </p>
                </motion.div>

                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.35, delay: i * 0.07 }}
                        >
                            <Collapsible
                                open={openItem === i}
                                onOpenChange={(open) =>
                                    setOpenItem(open ? i : null)
                                }
                            >
                                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-5 py-4 text-left transition-all duration-200 hover:border-border hover:bg-muted">
                                    <span className="font-medium text-foreground">
                                        {faq.q}
                                    </span>
                                    <ChevronDown
                                        className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${openItem === i ? 'rotate-180' : ''}`}
                                    />
                                </CollapsibleTrigger>
                                <CollapsibleContent className="overflow-hidden">
                                    <div className="px-5 pt-2 pb-4 text-sm leading-relaxed text-muted-foreground">
                                        {faq.a}
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────
function FinalCTA({
    locale,
    localeShort,
}: {
    locale: string;
    localeShort: string;
}) {
    const pt = locale.startsWith('pt');

    const copy = pt
        ? {
              title: 'Pronto para parar de digitar PDFs na mão?',
              sub: 'Junte-se a milhares de contadores, analistas e equipas de operações que já recuperaram o seu tempo.',
              cta: 'Criar conta grátis',
              trust: 'Sem cartão de crédito. Cancele quando quiser.',
          }
        : {
              title: 'Ready to stop copying PDFs by hand?',
              sub: 'Join thousands of accountants, analysts, and operations teams who already got their time back.',
              cta: 'Start for free',
              trust: 'No credit card. Cancel anytime.',
          };

    return (
        <section className="relative overflow-hidden bg-background py-20 md:py-32">
            <div className="pointer-events-none absolute top-0 left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-blue-500/15 to-transparent" />
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-1/2 left-1/2 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/8 blur-[100px] md:h-[400px] md:w-[700px]" />
            </div>

            <div className="relative mx-auto max-w-2xl px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="mb-5 text-3xl font-bold text-foreground md:text-4xl">
                        {copy.title}
                    </h2>
                    <p className="mb-8 text-base leading-relaxed text-muted-foreground md:text-lg">
                        {copy.sub}
                    </p>
                    <Button
                        size="lg"
                        onClick={() => router.visit(`/${localeShort}/register`)}
                        className="h-12 w-full rounded-xl bg-white px-8 font-semibold text-black shadow-lg shadow-black/5 hover:scale-[1.02] hover:bg-gray-100 sm:h-14 sm:w-auto"
                    >
                        {copy.cta}
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <p className="mt-4 text-sm text-gray-600">{copy.trust}</p>
                </motion.div>
            </div>
        </section>
    );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({
    locale,
    localeVariant,
}: {
    locale: string;
    localeVariant: string;
}) {
    const { t } = useTranslation();
    const pt = localeVariant.startsWith('pt');
    const solutionLocale = localeVariant.startsWith('pt-')
        ? localeVariant.toLowerCase()
        : locale === 'pt'
          ? 'pt-pt'
          : 'en';

    return (
        <footer className="border-t border-border bg-muted/30 px-4 py-10 md:px-6 md:py-12">
            <div className="mx-auto max-w-7xl">
                <div className="mb-10 grid grid-cols-2 gap-6 md:grid-cols-6">
                    <div className="col-span-2 md:col-span-1">
                        <div className="mb-4 flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                                <img
                                    src="/docset.png"
                                    alt="Docset"
                                    width={24}
                                    height={24}
                                    className="h-6 w-6"
                                />
                            </div>
                            <span className="text-xl font-bold">DOCSET</span>
                        </div>
                        <p className="mb-6 text-sm text-muted-foreground">
                            {pt
                                ? 'Transforme PDFs em dados prontos para uso. Sem digitação manual.'
                                : 'Turn PDFs into ready-to-use data. No manual typing needed.'}
                        </p>
                    </div>

                    <div>
                        <h3 className="mb-4 font-semibold text-foreground">
                            {pt ? 'Produto' : 'Product'}
                        </h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <a
                                    href="#features"
                                    className="transition hover:text-foreground"
                                >
                                    {pt ? 'Funcionalidades' : 'Features'}
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#pricing"
                                    className="transition hover:text-foreground"
                                >
                                    {pt ? 'Preços' : 'Pricing'}
                                </a>
                            </li>
                            <li>
                                <a
                                    href={`/${locale}/docs/api-v1`}
                                    className="transition hover:text-foreground"
                                >
                                    {pt ? 'Docs da API' : 'API Docs'}
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 font-semibold text-foreground">
                            {pt ? 'Legal e Blog' : 'Legal & Blog'}
                        </h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <a
                                    href={`/${locale}/blog`}
                                    className="transition hover:text-foreground"
                                >
                                    Blog
                                </a>
                            </li>
                            <li>
                                <a
                                    href={`/${locale}/privacy`}
                                    className="transition hover:text-foreground"
                                >
                                    {t('Privacy Policy')}
                                </a>
                            </li>
                            <li>
                                <a
                                    href={`/${locale}/terms`}
                                    className="transition hover:text-foreground"
                                >
                                    {t('Terms of Service')}
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 font-semibold text-foreground">
                            {pt ? 'Soluções' : 'Solutions'}
                        </h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <a
                                    href={`/${solutionLocale}/invoice-ocr`}
                                    className="transition hover:text-foreground"
                                >
                                    {pt ? 'OCR de Faturas/Notas' : 'Invoice OCR'}
                                </a>
                            </li>
                            <li>
                                <a
                                    href={`/${solutionLocale}/receipt-ocr`}
                                    className="transition hover:text-foreground"
                                >
                                    {pt ? 'OCR de Recibos' : 'Receipt OCR'}
                                </a>
                            </li>
                            <li>
                                <a
                                    href={`/${solutionLocale}/pdf-to-excel`}
                                    className="transition hover:text-foreground"
                                >
                                    {pt ? 'PDF para Excel' : 'PDF to Excel'}
                                </a>
                            </li>
                            <li>
                                <a
                                    href={`/${solutionLocale}/ocr-api`}
                                    className="transition hover:text-foreground"
                                >
                                    {pt ? 'API OCR' : 'OCR API'}
                                </a>
                            </li>
                            <li>
                                <a
                                    href={`/${solutionLocale}/invoice-parser`}
                                    className="transition hover:text-foreground"
                                >
                                    {pt ? 'Parser de Faturas/Notas' : 'Invoice Parser'}
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 font-semibold text-foreground">
                            {pt ? 'Confiança' : 'Trust'}
                        </h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-green-600" />
                                {pt ? 'Conformidade GDPR' : 'GDPR Compliant'}
                            </li>
                            <li className="flex items-center gap-2">
                                <Lock className="h-4 w-4 text-blue-600" />
                                256-bit SSL
                            </li>
                            <li className="flex items-center gap-2">
                                <Server className="h-4 w-4 text-purple-400" />
                                {pt ? 'Dados armazenados na UE' : 'EU Data Storage'}
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
                    <p className="text-sm text-muted-foreground">
                        {pt
                            ? `© ${new Date().getFullYear()} Docset. Todos os direitos reservados.`
                            : `© ${new Date().getFullYear()} Docset. All rights reserved.`}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span>{pt ? 'Todos os sistemas operando' : 'All systems operational'}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

// ─── Demo Modal ───────────────────────────────────────────────────────────────
function DemoModal({
    onClose,
    locale,
    onDemoComplete,
}: {
    onClose: () => void;
    locale: string;
    onDemoComplete: () => void;
}) {
    const { t } = useTranslation();
    const [file, setFile] = useState<File | null>(null);
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const MAX_FILE_SIZE = 5 * 1024 * 1024;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.size > MAX_FILE_SIZE) {
                setError(t('File too large', { size: 5 }));
                setFile(null);
                e.target.value = '';
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleProcess = async () => {
        if (
            typeof window !== 'undefined' &&
            localStorage.getItem('docset_demo_used') === 'true'
        ) {
            toast.error(t('Demo already used. Please register to continue.'));
            setTimeout(() => {
                onClose();
                router.visit(`/${locale}/register`);
            }, 1500);
            return;
        }
        if (!file) return;
        if (file.size > MAX_FILE_SIZE) {
            setError(t('File too large', { size: 5 }));
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await fetch('/api/demo/extract', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
            });
            const data = await response.json();

            if (!response.ok) {
                if (response.status === 429) {
                    localStorage.setItem('docset_demo_used', 'true');
                    toast.error(
                        t('Demo already used. Please register to continue.'),
                    );
                    setTimeout(() => {
                        onClose();
                        router.visit(`/${locale}/register`);
                    }, 2500);
                    return;
                }
                if (
                    response.status === 422 &&
                    data.error === 'Page limit exceeded'
                ) {
                    setError(
                        t(
                            'Demo is limited to 2 pages. Please register for full access.',
                        ),
                    );
                    return;
                }
                throw new Error(data.message || t('document_processing_error'));
            }

            setResult(data.data);
            localStorage.setItem('docset_demo_used', 'true');
            toast.success(t('Data Extracted Successfully!'));
        } catch (error: any) {
            console.error('Demo extraction error:', error);
            setError(error.message || t('document_processing_error'));
            toast.error(error.message || t('document_processing_error'));
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-border bg-card text-foreground">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        {t('Try DocSet Demo')}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {t(
                            'Upload a document to see how DocSet extracts data automatically. This is a one-time free demo.',
                        )}
                    </DialogDescription>
                </DialogHeader>

                {!result ? (
                    <div className="space-y-6">
                        <div className="rounded-xl border-2 border-dashed border-border p-8 text-center transition-all hover:border-blue-200 md:p-12">
                            <Upload className="mx-auto mb-4 h-12 w-12 text-gray-600 md:h-16 md:w-16" />
                            <Input
                                type="file"
                                onChange={handleFileChange}
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="hidden"
                                id="demo-file"
                            />
                            <Label
                                htmlFor="demo-file"
                                className="cursor-pointer text-lg font-semibold text-blue-600 hover:text-blue-700"
                            >
                                {t('Click to upload')}
                            </Label>
                            <p className="mt-3 text-sm text-muted-foreground">
                                {t('PDF, JPG, PNG (max 10MB)')}
                            </p>
                            {file && (
                                <Badge className="mt-6 border-blue-500/30 bg-blue-500/20 px-4 py-2 text-sm text-blue-700">
                                    <FileText className="mr-2 h-4 w-4" />
                                    {file.name} (
                                    {(file.size / 1024 / 1024).toFixed(2)} MB)
                                </Badge>
                            )}
                            {error && (
                                <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                                    <p className="text-sm font-medium text-red-600">
                                        {error}
                                    </p>
                                </div>
                            )}
                        </div>
                        <Button
                            onClick={handleProcess}
                            disabled={!file || processing || !!error}
                            className="w-full bg-blue-500 text-white hover:bg-blue-600"
                            size="lg"
                        >
                            {processing ? (
                                <>
                                    <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                                    {t('Processing...')}
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-5 w-5" />
                                    {t('Extract Data')}
                                </>
                            )}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="rounded-xl border border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-6">
                            <div className="mb-6 flex items-center gap-3">
                                <CheckCircle className="h-10 w-10 text-green-500" />
                                <div>
                                    <h3 className="text-xl font-bold text-green-600">
                                        {t('Data Extracted Successfully!')}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {t('landing.howItWorks.steps.2.desc')}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {Object.entries(result).map(([key, value]) => (
                                    <div
                                        key={key}
                                        className="flex flex-col rounded-lg border border-border bg-muted p-4"
                                    >
                                        <span className="mb-1 font-medium text-muted-foreground capitalize">
                                            {key.replace('_', ' ')}
                                        </span>
                                        <div className="w-full">
                                            {Array.isArray(value) ? (
                                                <div className="mt-2 space-y-2">
                                                    {value.map((item, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="rounded border border-border bg-muted p-3 text-sm"
                                                        >
                                                            {typeof item ===
                                                                'object' &&
                                                            item !== null ? (
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {Object.entries(
                                                                        item,
                                                                    ).map(
                                                                        ([
                                                                            sk,
                                                                            sv,
                                                                        ]) => (
                                                                            <div
                                                                                key={
                                                                                    sk
                                                                                }
                                                                                className="flex flex-col"
                                                                            >
                                                                                <span className="text-xs text-muted-foreground uppercase">
                                                                                    {
                                                                                        sk
                                                                                    }
                                                                                </span>
                                                                                <span className="text-sm text-gray-200">
                                                                                    {String(
                                                                                        sv,
                                                                                    )}
                                                                                </span>
                                                                            </div>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-200">
                                                                    {String(
                                                                        item,
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : typeof value === 'object' &&
                                              value !== null ? (
                                                <div className="mt-2 rounded border border-border bg-muted p-3 text-sm">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {Object.entries(
                                                            value,
                                                        ).map(([sk, sv]) => (
                                                            <div
                                                                key={sk}
                                                                className="flex flex-col"
                                                            >
                                                                <span className="text-xs text-muted-foreground uppercase">
                                                                    {sk}
                                                                </span>
                                                                <span className="text-sm text-gray-200">
                                                                    {String(sv)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="block text-right font-bold text-foreground">
                                                    {String(value)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-6">
                            <p className="mb-2 font-medium text-blue-700">
                                {t('🎉 Demo completed!')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {t(
                                    'Register now to unlock unlimited document processing with advanced features.',
                                )}
                            </p>
                        </div>

                        <Button
                            onClick={onDemoComplete}
                            className="w-full bg-white text-black hover:bg-gray-200"
                            size="lg"
                        >
                            {t('Register to Continue')}
                            <ArrowRight className="ml-2" />
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
