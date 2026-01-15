import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import React, { useEffect, useState, useCallback, useRef } from "react";
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
} from "lucide-react";
import { toast } from "sonner";


// Fallbacks removed to use direct translation keys

export default function Welcome() {
  const { t, i18n } = useTranslation();
  const { props } = usePage<{ auth?: { user?: any }; canRegister: boolean; locale: string }>();
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
      <UseCases />
      <ProductFlow locale={fullLocale} />
      <Features locale={fullLocale} />
      <CodeExample locale={fullLocale} onOpenDemo={() => setShowDemo(true)} />
      <Pricing locale={fullLocale} isAuthenticated={isAuthenticated} localeShort={locale} />
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
        initial={{ y: -100, opacity: 0 }}
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
            initial={{ opacity: 0, x: "100%" }}
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
  const rotateX = useTransform(scrollY, [0, 500], [20, 0]);
  const scale = useTransform(scrollY, [0, 500], [1, 0.9]);
  
  const [step, setStep] = useState(0);
  const [formatIndex, setFormatIndex] = useState(0);

  useEffect(() => {
    // Step 2 animation no longer uses cycling formatIndex
    // We can remove the formatIndex logic if it's not used elsewhere
    // Keeping step cycle logic
  }, [step]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 3);
    }, 4000); // Slower cycle to let users appreciate the animations
    return () => clearInterval(interval);
  }, []);
  
  const getHeroText = () => {
    return {
      title: t('landing.hero.title'),
      highlight: t('landing.hero.highlight'),
      subtitle: t('landing.hero.subtitle'),
      cta_primary: t('landing.hero.cta_primary'),
      cta_demo: t('landing.hero.cta_secondary'),
      eyebrow: t('landing.hero.eyebrow')
    };
  };
  
  const heroRaw = getHeroText();

  return (
    <section className="relative overflow-hidden pt-24 pb-20 md:pt-32 md:pb-24 bg-black selection:bg-blue-500/30">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-zinc-950 to-zinc-950" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-6 bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 px-3 py-1 text-xs backdrop-blur-md">
              <Sparkles className="w-3 h-3 mr-2 text-blue-400" />
              {heroRaw.eyebrow}
            </Badge>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/70 max-w-4xl"
          >
            {heroRaw.title} <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
              {heroRaw.highlight}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 leading-relaxed mb-10 max-w-2xl mx-auto"
          >
            {heroRaw.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Button
                size="lg"
                onClick={() => router.visit(`/${locale}/register`)}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 h-12 text-base font-semibold shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] border border-blue-500/20 rounded-xl"
              >
                {heroRaw.cta_primary}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Button
                size="lg"
                variant="outline"
                onClick={onOpenDemo}
                className="w-full sm:w-auto border-white/10 bg-white/5 hover:bg-white/10 text-white px-8 h-12 text-base font-semibold backdrop-blur-sm rounded-xl"
              >
                <Play className="mr-2 h-4 w-4 fill-current" />
                {heroRaw.cta_demo}
              </Button>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          style={{ rotateX, scale, perspective: 1000 }}
          initial={{ opacity: 0, y: 100, rotateX: 20 }}
          animate={{ opacity: 1, y: 0, rotateX: 20 }}
          transition={{ duration: 1, delay: 0.4, type: "spring", bounce: 0.2 }}
          className="mt-20 relative perspective-1000 mx-auto max-w-5xl"
        >
          {/* Main 3D Container with Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] bg-blue-500/20 rounded-[100px] blur-[80px] pointer-events-none" />
          
          <div className="relative z-10 rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl shadow-2xl shadow-blue-500/10 overflow-hidden ring-1 ring-white/10 group">
             
             {/* Header Bar */}
             <div className="flex border-b border-white/10 bg-white/5 px-4 py-3 items-center gap-3 relative z-20">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                
                {/* Step Indicators in Header */}
                <div className="flex-1 flex justify-center gap-2">
                    {['Upload', 'Process', 'Export'].map((label, i) => (
                        <div key={label} className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-500 ${
                            step === i 
                            ? 'bg-blue-500/20 border-blue-500/50 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                            : 'bg-transparent border-transparent text-gray-600'
                        }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${step === i ? 'bg-blue-500 animate-pulse' : 'bg-gray-700'}`} />
                            <span className="text-[10px] font-mono uppercase tracking-wider">{label}</span>
                        </div>
                    ))}
                </div>

                <div className="w-16"></div> {/* Spacer for balance */}
              </div>

            {/* Dynamic "Virtual Document" Stage */}
            <div className="relative aspect-[16/9] bg-zinc-900/50 flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <motion.div 
                            key="step-upload"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center w-full h-full relative"
                        >
                            {/* Drop Zone Animation */}
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                className="w-64 h-80 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center bg-white/5"
                            >
                                <motion.div
                                    initial={{ y: -50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.8, type: "spring" }}
                                >
                                    <FileText className="w-16 h-16 text-blue-400 mb-4" />
                                </motion.div>
                                <div className="space-y-2 text-center">
                                    <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden mx-auto">
                                        <motion.div 
                                            initial={{ width: "0%" }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 2, ease: "easeInOut" }}
                                            className="h-full bg-blue-500"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 font-mono">Uploading...</p>
                                </div>
                            </motion.div>
                            
                            {/* Floating Particles */}
                            {[...Array(5)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-1 h-1 bg-blue-400 rounded-full"
                                    initial={{ 
                                        x: (Math.random() - 0.5) * 300, 
                                        y: 100, 
                                        opacity: 0 
                                    }}
                                    animate={{ 
                                        y: -200, 
                                        opacity: [0, 1, 0] 
                                    }}
                                    transition={{ 
                                        duration: 2 + Math.random(), 
                                        repeat: Infinity,
                                        delay: Math.random() * 2 
                                    }}
                                />
                            ))}
                        </motion.div>
                    )}

                    {step === 1 && (
                        <motion.div 
                            key="step-process"
                            className="relative w-64 h-80 bg-white rounded-xl shadow-2xl overflow-hidden"
                            initial={{ scale: 0.9, opacity: 0, rotateX: 20 }}
                            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                             {/* Document Content Simulation */}
                             <div className="p-6 space-y-4 opacity-50 blur-[0.5px]">
                                <div className="w-16 h-4 bg-gray-200 rounded" />
                                <div className="space-y-2">
                                    <div className="w-full h-2 bg-gray-100 rounded" />
                                    <div className="w-full h-2 bg-gray-100 rounded" />
                                    <div className="w-2/3 h-2 bg-gray-100 rounded" />
                                </div>
                                <div className="flex justify-between pt-8">
                                    <div className="w-20 h-2 bg-gray-100 rounded" />
                                    <div className="w-10 h-2 bg-gray-200 rounded" />
                                </div>
                                 <div className="space-y-2 pt-4">
                                    <div className="w-full h-2 bg-gray-100 rounded" />
                                    <div className="w-full h-2 bg-gray-100 rounded" />
                                </div>
                             </div>

                             {/* Scanner Beam */}
                             <motion.div 
                                initial={{ top: "-10%" }}
                                animate={{ top: "120%" }}
                                transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                                className="absolute left-0 w-full h-20 bg-gradient-to-b from-blue-500/0 via-blue-500/20 to-blue-500/0 border-b border-blue-400/50 shadow-[0_0_20px_rgba(59,130,246,0.3)] z-10"
                             />
                             
                             {/* Highlighted Fields appearing after scan */}
                             <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="absolute top-[20%] left-6 right-6 h-8 border-2 border-green-500/50 bg-green-500/10 rounded flex items-center justify-center"
                             >
                                <span className="text-[10px] text-green-700 font-bold bg-white/80 px-1 rounded">INVOICE #9923</span>
                             </motion.div>

                             <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="absolute bottom-20 right-6 w-24 h-8 border-2 border-green-500/50 bg-green-500/10 rounded flex items-center justify-center"
                             >
                                <span className="text-[10px] text-green-700 font-bold bg-white/80 px-1 rounded">$2,450.00</span>
                             </motion.div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div 
                            key="step-export"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-full h-full p-6 relative flex items-center justify-center"
                        >
                            {/* Floating "Surprise" Elements - Appearing sequentially */}
                            
                            {/* JSON Top Left */}
                            <motion.div
                                initial={{ x: -140, y: -80, opacity: 0, scale: 0.9 }}
                                animate={{ x: -140, y: -80, opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="absolute bg-zinc-900 border border-blue-500/30 p-4 rounded-xl shadow-2xl w-48 z-10"
                            >
                                <div className="text-xs text-gray-400 font-mono mb-2 flex items-center gap-2">
                                    <FileJson className="w-4 h-4 text-blue-400" /> 
                                    <span className="text-blue-100">data.json</span>
                                </div>
                                <div className="text-[10px] font-mono text-blue-300 bg-zinc-950/50 p-2 rounded border border-blue-500/10">
                                    <div className="flex gap-1"><span className="text-blue-500">"id"</span>: <span className="text-orange-300">"INV-001"</span>,</div>
                                    <div className="flex gap-1"><span className="text-blue-500">"total"</span>: <span className="text-orange-300">1250.00</span>,</div>
                                    <div className="flex gap-1"><span className="text-blue-500">"status"</span>: <span className="text-green-400">"paid"</span></div>
                                </div>
                            </motion.div>

                            {/* Excel/Table Bottom Right (Center-Right actually) */}
                            <motion.div
                                initial={{ x: 80, y: -40, opacity: 0, scale: 0.9 }}
                                animate={{ x: 80, y: -40, opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                className="absolute bg-zinc-900 border border-emerald-500/30 p-4 rounded-xl shadow-2xl w-56 z-20"
                            >
                                <div className="text-xs text-gray-400 font-mono mb-2 flex items-center gap-2">
                                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> 
                                    <span className="text-emerald-100">export.xlsx</span>
                                </div>
                                {/* Excel Grid Visualization */}
                                <div className="grid grid-cols-3 gap-px bg-zinc-800 border border-zinc-800 rounded overflow-hidden text-[10px] font-mono">
                                    {/* Header */}
                                    <div className="bg-zinc-800/80 p-1.5 text-center text-gray-400">ID</div>
                                    <div className="bg-zinc-800/80 p-1.5 text-center text-gray-400">Date</div>
                                    <div className="bg-zinc-800/80 p-1.5 text-right text-gray-400">Total</div>
                                    
                                    {/* Row 1 */}
                                    <div className="bg-zinc-950 p-1.5 text-gray-300">001</div>
                                    <div className="bg-zinc-950 p-1.5 text-gray-500">Oct 24</div>
                                    <div className="bg-zinc-950 p-1.5 text-right text-emerald-400">$1,250</div>

                                    {/* Row 2 */}
                                    <div className="bg-zinc-950 p-1.5 text-gray-300">002</div>
                                    <div className="bg-zinc-950 p-1.5 text-gray-500">Oct 25</div>
                                    <div className="bg-zinc-950 p-1.5 text-right text-emerald-400">$850</div>
                                </div>
                            </motion.div>

                            {/* XML Top Right-ish (shifted) */}
                            <motion.div
                                initial={{ x: 160, y: 70, opacity: 0, scale: 0.9 }}
                                animate={{ x: 160, y: 70, opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6 }}
                                className="absolute bg-zinc-900 border border-purple-500/30 p-4 rounded-xl shadow-2xl w-44 z-10"
                            >
                                <div className="text-xs text-gray-400 font-mono mb-2 flex items-center gap-2">
                                    <FileCode className="w-4 h-4 text-purple-400" /> 
                                    <span className="text-purple-100">data.xml</span>
                                </div>
                                <div className="text-[10px] font-mono text-purple-300 bg-zinc-950/50 p-2 rounded border border-purple-500/10">
                                    &lt;invoice&gt;<br/>
                                    &nbsp;&nbsp;&lt;id&gt;001&lt;/id&gt;<br/>
                                    &nbsp;&nbsp;&lt;total&gt;1250&lt;/total&gt;<br/>
                                    &lt;/invoice&gt;
                                </div>
                            </motion.div>

                            {/* CSV Bottom Left */}
                            <motion.div
                                initial={{ x: -100, y: 80, opacity: 0, scale: 0.9 }}
                                animate={{ x: -100, y: 80, opacity: 1, scale: 1 }}
                                transition={{ delay: 0.8 }}
                                className="absolute bg-zinc-900 border border-indigo-500/30 p-4 rounded-xl shadow-2xl w-48 z-10"
                            >
                                <div className="text-xs text-gray-400 font-mono mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-indigo-400" /> 
                                    <span className="text-indigo-100">data.csv</span>
                                </div>
                                <div className="text-[10px] font-mono text-indigo-300 bg-zinc-950/50 p-2 rounded border border-indigo-500/10 whitespace-pre">
                                    id,date,total,status<br/>
                                    001,2024-10-24,1250,paid<br/>
                                    002,2024-10-25,850,paid
                                </div>
                            </motion.div>

                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            {/* Overlay gradient for better blend */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
          </div>
        </motion.div>
      </div>
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
    <section className="py-10 border-y border-white/5 bg-black/50 backdrop-blur-sm relative z-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
               {trust.badges && Array.isArray(trust.badges) ? (
                 trust.badges.map((badge: any, i: number) => {
                   const Icon = iconMap[badge.icon] || Shield;
                   const colors = ['text-green-400', 'text-blue-400', 'text-purple-400'];
                   return (
                     <div key={i} className="flex items-center gap-2 text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                       <Icon className={`w-4 h-4 ${colors[i] || 'text-gray-400'}`} />
                       <span className="text-sm font-medium">{badge.title}</span>
                     </div>
                   );
                 })
               ) : (
                 /* Fallback for old structure */
                 <>
                   <div className="flex items-center gap-2 text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                      <Shield className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-medium">{trust.badges?.gdpr || 'GDPR Compliant'}</span>
                   </div>
                   <div className="flex items-center gap-2 text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                      <Lock className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium">{trust.badges?.encrypted || 'Encrypted Data'}</span>
                   </div>
                   <div className="flex items-center gap-2 text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                      <Server className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium">{trust.badges?.no_training || 'Privacy Protected'}</span>
                   </div>
                 </>
               )}
            </div>
            
            <div className="flex items-center gap-4 text-gray-500 font-mono text-sm">
                <span className="hidden lg:block opacity-50">{(trust.exports || 'Export:').split(':')[0]}:</span>
                <div className="flex gap-4 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                    <span className="font-bold flex items-center gap-2" title="Excel / CSV"><FileSpreadsheet className="w-4 h-4" /> XLS/CSV</span>
                    <span className="font-bold flex items-center gap-2" title="JSON"><FileJson className="w-4 h-4" /> JSON</span>
                    <span className="font-bold flex items-center gap-2" title="XML"><FileCode className="w-4 h-4" /> XML</span>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
}

function UseCases() {
  const { t } = useTranslation();
  const content = t('landing.useCases', { returnObjects: true }) as any;
  const icons = [FileText, Receipt, IdCard, Sparkles];

  return (
    <section className="py-24 bg-zinc-950 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
                 <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">{content.title}</h2>
                 <p className="text-xl text-gray-400 max-w-2xl mx-auto">{content.subtitle}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {content.items.map((item: any, i: number) => {
                    const Icon = icons[i] || FileText;
                    return (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-zinc-900/50 border border-white/10 p-6 rounded-2xl hover:bg-white/5 transition duration-300 group hover:border-blue-500/30 flex flex-col"
                        >
                            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                                <Icon className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-lg font-bold mb-3">{item.title}</h3>
                            
                            {/* Problem */}
                            {item.problem && (
                              <div className="mb-3 p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                                <p className="text-sm text-red-200/80">{item.problem}</p>
                              </div>
                            )}
                            
                            {/* Solution */}
                            {item.solution && (
                              <p className="text-sm text-gray-400 leading-relaxed mb-3">{item.solution}</p>
                            )}
                            
                            {/* Benefit */}
                            {item.benefit && (
                              <div className="mt-auto p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                                <p className="text-sm font-medium text-emerald-200/90">✓ {item.benefit}</p>
                              </div>
                            )}
                            
                            {/* Old desc fallback if new structure not available */}
                            {!item.problem && !item.solution && item.desc && (
                              <p className="text-gray-400 leading-relaxed">{item.desc}</p>
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

  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <Badge className="mb-6 bg-blue-500/10 text-blue-300 border-blue-500/20">
            {flowText.badge}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold">
            {flowText.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {flowText.steps.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              <div className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300">
                <div className="text-5xl font-bold text-white/10 mb-4">{item.step}</div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6">
                  {React.createElement(iconMap[i], { className: "w-6 h-6 text-blue-400" })}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
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
    <section id="features" className="py-24 md:py-32 relative bg-zinc-950/50">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
            {featuresText.title}
          </h2>
          <p className="text-xl text-gray-400">
            {featuresText.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuresText.items.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -5 }}
              className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 transition-colors hover:bg-white/10 hover:shadow-2xl hover:shadow-blue-500/10 ${feature.className}`}
            >
              <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-blue-500/10 blur-[80px] group-hover:bg-blue-500/20 transition-all duration-500" />
              
              <div className="relative z-10">
                <div className="mb-6 inline-flex rounded-xl bg-blue-500/10 p-3 text-blue-400 ring-1 ring-inset ring-blue-500/20">
                    <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-blue-200 transition-colors">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">{feature.desc}</p>
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
    <section id="api" className="py-20 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent" />
      
      <div className="max-w-6xl mx-auto px-6 relative">
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-blue-500/10 text-blue-300 border-blue-500/20">
            <Code className="w-3 h-3 mr-1" />
            {codeText.badge}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {codeText.title}
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {codeText.subtitle}
          </p>
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
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
            <pre className="text-sm font-mono text-gray-300 overflow-x-auto">
              <code>{codeExamples[activeTab]}</code>
            </pre>
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

function Pricing({ locale, isAuthenticated, localeShort }: { locale: string; isAuthenticated: boolean; localeShort: string }) {
  const { t } = useTranslation();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch(`/api/plans?locale=${localeShort}`, {
          headers: {
            'Accept': 'application/json'
          }
        });
        const data = await response.json();
        
        // The API returns an object keyed by plan ID ('free': {...}, 'starter': {...})
        // We convert it to an array for rendering
        const plansArray = Object.values(data) as Plan[];
        setPlans(plansArray);
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [localeShort]);

  const handlePlanClick = (plan: Plan) => {
    if (isAuthenticated) {
        if (plan.price_id) {
            router.visit(`/subscription/checkout?price_id=${plan.price_id}`);
        } else {
            router.visit('/dashboard');
        }
    } else {
        router.visit(`/${locale}/register?plan=${plan.id}&price_id=${plan.price_id || ''}`);
    }
  };

  const getCtaText = (plan: Plan) => {
      if (plan.price === null || plan.id === 'business' || plan.id === 'enterprise') return 'Contact Sales';
      if (parseFloat(plan.price?.replace(/[^0-9.]/g, '') || '0') === 0) return 'Start free';
      return 'Start trial';
  };

  // Translation helpers for static strings
  const titleText = t('landing.pricing.title');
  const subtitleText = t('landing.pricing.subtitle');
  const disclaimerText = t('landing.pricing.disclaimer');

  return (
    <section className="py-24 bg-zinc-950 relative overflow-hidden" id="pricing">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05),transparent_70%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-white mb-6"
          >
            {titleText}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-zinc-400"
          >
            {subtitleText}
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {loading ? (
             Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white/5 h-[500px] rounded-2xl animate-pulse" />
             ))
          ) : (
            plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-8 rounded-2xl border ${
                  plan.recommended
                    ? 'bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-500/10' 
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                } backdrop-blur-sm transition-all duration-300 group hover:-translate-y-1 flex flex-col`}
              >
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-2">{plan.display_name}</h3>
                  <p className="text-zinc-400 text-sm h-10">{plan.tagline || plan.description}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">{plan.price || 'Custom'}</span>
                    {plan.price && plan.interval && (
                        <span className="text-zinc-500">/{plan.interval === 'year' ? 'yr' : 'mo'}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-4 mb-8 flex-1">
                  {plan.features && plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  className={`w-full ${
                    plan.recommended
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
                      : 'bg-white text-zinc-900 hover:bg-zinc-100'
                  }`}
                  onClick={() => handlePlanClick(plan)}
                >
                  {getCtaText(plan)}
                </Button>
              </motion.div>
            ))
          )}
        </div>
        
        {!loading && (
            <div className="mt-12 text-center">
                <p className="text-zinc-500 text-sm">
                    {disclaimerText}
                </p>
            </div>
        )}
      </div>
    </section>
  );
}


function FinalCTA({ locale }: { locale: string }) {
  const { t } = useTranslation();
  const getFinalCTAText = () => {
    return {
      title: t('landing.cta.title'),
      subtitle: t('landing.cta.subtitle'),
      cta: t('landing.cta.primary'),
    };
  };
  
  const ctaText = getFinalCTAText();

  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-blue-900/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            {ctaText.title}
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            {ctaText.subtitle}
          </p>
          <Button
            size="lg"
            onClick={() => router.visit(`/${locale.split('-')[0]}/register`)}
            className="bg-white text-black hover:bg-gray-200 px-8 h-14 text-lg font-semibold shadow-lg shadow-white/20"
          >
            {ctaText.cta}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <img src="/docset.png" alt="Docset" className="w-6 h-6" />
              </div>
              <span className="font-bold text-xl">DOCSET</span>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Automated document processing powered by Advanced AI Vision.
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
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition">Blog</a></li>
              <li><a href="#" className="hover:text-white transition">Support</a></li>
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
                  {locale === 'pt' ? 'Gerir Cookies' : 'Manage Cookies'}
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
          toast.error(t('Demo already used. Please register to continue.'));
          setTimeout(() => {
            onClose();
            router.visit(`/${locale}/register`);
          }, 2500);
          return;
        }
        throw new Error(data.message || t('document_processing_error')); // Fallback or key? "Extraction failed" isn't in JSON directly but "document_processing_error" is close/better
      }

      setResult(data.data);
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
                  initial={{ opacity: 0, y: 10 }}
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
                  initial={{ opacity: 0, y: 10 }}
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle className="h-10 w-10 text-green-500" />
                <div>
                  <h3 className="text-xl font-bold text-green-400">{t('Data Extracted Successfully!')}</h3>
                  <p className="text-sm text-gray-400">{t('landing.howItWorks.steps.2.desc')}</p> {/* Reusing "Review & approve" desc approx or just leave hardcoded if no exact match */}
                </div>
              </div>
              <div className="space-y-3">
                {Object.entries(result).map(([key, value]) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <span className="font-medium capitalize text-gray-300">
                      {key.replace('_', ' ')}:
                    </span>
                    <span className="font-bold text-white">{value as string}</span>
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
