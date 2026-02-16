import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import React, { useEffect, useState, useCallback, useRef, lazy, Suspense } from "react";

// Lazy-load the heavy R3F canvas — never runs on SSR
const DataBackground = typeof window !== "undefined"
  ? lazy(() => import("@/components/landing/DataBackground"))
  : null;
import { useTranslation } from "react-i18next";
import { router, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { setPortugueseVariant } from "@/i18n/config";
import SEOHead from "@/components/seo/SEOHead";
import { getSEOContent, generateStructuredData, getAlternateLocales } from "@/utils/seo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  FileText,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Code,
  Database,
  FileJson,
  Globe2,
  TrendingUp,
  Download,
  Eye,
  Check,
  Server,
  Calendar,
  Menu,
  ChevronDown,
  Play,
  X,
  Settings,
  Lock,
  Layers,
  Receipt,
  IdCard,
  FileSpreadsheet,
  FileCode,
  Cloud,
  Link,
} from "lucide-react";
import { toast } from "sonner";


// ── Data Pipeline Divider — animated connector between sections ──────────────
function PipelineDivider() {
  return (
    <div className="relative h-16 overflow-hidden flex items-center justify-center pointer-events-none select-none" aria-hidden>
      <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="30%" stopColor="#3b82f6" />
            <stop offset="70%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="url(#pg)" strokeWidth="1" strokeDasharray="4 8">
          <animate attributeName="stroke-dashoffset" from="0" to="-60" dur="1.5s" repeatCount="indefinite" />
        </line>
      </svg>
      <div className="relative z-10 flex items-center gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="w-1 h-1 rounded-full bg-blue-400"
            animate={{ opacity: [0.1, 0.7, 0.1], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.4, delay: i * 0.22, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>
    </div>
  );
}

// Fallbacks removed to use direct translation keys

export default function Welcome() {
  const { t, i18n } = useTranslation();
  const { props } = usePage<{ auth?: { user?: any }; canRegister: boolean; locale: string; plans: any[] }>();
  const isAuthenticated = !!props.auth?.user;
    const [locale, setLocale] = useState<'pt' | 'en'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selected-locale') as 'pt' | 'en' | null;
      if (saved) return saved;
    }
    // Idioma padrão: inglês
    return props.locale === 'pt' ? 'pt' : 'en';
  });
  const [ptVariant, setPtVariant] = useState<'pt-PT' | 'pt-BR'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pt-variant') as 'pt-PT' | 'pt-BR' | null;
      return saved ?? 'pt-PT';
    }
    return 'pt-PT';
  });
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      document.documentElement.classList.add('dark');
    }

    const currentUrlLocale = props.locale as 'pt' | 'en';
    const savedLocale = localStorage.getItem('selected-locale') as 'pt' | 'en' | null;

    // Se estamos na rota raiz (/) e temos preferência salva diferente do padrão
    if (window.location.pathname === '/' && savedLocale && savedLocale !== currentUrlLocale) {
      // Redirecionar para a URL com o idioma preferido
      window.location.href = `/${savedLocale}`;
      return;
    }

    if (currentUrlLocale && currentUrlLocale !== locale) {
      setLocale(currentUrlLocale);
      i18n.changeLanguage(currentUrlLocale);
    }
  }, [props.locale]);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  }, [theme]);

  useEffect(() => {
    if (locale === 'pt') {
      setPortugueseVariant(ptVariant);
    }
  }, [locale, ptVariant]);

  const handleLocaleChange = useCallback((value: string) => {
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
  }, [i18n]);

  const getCurrentLocaleValue = () => {
    if (locale === 'en') return 'en';
    return locale === 'pt' && ptVariant === 'pt-BR' ? 'pt-BR' : 'pt-PT';
  };

  const getFullLocale = () => {
    if (locale === 'en') return 'en';
    return locale === 'pt' && ptVariant === 'pt-BR' ? 'pt-BR' : 'pt-PT';
  };

  const fullLocale = getFullLocale();
  const seoContent = getSEOContent(fullLocale);
  const structuredData = generateStructuredData(fullLocale);
  const alternateLocales = getAlternateLocales(fullLocale);

  return (
    <div className="bg-black text-white antialiased">
      <SEOHead
        title={seoContent.title}
        description={seoContent.description}
        keywords={seoContent.keywords}
        locale={fullLocale}
        alternateLocales={alternateLocales}
        structuredData={structuredData}
        ogType="website"
      />
      <Header
        locale={getCurrentLocaleValue()}
        onLocaleChange={handleLocaleChange}
        theme={theme}
        onToggleTheme={toggleTheme}
        isAuthenticated={isAuthenticated}
      />
      <Hero locale={fullLocale} onOpenDemo={() => setShowDemo(true)} />
      <TrustSignals />
      <PipelineDivider />
      <UseCases />
      <PipelineDivider />
      <ProductFlow locale={fullLocale} />
      <PipelineDivider />
      <GoogleIntegrations locale={fullLocale} />
      <Features locale={fullLocale} />
      <PipelineDivider />
      <CodeExample locale={fullLocale} onOpenDemo={() => setShowDemo(true)} />
      <Pricing locale={fullLocale} isAuthenticated={isAuthenticated} localeShort={locale} plans={props.plans} />
      <FinalCTA locale={fullLocale} />
      <Footer locale={locale} />
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

  const getHeaderText = () => {
    return {
      features: t('landing.nav.product'),  // Mapping generic features to product as per json
      pricing: t('landing.nav.pricing'),
      api: t('API'),
      login: t('Login'),
      startFree: t('Get Started'),
      dashboard: t('Dashboard')
    };
  };

  const headerText = getHeaderText();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
        initial={{ y: 0, opacity: 1 }}
        animate={{ y: 0, opacity: 1 }}
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-black/80 backdrop-blur-xl border-b border-white/10" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => router.visit(`/${locale.split('-')[0]}`)}
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white/10">
                <img
                  src="/docset.png"
                  alt="Docset"
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="font-bold text-lg">DOCSET</span>
            </motion.div>

            <nav className="hidden md:flex gap-6 text-sm">
              <a href="#features" className="text-gray-400 hover:text-white transition">{headerText.features}</a>
              <a href="#pricing" className="text-gray-400 hover:text-white transition">{headerText.pricing}</a>
              <a href="#api" className="text-gray-400 hover:text-white transition">{headerText.api}</a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3">
              <Select value={locale} onValueChange={onLocaleChange}>
                <SelectTrigger className="w-[160px] bg-white/5 border-white/10 text-white">
                  <SelectValue>
                    <span className="flex items-center gap-2">
                      <span>{getLocaleFlag(locale)}</span>
                      <span className="text-sm">{getLocaleLabel(locale).split(' ')[0]}</span>
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  <SelectItem value="en" className="text-white">
                    <span className="flex items-center gap-2">
                      🇬🇧 <span>English</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="pt-BR" className="text-white">
                    <span className="flex items-center gap-2">
                      🇧🇷 <span>Português (BR)</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="pt-PT" className="text-white">
                    <span className="flex items-center gap-2">
                      🇵🇹 <span>Português (PT)</span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>

              {isAuthenticated ? (
                <Button
                  onClick={() => router.visit(`/${locale.split('-')[0]}/dashboard`)}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {headerText.dashboard}
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => router.visit(`/${locale.split('-')[0]}/login`)}
                    className="text-white hover:bg-white/10"
                  >
                    {headerText.login}
                  </Button>
                  <Button
                    onClick={() => router.visit(`/${locale.split('-')[0]}/register`)}
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
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 1, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-zinc-950 flex flex-col md:hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <FileJson className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-lg">DOCSET</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <nav className="flex flex-col gap-6 text-xl">
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-400 hover:text-white transition"
                >
                  {headerText.features}
                </a>
                <a
                  href="#pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-400 hover:text-white transition"
                >
                  {headerText.pricing}
                </a>
                <a
                  href="#api"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-400 hover:text-white transition"
                >
                  {headerText.api}
                </a>
              </nav>

              <div className="space-y-6 pt-8 border-t border-white/10">
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 uppercase tracking-wider">Language</p>
                  <div className="grid grid-cols-1 gap-2">
                    {['en', 'pt-BR', 'pt-PT'].map((loc) => (
                      <button
                        key={loc}
                        onClick={() => {
                          onLocaleChange(loc);
                          setMobileMenuOpen(false);
                        }}
                        className={`flex items-center gap-3 p-3 rounded-lg transition ${
                          locale === loc ? 'bg-blue-500/10 text-blue-400' : 'text-gray-400 hover:bg-white/5'
                        }`}
                      >
                        <span className="text-xl">{getLocaleFlag(loc)}</span>
                        <span>{getLocaleLabel(loc)}</span>
                        {locale === loc && <Check className="ml-auto h-4 w-4" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  {isAuthenticated ? (
                    <Button
                      onClick={() => router.visit(`/${locale.split('-')[0]}/dashboard`)}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white h-12 text-lg"
                    >
                      {headerText.dashboard}
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => router.visit(`/${locale.split('-')[0]}/login`)}
                        className="w-full text-white border-white/10 hover:bg-white/5 h-12 text-lg"
                      >
                        {headerText.login}
                      </Button>
                      <Button
                        onClick={() => router.visit(`/${locale.split('-')[0]}/register`)}
                        className="w-full bg-white text-black hover:bg-gray-200 h-12 text-lg"
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
      </AnimatePresence>
    </>
  );
}

function Hero({ locale, onOpenDemo }: { locale: string; onOpenDemo: () => void }) {
  const { t } = useTranslation();
  const { scrollY } = useScroll();

  // Only mount heavy WebGL canvas on non-mobile
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Multi-layer parallax — each element moves at a different speed
  const bgY = useTransform(scrollY, [0, 800], [0, -200]);
  const textY = useTransform(scrollY, [0, 500], [0, -90]);
  const textOpacity = useTransform(scrollY, [0, 380], [1, 0]);
  const screenshotY = useTransform(scrollY, [0, 700], [0, 40]);
  const screenshotOpacity = useTransform(scrollY, [150, 700], [1, 0.35]);

  const pt = locale.startsWith('pt');
  const trustText = pt
    ? 'Sem cartão de crédito. Plano gratuito para começar.'
    : 'No credit card required. Free plan to get started.';

  // Localized headline lines
  const line1 = pt ? 'Chega de' : 'Stop typing';
  const line2 = pt ? 'digitar PDFs' : 'from PDFs';
  const line3 = pt ? 'à mão.' : 'by hand.';

  return (
    <section className="relative bg-black overflow-hidden min-h-screen flex flex-col selection:bg-blue-500/30">
      {/* ── R3F 3D particle scene — desktop only (skip WebGL cost on mobile) ── */}
      {DataBackground && isDesktop && (
        <Suspense fallback={null}>
          <DataBackground />
        </Suspense>
      )}

      {/* Mobile-only CSS gradient background (replaces WebGL canvas) */}
      {!isDesktop && (
        <div className="absolute inset-0 pointer-events-none md:hidden">
          <motion.div
            animate={{ opacity: [0.5, 0.75, 0.5], scale: [1, 1.08, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[140vw] h-[55vw] rounded-full bg-blue-700/15 blur-[90px]"
          />
          <motion.div
            animate={{ opacity: [0.3, 0.55, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-[15%] left-[20%] w-[60vw] h-[40vw] rounded-full bg-cyan-600/10 blur-[70px]"
          />
        </div>
      )}

      {/* Radial vignette — darkens edges so text stays readable over the canvas */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_85%_70%_at_50%_30%,transparent_40%,rgba(0,0,0,0.75)_100%)]" />

      {/* Subtle CSS top-center glow to complement the 3D scene */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[80vw] h-[50vh] rounded-full bg-blue-600/10 blur-[140px]" />
      </motion.div>

      {/* Fine grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_80%_55%_at_50%_0%,#000_55%,transparent_100%)] pointer-events-none" />

      {/* ── TEXT BLOCK — fades + rises on scroll ── */}
      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 pt-24 sm:pt-28 md:pt-36 max-w-6xl mx-auto w-full"
      >
        {/* Eyebrow pill */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs text-gray-400 mb-10">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shrink-0" />
            {t('landing.hero.eyebrow')}
          </div>
        </motion.div>

        {/* ── MASSIVE HEADLINE ── */}
        <h1
          className="font-black leading-[0.9] tracking-tighter overflow-hidden"
          style={{ fontSize: 'clamp(2.5rem, 6.5vw, 6.5rem)' }}
        >
          {/* Line 1 — dimmed, whisper */}
          <div className="overflow-hidden">
            <motion.span
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.65, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="block text-white/25"
            >
              {line1}
            </motion.span>
          </div>

          {/* Line 2 — full white, the hero */}
          <div className="overflow-hidden">
            <motion.span
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.65, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="block text-white"
            >
              {line2}
            </motion.span>
          </div>

          {/* Line 3 — gradient accent */}
          <div className="overflow-hidden">
            <motion.span
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.65, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400"
            >
              {line3}
            </motion.span>
          </div>
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.52 }}
          className="mt-8 text-lg md:text-xl text-zinc-400 leading-relaxed max-w-xl mx-auto"
        >
          {t('landing.hero.subtitle')}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.68 }}
          className="mt-9 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
        >
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
            <Button
              size="lg"
              onClick={() => router.visit(`/${locale}/register`)}
              className="w-full sm:w-auto bg-white text-black hover:bg-gray-100 px-9 h-12 text-base font-bold rounded-xl shadow-[0_0_60px_-8px_rgba(255,255,255,0.25)] transition-shadow hover:shadow-[0_0_80px_-8px_rgba(255,255,255,0.4)]"
            >
              {t('landing.hero.cta_primary')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              onClick={onOpenDemo}
              className="w-full sm:w-auto border-white/12 bg-white/5 hover:bg-white/10 text-white px-9 h-12 text-base font-semibold backdrop-blur-sm rounded-xl"
            >
              <Play className="mr-2 h-4 w-4 fill-current" />
              {t('landing.hero.cta_secondary')}
            </Button>
          </motion.div>
        </motion.div>

        {/* Trust text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-5 text-sm text-gray-600"
        >
          {trustText}
        </motion.p>
      </motion.div>

      {/* ── SCREENSHOT — independent parallax layer ── */}
      <motion.div
        style={{ y: screenshotY, opacity: screenshotOpacity }}
        initial={{ opacity: 0, y: 70 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mt-10 md:mt-16 mx-auto w-full max-w-5xl px-3 sm:px-6 pb-0"
      >
        {/* Ambient glow beneath the screenshot */}
        <div className="absolute -inset-6 bg-blue-500/12 rounded-[60px] blur-[90px] pointer-events-none" />

        {/* App window frame */}
        <div className="relative z-10 rounded-2xl border border-white/10 bg-zinc-950 shadow-[0_50px_120px_-20px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.05)] overflow-hidden">
          {/* Browser chrome */}
          <div className="flex items-center gap-3 px-4 py-3 bg-zinc-900/90 border-b border-white/8">
            <div className="flex gap-1.5 shrink-0">
              <div className="w-3 h-3 rounded-full bg-red-500/55" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/55" />
              <div className="w-3 h-3 rounded-full bg-green-500/55" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-white/5 border border-white/8 rounded-md px-4 py-1 text-[11px] text-gray-500 font-mono flex items-center gap-2 max-w-[260px] w-full justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0 animate-pulse" />
                app.docset.io — Review &amp; Save
              </div>
            </div>
            <div className="w-16 shrink-0" />
          </div>

          <img
            src="/Screenshot%202026-02-04%20095031.png"
            alt="Docset — Extracted invoice data ready to review"
            className="w-full block"
          />
        </div>

        {/* Floating badge — fields detected */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ delay: 1.05, type: "spring", stiffness: 180 }}
          className="absolute -right-2 sm:-right-8 top-14 z-20 bg-zinc-900/95 backdrop-blur-md border border-green-500/30 rounded-2xl px-4 py-3 shadow-2xl shadow-green-500/10 hidden sm:flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-xl bg-green-500/15 flex items-center justify-center shrink-0">
            <CheckCircle className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-white leading-none mb-0.5">
              18 {pt ? 'campos detectados' : 'fields detected'}
            </div>
            <div className="text-[10px] text-gray-400">{pt ? 'Pronto para rever' : 'Ready to review'}</div>
          </div>
        </motion.div>

        {/* Floating badge — exported */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: -20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ delay: 1.25, type: "spring", stiffness: 180 }}
          className="absolute -left-2 sm:-left-8 bottom-8 z-20 bg-zinc-900/95 backdrop-blur-md border border-emerald-500/30 rounded-2xl px-4 py-3 shadow-2xl shadow-emerald-500/10 hidden sm:flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-white leading-none mb-0.5">
              {pt ? 'Exportado para Sheets' : 'Exported to Sheets'}
            </div>
            <div className="text-[10px] text-gray-400">{pt ? '5 faturas · agora' : '5 invoices · just now'}</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom gradient — blends into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent pointer-events-none z-20" />
    </section>
  );
}



function TrustSignals() {
  const { t } = useTranslation();
  const trust = t('landing.trust', { returnObjects: true }) as any;
  const iconMap: Record<string, any> = {
    shield: Shield,
    lock: Lock,
    server: Server,
  };

  return (
    <section className="py-10 border-y border-white/5 bg-zinc-950/80 backdrop-blur-sm relative z-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
           initial={{ opacity: 0, y: 16 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, margin: "-60px" }}
           transition={{ duration: 0.5 }}
           className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8"
        >
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
               {trust.badges && Array.isArray(trust.badges) ? (
                 trust.badges.map((badge: any, i: number) => {
                   const Icon = iconMap[badge.icon] || Shield;
                   const colors = ['text-green-400', 'text-blue-400', 'text-purple-400'];
                   return (
                     <div key={i} className="flex items-center gap-2 text-gray-400 bg-white/[0.04] hover:bg-white/[0.07] px-4 py-2 rounded-full border border-white/8 transition-colors">
                       <Icon className={`w-3.5 h-3.5 ${colors[i] || 'text-gray-400'}`} />
                       <span className="text-xs font-medium tracking-wide">{badge.title}</span>
                     </div>
                   );
                 })
               ) : (
                 <>
                   <div className="flex items-center gap-2 text-gray-400 bg-white/[0.04] px-4 py-2 rounded-full border border-white/8">
                      <Shield className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-xs font-medium">{trust.badges?.gdpr || 'GDPR Compliant'}</span>
                   </div>
                   <div className="flex items-center gap-2 text-gray-400 bg-white/[0.04] px-4 py-2 rounded-full border border-white/8">
                      <Lock className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-xs font-medium">{trust.badges?.encrypted || 'Encrypted Data'}</span>
                   </div>
                   <div className="flex items-center gap-2 text-gray-400 bg-white/[0.04] px-4 py-2 rounded-full border border-white/8">
                      <Server className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-xs font-medium">{trust.badges?.no_training || 'Privacy Protected'}</span>
                   </div>
                 </>
               )}
            </div>

            <div className="flex items-center gap-2 text-gray-600 text-xs font-mono">
                <span className="hidden lg:block opacity-40 uppercase tracking-widest text-[10px]">Exports</span>
                <span className="hidden lg:block opacity-20">·</span>
                <div className="flex flex-wrap gap-3 md:gap-4">
                    <span className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 transition-colors cursor-default" title="Excel / CSV"><FileSpreadsheet className="w-3.5 h-3.5" /> XLS/CSV</span>
                    <span className="flex items-center gap-1.5 text-gray-500 hover:text-emerald-400 transition-colors cursor-default" title="Google Sheets"><FileSpreadsheet className="w-3.5 h-3.5" /> Sheets</span>
                    <span className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 transition-colors cursor-default" title="JSON"><FileJson className="w-3.5 h-3.5" /> JSON</span>
                    <span className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 transition-colors cursor-default" title="XML"><FileCode className="w-3.5 h-3.5" /> XML</span>
                </div>
            </div>
        </motion.div>
      </div>
    </section>
  );
}

function UseCases() {
  const { t } = useTranslation();
  const content = t('landing.useCases', { returnObjects: true }) as any;
  const icons = [FileText, Receipt, IdCard, TrendingUp];

  return (
    <section className="py-14 md:py-32 bg-zinc-950 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(59,130,246,0.04),transparent_70%)]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.55 }}
                >
                  <h2 className="text-3xl md:text-5xl font-bold mb-5 text-white">{content.title}</h2>
                  <p className="text-lg text-gray-500 max-w-2xl mx-auto">{content.subtitle}</p>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {content.items.map((item: any, i: number) => {
                    const Icon = icons[i] || FileText;
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{ delay: i * 0.08, duration: 0.5 }}
                            className="bg-zinc-900/40 border border-white/8 p-6 rounded-2xl hover:bg-zinc-900/70 transition-all duration-300 group hover:border-blue-500/25 hover:shadow-lg hover:shadow-blue-500/5 flex flex-col"
                        >
                            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                                <Icon className="w-5 h-5 text-blue-400" />
                            </div>
                            <h3 className="text-base font-bold mb-3 text-white">{item.title}</h3>

                            {item.problem && (
                              <div className="mb-3 p-3 bg-red-500/5 border border-red-500/15 rounded-lg">
                                <p className="text-xs text-red-200/70">{item.problem}</p>
                              </div>
                            )}

                            {item.solution && (
                              <p className="text-sm text-gray-500 leading-relaxed mb-3">{item.solution}</p>
                            )}

                            {item.benefit && (
                              <div className="mt-auto p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-lg">
                                <p className="text-xs font-medium text-emerald-300/80">✓ {item.benefit}</p>
                              </div>
                            )}

                            {!item.problem && !item.solution && item.desc && (
                              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    </section>
  );
}

function ProductFlow({ locale }: { locale: string }) {
  const { t } = useTranslation();
  const getProductFlowText = () => {
    return {
        badge: t('landing.howItWorks.title'),
        title: t('landing.howItWorks.subtitle'),
        steps: [
            { step: "01", title: t('landing.howItWorks.steps.0.title'), description: t('landing.howItWorks.steps.0.desc') },
            { step: "02", title: t('landing.howItWorks.steps.2.title'), description: t('landing.howItWorks.steps.2.desc') },
            { step: "03", title: t('landing.howItWorks.steps.3.title'), description: t('landing.howItWorks.steps.3.desc') },
        ]
    };
  };

  const flowText = getProductFlowText();
  const iconMap = [Upload, Eye, Database];
  const screenshots = [
    '/Screenshot%202026-02-04%20094931.png',
    '/Screenshot%202026-02-04%20094945.png',
    '/Screenshot%202026-02-04%20095346.png',
  ];

  return (
    <section className="py-14 md:py-32 relative overflow-hidden bg-black">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-gray-400 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            {flowText.badge}
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white">
            {flowText.title}
          </h2>
        </motion.div>

        {/* Step connector — animated dashed line visible only on desktop */}
        <div className="hidden md:block relative h-0 mb-0 pointer-events-none" style={{ marginTop: '-2.5rem', marginBottom: '2.5rem' }}>
          <svg className="absolute left-1/2 -translate-x-1/2 w-[66%]" height="2" xmlns="http://www.w3.org/2000/svg">
            <motion.line
              x1="0" y1="1" x2="100%" y2="1"
              stroke="#3b82f6" strokeWidth="1"
              strokeDasharray="6 6"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.35 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
          </svg>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-6">
          {flowText.steps.map((item, i) => (
            <React.Fragment key={item.step}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.12, duration: 0.55 }}
                className="relative"
              >
                <div className="bg-gradient-to-b from-white/[0.04] to-transparent border border-white/8 rounded-2xl p-5 sm:p-6 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 flex flex-col h-full group">
                  {/* Step number — top-right watermark */}
                  <div className="absolute top-4 right-5 text-5xl font-black text-white/5 leading-none select-none">{item.step}</div>

                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center mb-4 group-hover:bg-blue-500/25 transition-colors">
                    {React.createElement(iconMap[i], { className: "w-5 h-5 text-blue-400" })}
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4 sm:mb-5">{item.description}</p>
                  <div className="rounded-xl overflow-hidden border border-white/8 mt-auto ring-1 ring-white/5">
                    <img
                      src={screenshots[i]}
                      alt={item.title}
                      className="w-full block opacity-55 group-hover:opacity-85 transition-opacity duration-500"
                    />
                  </div>
                </div>

                {/* Arrow between steps — desktop horizontal */}
                {i < flowText.steps.length - 1 && (
                  <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-blue-500/40" />
                  </div>
                )}
              </motion.div>

              {/* Mobile: animated down-arrow connector between steps */}
              {i < flowText.steps.length - 1 && (
                <div className="flex md:hidden justify-center py-3">
                  <motion.div
                    animate={{ y: [0, 4, 0] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowRight className="w-5 h-5 text-blue-400/40 rotate-90" />
                  </motion.div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

function GoogleIntegrations({ locale }: { locale: string }) {
  const { t } = useTranslation();

  return (
    <section className="py-14 md:py-28 relative overflow-hidden bg-gradient-to-b from-zinc-950 via-blue-950/10 to-zinc-950">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-gray-400 mb-8">
            <Cloud className="w-3 h-3 text-blue-400" />
            {locale.startsWith('pt') ? 'Integrações Poderosas' : 'Powerful Integrations'}
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-5 text-white">
            {locale.startsWith('pt') ? 'Integração Nativa com Google' : 'Native Google Integration'}
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            {locale.startsWith('pt')
              ? 'Novos PDFs são detectados automaticamente e transformados em dados prontos para usar.'
              : 'New PDFs are picked up automatically and turned into ready-to-use information.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 max-w-5xl mx-auto">
          {/* Google Drive Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="group relative overflow-hidden rounded-2xl md:rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-5 sm:p-8 hover:border-blue-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10"
          >
            <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-blue-500/10 blur-[80px] group-hover:bg-blue-500/20 transition-all duration-500" />

            <div className="relative z-10">
              <div className="mb-6 inline-flex rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-4 text-blue-400 ring-1 ring-inset ring-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                <Cloud className="w-8 h-8" />
              </div>

              <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-blue-100 transition-colors">
                Google Drive
              </h3>

              <p className="text-gray-400 leading-relaxed mb-6 group-hover:text-gray-300 transition-colors">
                {locale.startsWith('pt')
                  ? 'Importe documentos diretamente do seu Google Drive. Acesse e processe seus arquivos sem precisar fazer download manual.'
                  : 'Import documents directly from your Google Drive. Access and process your files without manual downloads.'}
              </p>

              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-gray-300">
                  <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <span>
                    {locale.startsWith('pt')
                      ? 'Acesso direto aos seus arquivos'
                      : 'Direct access to your files'}
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-300">
                  <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <span>
                    {locale.startsWith('pt')
                      ? 'Processamento em lote de múltiplos documentos'
                      : 'Batch processing of multiple documents'}
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-300">
                  <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <span>
                    {locale.startsWith('pt')
                      ? 'Sincronização automática'
                      : 'Automatic synchronization'}
                  </span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Google Sheets Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="group relative overflow-hidden rounded-2xl md:rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-5 sm:p-8 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10"
          >
            <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-[80px] group-hover:bg-emerald-500/20 transition-all duration-500" />

            <div className="relative z-10">
              <div className="mb-6 inline-flex rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 p-4 text-emerald-400 ring-1 ring-inset ring-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                <FileSpreadsheet className="w-8 h-8" />
              </div>

              <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-emerald-100 transition-colors">
                Google Sheets
              </h3>

              <p className="text-gray-400 leading-relaxed mb-6 group-hover:text-gray-300 transition-colors">
                {locale.startsWith('pt')
                  ? 'Exporte dados extraídos diretamente para Google Sheets. Organize e analise suas informações em tempo real.'
                  : 'Export extracted data directly to Google Sheets. Organize and analyze your information in real-time.'}
              </p>

              {/* Mini spreadsheet preview */}
              <div className="mb-6 rounded-lg overflow-hidden border border-emerald-500/20">
                <div className="grid grid-cols-4 text-[10px] font-mono">
                  <div className="bg-zinc-800/80 px-2 py-1.5 text-gray-400 border-b border-r border-white/5">Invoice</div>
                  <div className="bg-zinc-800/80 px-2 py-1.5 text-gray-400 border-b border-r border-white/5">Date</div>
                  <div className="bg-zinc-800/80 px-2 py-1.5 text-gray-400 border-b border-r border-white/5">Supplier</div>
                  <div className="bg-zinc-800/80 px-2 py-1.5 text-gray-400 border-b border-white/5 text-right">Total</div>
                  <div className="bg-zinc-950 px-2 py-1.5 text-gray-300 border-b border-r border-white/5">INV-001</div>
                  <div className="bg-zinc-950 px-2 py-1.5 text-gray-400 border-b border-r border-white/5">26/01</div>
                  <div className="bg-zinc-950 px-2 py-1.5 text-gray-400 border-b border-r border-white/5">Acme Ltd</div>
                  <div className="bg-zinc-950 px-2 py-1.5 text-emerald-400 border-b border-white/5 text-right">€1,250</div>
                  <div className="bg-zinc-950 px-2 py-1.5 text-gray-300 border-r border-white/5">INV-002</div>
                  <div className="bg-zinc-950 px-2 py-1.5 text-gray-400 border-r border-white/5">26/01</div>
                  <div className="bg-zinc-950 px-2 py-1.5 text-gray-400 border-r border-white/5">Beta Co.</div>
                  <div className="bg-zinc-950 px-2 py-1.5 text-emerald-400 text-right">€850</div>
                </div>
              </div>

              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-gray-300">
                  <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <span>
                    {locale.startsWith('pt')
                      ? 'Exportação com um clique'
                      : 'One-click export'}
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-300">
                  <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <span>
                    {locale.startsWith('pt')
                      ? 'Formatação automática de dados'
                      : 'Automatic data formatting'}
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-300">
                  <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <span>
                    {locale.startsWith('pt')
                      ? 'Colaboração em equipe facilitada'
                      : 'Easy team collaboration'}
                  </span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Bottom caption */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <Link className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-300">
              {locale.startsWith('pt')
                ? 'Conecte sua conta Google em segundos'
                : 'Connect your Google account in seconds'}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Features({ locale }: { locale: string }) {
  const { t } = useTranslation();
  const getFeaturesText = () => {
    return {
        title: t('landing.features.title'),
        subtitle: t('landing.features.subtitle'),
        items: [
            { icon: Upload, title: t('landing.features.sections.0.title'), desc: t('landing.features.sections.0.items.0'), className: "md:col-span-2" },
            { icon: Settings, title: t('landing.features.sections.1.title'), desc: t('landing.features.sections.1.items.0'), className: "" },
            { icon: Eye, title: t('landing.features.sections.3.title'), desc: t('landing.features.sections.3.items.0'), className: "" },
            { icon: Database, title: t('landing.features.sections.4.title'), desc: t('landing.features.sections.4.items.0'), className: "md:col-span-2" },
            { icon: Code, title: t('landing.features.sections.5.title'), desc: t('landing.features.sections.5.items.0'), className: "md:col-span-2" },
            { icon: Shield, title: t('landing.features.sections.6.title'), desc: t('landing.features.sections.6.items.0'), className: "" },
        ]
    };
  };

  const featuresText = getFeaturesText();

  return (
    <section id="features" className="py-14 md:py-32 relative bg-zinc-950">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,#000_40%,transparent_100%)]" />

      <div className="max-w-7xl mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-5 text-white">
            {featuresText.title}
          </h2>
          <p className="text-lg text-gray-500">
            {featuresText.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {featuresText.items.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              whileHover={{ y: -4 }}
              className={`group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-7 transition-all duration-300 hover:bg-white/[0.06] hover:border-white/15 hover:shadow-xl hover:shadow-blue-500/8 ${feature.className}`}
            >
              <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-blue-500/8 blur-[60px] group-hover:bg-blue-500/15 transition-all duration-500" />

              <div className="relative z-10">
                <div className="mb-5 inline-flex rounded-xl bg-blue-500/10 p-3 text-blue-400 ring-1 ring-inset ring-blue-500/15">
                    <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold mb-2.5 text-white group-hover:text-blue-100 transition-colors">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CodeExample({ locale, onOpenDemo }: { locale: string; onOpenDemo: () => void }) {
  const { t } = useTranslation();
  const getCodeExampleText = () => {
    return {
      badge: t('landing.integration.title'),
      title: t('landing.integration.title'),
      subtitle: t('landing.integration.subtitle'),
      cta: t('landing.hero.cta_secondary'), // reusing "Try demo" / "Watch demo"
      tabs: { upload: t('landing.howItWorks.steps.0.title'), retrieve: t('landing.integration.cards.2.title').split(' ')[0] }, // "Upload", "Structured" (approx)
    };
  };

  const codeText = getCodeExampleText();
  const [activeTab, setActiveTab] = useState<'upload' | 'retrieve'>('upload');

  const codeExamples = {
    upload: `curl -X POST https://api.docset.app/v1/documents \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "file=@invoice.pdf" \\
  -F "template=invoice_template"

// Response
{
  "id": "doc_abc123",
  "status": "processing",
  "template": "invoice_template"
}`,
    retrieve: `curl https://api.docset.app/v1/documents/doc_abc123 \\
  -H "Authorization: Bearer YOUR_API_KEY"

// Response
{
  "id": "doc_abc123",
  "status": "completed",
  "data": {
    "invoice_number": "#INV-2024-001",
    "amount": 12450.00,
    "date": "2024-01-05"
  }
}`,
  };

  return (
    <section id="api" className="py-14 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent" />

      <div className="max-w-6xl mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-gray-400 mb-8">
            <Code className="w-3 h-3 text-blue-400" />
            {codeText.badge}
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-5 text-white">
            {codeText.title}
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            {codeText.subtitle}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-5 gap-8 items-center">
          {/* Left: bullets */}
          <div className="md:col-span-2 space-y-5">
            {[
              locale.startsWith('pt') ? 'Conecte o Docset aos seus próprios sistemas' : 'Connect Docset to your own systems',
              locale.startsWith('pt') ? 'Use webhooks para receber resultados automaticamente' : 'Use webhooks to get results automatically',
              locale.startsWith('pt') ? 'Escale sem mudar o seu processo' : 'Scale up without changing your process',
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-blue-400" />
                </div>
                <p className="text-gray-300 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

          {/* Right: code block */}
          <div className="md:col-span-3 bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="border-b border-white/10 p-4 flex gap-4">
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === 'upload'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {codeText.tabs.upload}
              </button>
              <button
                onClick={() => setActiveTab('retrieve')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === 'retrieve'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {codeText.tabs.retrieve}
              </button>
            </div>

            <div className="p-6">
              <pre className="text-[11px] sm:text-sm font-mono text-gray-300 overflow-x-auto leading-relaxed">
                <code>{codeExamples[activeTab]}</code>
              </pre>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              size="lg"
              onClick={onOpenDemo}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Play className="mr-2 h-4 w-4" />
              {codeText.cta}
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

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
}


function Pricing({ locale, isAuthenticated, localeShort, plans }: { locale: string; isAuthenticated: boolean; localeShort: string; plans: any[] }) {
  const { t } = useTranslation();

  // Use server-provided plans directly
  const plansData = plans || [];

  return (
    <section className="py-14 md:py-24 bg-zinc-950 relative overflow-hidden" id="pricing">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05),transparent_70%)]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-5">
            {t('landing.pricing.title')}
          </h2>
          <p className="text-lg text-gray-500">
            {t('landing.pricing.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 max-w-7xl mx-auto">
          {plansData.length === 0 ? (
             // Fallback skeleton if no plans - though SSR should provide them
             Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white/5 h-[500px] rounded-2xl animate-pulse" />
             ))
          ) : (
            plansData.map((plan, index) => {
              const recommended = plan.recommended || plan.is_popular;
              return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-5 sm:p-8 rounded-2xl border ${
                  recommended
                    ? 'bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-500/10'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                } backdrop-blur-sm transition-all duration-300 group hover:-translate-y-1 flex flex-col ssr-fade-in`}
              >
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-2">{plan.display_name || plan.name}</h3>
                  <p className="text-zinc-400 text-sm h-10">{plan.tagline || plan.description}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">
                          {plan.price === null || plan.price === 0 || parseFloat(String(plan.price)) === 0
                            ? new Intl.NumberFormat(locale, { style: 'currency', currency: plan.currency || 'EUR' }).format(0)
                            : new Intl.NumberFormat(locale, { style: 'currency', currency: plan.currency }).format(plan.price)}
                    </span>
                    {(plan.price !== null || plan.interval) && (
                        <span className="text-zinc-500">/{t(plan.interval || 'month')}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-4 mb-8 flex-1">
                  {plan.features && plan.features.map((feature: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className={`w-full ${
                    recommended
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-white text-zinc-900 hover:bg-zinc-100'
                  }`}
                  onClick={() => {
                    if (isAuthenticated) {
                      router.visit(`/${localeShort}/settings/billing`);
                    } else if (plan.price_id) {
                      // Paid plan with price_id - go to register with plan param
                      router.visit(`/${localeShort}/register?plan=${plan.price_id}&plan_name=${encodeURIComponent(plan.display_name || plan.name)}`);
                    } else {
                      // Free plan or fallback - standard registration
                      router.visit(`/${localeShort}/register`);
                    }
                  }}
                >
                  {(() => {
                      if (parseFloat(String(plan.price).replace(/[^0-9.]/g, '') || '0') === 0) return t('Start free');
                      return t('Get Started');
                  })()}
                </Button>

              </motion.div>
            )})
          )}
        </div>

        <div className="mt-12 text-center">
            <p className="text-zinc-500 text-sm">
                {t('landing.pricing.disclaimer')}
            </p>
        </div>
      </div>
    </section>
  );
}


function FinalCTA({ locale }: { locale: string }) {
  const { t } = useTranslation();
  const ctaText = {
    title: t('landing.cta.title'),
    subtitle: t('landing.cta.subtitle'),
    cta: t('landing.cta.primary'),
  };

  return (
    <section className="py-16 md:py-36 relative overflow-hidden bg-zinc-950">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      {/* Fine grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-blue-600/18 rounded-full blur-[130px]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          {/* Bold white headline — same style as hero */}
          <h2
            className="font-black leading-[0.9] tracking-tighter mb-8 text-white"
            style={{ fontSize: 'clamp(2.2rem, 5.5vw, 5.5rem)' }}
          >
            {ctaText.title}
          </h2>
          <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto">
            {ctaText.subtitle}
          </p>
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-block"
          >
            <Button
              size="lg"
              onClick={() => router.visit(`/${locale.split('-')[0]}/register`)}
              className="bg-white text-black hover:bg-gray-100 px-6 sm:px-10 h-12 sm:h-14 text-base font-bold rounded-xl shadow-[0_0_80px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_100px_-10px_rgba(255,255,255,0.45)] transition-shadow"
            >
              {ctaText.cta}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer({ locale }: { locale: string }) {
  const { t } = useTranslation();

  const handleOpenCookieSettings = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new Event('openCookieSettings'));
  };

  return (
    <footer className="bg-zinc-950 border-t border-white/10 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <img src="/docset.png" alt="Docset" className="w-6 h-6" />
              </div>
              <span className="font-bold text-xl">DOCSET</span>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Turn PDFs into ready-to-use data. No manual typing needed.
            </p>
          <div className="flex gap-4">
              {/* Social Links would go here */}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#features" className="hover:text-white transition">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
              <li><a href="#api" className="hover:text-white transition">API</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href={`/${locale}/privacy`} className="hover:text-white transition">{t('Privacy Policy')}</a></li>
              <li><a href={`/${locale}/terms`} className="hover:text-white transition">{t('Terms of Service')}</a></li>
              <li>
                <button
                  onClick={handleOpenCookieSettings}
                  className="hover:text-white transition text-left"
                >
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Docset. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

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
    // Check if demo was already used
    if (typeof window !== 'undefined' && localStorage.getItem('docset_demo_used') === 'true') {
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
            document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          localStorage.setItem('docset_demo_used', 'true');
          toast.error(t('Demo already used. Please register to continue.'));
          setTimeout(() => {
            onClose();
            router.visit(`/${locale}/register`);
          }, 2500);
          return;
        }

        if (response.status === 422 && data.error === 'Page limit exceeded') {
             setError(t('Demo is limited to 2 pages. Please register for full access.'));
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{t('Try DocSet Demo')}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {t('Upload a document to see how DocSet extracts data automatically. This is a one-time free demo.')}
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-6">
            <div className="border-2 border-dashed border-white/20 rounded-xl p-12 text-center hover:border-blue-500/50 transition-all">
              <Upload className="h-16 w-16 mx-auto text-gray-600 mb-4" />
              <Input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                id="demo-file"
              />
              <Label
                htmlFor="demo-file"
                className="cursor-pointer text-blue-400 hover:text-blue-300 font-semibold text-lg"
              >
                {t('Click to upload')}
              </Label>
              <p className="text-sm text-gray-400 mt-3">
                {t('PDF, JPG, PNG (max 10MB)')}
              </p>
              {file && (
                <motion.div
                  initial={{ opacity: 1, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Badge className="mt-6 bg-blue-500/20 text-blue-300 border-blue-500/30 px-4 py-2 text-sm">
                    <FileText className="w-4 h-4 mr-2" />
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </Badge>
                </motion.div>
              )}
              {error && (
                <motion.div
                  initial={{ opacity: 1, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
                >
                  <p className="text-sm text-red-400 font-medium">{error}</p>
                </motion.div>
              )}
            </div>

            <Button
              onClick={handleProcess}
              disabled={!file || processing || !!error}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
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
            <motion.div
              initial={{ opacity: 1, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle className="h-10 w-10 text-green-500" />
                <div>
                  <h3 className="text-xl font-bold text-green-400">{t('Data Extracted Successfully!')}</h3>
                  <p className="text-sm text-gray-400">{t('landing.howItWorks.steps.2.desc')}</p>
                </div>
              </div>
              <div className="space-y-3">
                {Object.entries(result).map(([key, value]) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 1, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-medium capitalize text-gray-300">
                        {key.replace('_', ' ')}
                        </span>
                    </div>

                    <div className="w-full">
                        {Array.isArray(value) ? (
                            <div className="space-y-2 mt-2">
                                {value.map((item, idx) => (
                                    <div key={idx} className="p-3 bg-white/5 rounded text-sm border border-white/5">
                                        {typeof item === 'object' && item !== null ? (
                                            <div className="grid grid-cols-2 gap-2">
                                                {Object.entries(item).map(([subKey, subValue]) => (
                                                    <div key={subKey} className="flex flex-col">
                                                        <span className="text-xs text-gray-500 uppercase">{subKey}</span>
                                                        <span className="text-sm text-gray-200">{String(subValue)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-gray-200">{String(item)}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : typeof value === 'object' && value !== null ? (
                             <div className="p-3 bg-white/5 rounded text-sm border border-white/5 mt-2">
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(value).map(([subKey, subValue]) => (
                                        <div key={subKey} className="flex flex-col">
                                            <span className="text-xs text-gray-500 uppercase">{subKey}</span>
                                            <span className="text-sm text-gray-200">{String(subValue)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                             <span className="font-bold text-white text-right block">{String(value)}</span>
                        )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
              <p className="font-medium mb-2 text-blue-300">{t('🎉 Demo completed!')}</p>
              <p className="text-sm text-gray-400">
                {t('Register now to unlock unlimited document processing with advanced features.')}
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
