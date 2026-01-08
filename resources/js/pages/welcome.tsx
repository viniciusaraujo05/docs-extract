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
  Boxes,
  GitBranch,
  X,
  Moon,
  Sun,
  DollarSign,
  Settings,
  Lock,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

const heroFallback = {
  en: {
    title: "Turn documents into structured data",
    subtitle: "DOCSET extracts data from recurring PDFs and images. Define your schema, review every field, and export via UI or API.",
    cta_primary: "Start free",
    cta_demo: "Try demo",
  },
  'pt-BR': {
    title: "Transforme documentos em dados estruturados",
    subtitle: "DOCSET extrai dados de PDFs e imagens recorrentes. Defina seu esquema, revise cada campo e exporte via UI ou API.",
    cta_primary: "Começar grátis",
    cta_demo: "Ver demonstração",
  },
  'pt-PT': {
    title: "Transforme documentos em dados estruturados",
    subtitle: "DOCSET extrai dados de PDFs e imagens recorrentes. Defina o seu esquema, reveja cada campo e exporte via UI ou API.",
    cta_primary: "Começar grátis",
    cta_demo: "Ver demonstração",
  },
};

const featuresFallback = {
  en: {
    title: "Everything you need",
    items: [
      { icon: Upload, title: "Upload PDFs & Images", desc: "Drag and drop documents or use our API to submit files programmatically." },
      { icon: Settings, title: "Custom schemas", desc: "Define text, number, or date fields. Reuse templates across documents." },
      { icon: Eye, title: "Manual review", desc: "Review extracted data side-by-side with the original document before saving." },
      { icon: Database, title: "Structured history", desc: "Access your data through reports, exports, or our REST API." },
      { icon: Code, title: "Developer-first API", desc: "Simple REST API with JSON responses. Built for automation and integration." },
      { icon: Shield, title: "Privacy & security", desc: "Your data is encrypted. We never train models on your documents." },
    ],
  },
  'pt-BR': {
    title: "Tudo que você precisa",
    items: [
      { icon: Upload, title: "Upload de PDFs e Imagens", desc: "Arraste e solte documentos ou use nossa API para enviar arquivos programaticamente." },
      { icon: Settings, title: "Esquemas personalizados", desc: "Defina campos de texto, número ou data. Reutilize templates entre documentos." },
      { icon: Eye, title: "Revisão manual", desc: "Revise os dados extraídos lado a lado com o documento original antes de salvar." },
      { icon: Database, title: "Histórico estruturado", desc: "Acesse seus dados através de relatórios, exportações ou nossa API REST." },
      { icon: Code, title: "API para desenvolvedores", desc: "API REST simples com respostas JSON. Construída para automação e integração." },
      { icon: Shield, title: "Privacidade e segurança", desc: "Seus dados são criptografados. Nunca treinamos modelos com seus documentos." },
    ],
  },
  'pt-PT': {
    title: "Tudo o que precisa",
    items: [
      { icon: Upload, title: "Upload de PDFs e Imagens", desc: "Arraste e largue documentos ou use a nossa API para enviar ficheiros programaticamente." },
      { icon: Settings, title: "Esquemas personalizados", desc: "Defina campos de texto, número ou data. Reutilize modelos entre documentos." },
      { icon: Eye, title: "Revisão manual", desc: "Reveja os dados extraídos lado a lado com o documento original antes de guardar." },
      { icon: Database, title: "Histórico estruturado", desc: "Aceda aos seus dados através de relatórios, exportações ou a nossa API REST." },
      { icon: Code, title: "API para programadores", desc: "API REST simples com respostas JSON. Construída para automação e integração." },
      { icon: Shield, title: "Privacidade e segurança", desc: "Os seus dados são encriptados. Nunca treinamos modelos com os seus documentos." },
    ],
  },
};

const pricingFallback = {
  en: {
    title: "Simple pricing",
    subtitle: "All features on every plan",
    cta: "Get started",
    freeForever: "Free forever",
    limitsRenewMonthly: "* Limits renew monthly",
  },
  'pt-BR': {
    title: "Preços simples",
    subtitle: "Todos os recursos em cada plano",
    cta: "Começar",
    freeForever: "Grátis para sempre",
    limitsRenewMonthly: "* Os limites renovam mensalmente",
  },
  'pt-PT': {
    title: "Preços simples",
    subtitle: "Todos os recursos em cada plano",
    cta: "Começar",
    freeForever: "Grátis para sempre",
    limitsRenewMonthly: "* Os limites renovam mensalmente",
  },
};

const planNamesMapping: any = {
  en: {
    'FREE': 'Free',
    'STARTER': 'Starter', 
    'PRO': 'Pro',
    'BUSINESS': 'Business',
  },
  'pt-BR': {
    'FREE': 'Grátis',
    'STARTER': 'Starter',
    'PRO': 'Pro', 
    'BUSINESS': 'Business',
  },
  'pt-PT': {
    'FREE': 'Grátis',
    'STARTER': 'Starter',
    'PRO': 'Pro',
    'BUSINESS': 'Business',
  },
};

const productFlowFallback = {
  en: {
    badge: "How it works",
    title: "Three simple steps",
    steps: [
      { step: "01", title: "Upload documents", description: "Send PDFs or images via UI or API. We process asynchronously." },
      { step: "02", title: "Review & approve", description: "Verify extracted data with side-by-side document preview." },
      { step: "03", title: "Export or integrate", description: "Download as CSV/JSON or use our REST API for automation." },
    ],
  },
  'pt-BR': {
    badge: "Como funciona",
    title: "Três passos simples",
    steps: [
      { step: "01", title: "Envie documentos", description: "Envie PDFs ou imagens via UI ou API. Processamos de forma assíncrona." },
      { step: "02", title: "Revise e aprove", description: "Verifique os dados extraídos com visualização lado a lado do documento." },
      { step: "03", title: "Exporte ou integre", description: "Baixe como CSV/JSON ou use nossa API REST para automação." },
    ],
  },
  'pt-PT': {
    badge: "Como funciona",
    title: "Três passos simples",
    steps: [
      { step: "01", title: "Envie documentos", description: "Envie PDFs ou imagens via UI ou API. Processamos de forma assíncrona." },
      { step: "02", title: "Reveja e aprove", description: "Verifique os dados extraídos com visualização lado a lado do documento." },
      { step: "03", title: "Exporte ou integre", description: "Descarregue como CSV/JSON ou use a nossa API REST para automação." },
    ],
  },
};

const codeExampleFallback = {
  en: {
    badge: "Developer API",
    title: "Built for data extraction",
    subtitle: "Use DOCSET via UI or integrate it using a simple REST API. JSON responses, webhooks, and more.",
    cta: "Try demo",
    tabs: { upload: "Upload", retrieve: "Retrieve" },
  },
  'pt-BR': {
    badge: "API para desenvolvedores",
    title: "Feito para desenvolvedores",
    subtitle: "Use DOCSET via UI ou integre usando uma API REST simples. Respostas JSON, webhooks e mais.",
    cta: "Ver demonstração",
    tabs: { upload: "Enviar", retrieve: "Recuperar" },
  },
  'pt-PT': {
    badge: "API para programadores",
    title: "Feito para programadores",
    subtitle: "Use DOCSET via UI ou integre usando uma API REST simples. Respostas JSON, webhooks e mais.",
    cta: "Ver demonstração",
    tabs: { upload: "Enviar", retrieve: "Recuperar" },
  },
};

const finalCTAFallback = {
  en: {
    title: "Start using DOCSET today",
    subtitle: "No credit card required. Start extracting structured data in minutes.",
    cta: "Get started for free",
  },
  'pt-BR': {
    title: "Comece a usar DOCSET hoje",
    subtitle: "Sem cartão de crédito. Comece a extrair dados estruturados em minutos.",
    cta: "Começar grátis",
  },
  'pt-PT': {
    title: "Comece a usar DOCSET hoje",
    subtitle: "Sem cartão de crédito. Comece a extrair dados estruturados em minutos.",
    cta: "Começar grátis",
  },
};

const headerNavFallback = {
  en: { features: "Features", pricing: "Pricing", api: "API", login: "Login", startFree: "Start free", dashboard: "Dashboard" },
  'pt-BR': { features: "Recursos", pricing: "Preços", api: "API", login: "Entrar", startFree: "Começar grátis", dashboard: "Painel" },
  'pt-PT': { features: "Recursos", pricing: "Preços", api: "API", login: "Entrar", startFree: "Começar grátis", dashboard: "Painel" },
};

const miscFallback = {
    en: { builtForDevelopers: "Built for data extraction", mostPopular: "Most popular" },
    'pt-BR': { builtForDevelopers: "Feito para extração de dados", mostPopular: "Mais popular" },
    'pt-PT': { builtForDevelopers: "Feito para extração de dados", mostPopular: "Mais popular" },
};

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
      <ProductFlow locale={fullLocale} />
      <Features locale={fullLocale} />
      <CodeExample locale={fullLocale} onOpenDemo={() => setShowDemo(true)} />
      <Pricing locale={fullLocale} />
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

  const getHeaderText = () => {
    if (locale === 'pt-BR' || locale === 'pt') return headerNavFallback['pt-BR'];
    if (locale === 'pt-PT') return headerNavFallback['pt-PT'];
    return headerNavFallback.en;
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
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <FileJson className="h-5 w-5 text-white" />
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
  const getHeroText = () => {
    if (locale === 'pt-BR' || locale === 'pt') return heroFallback['pt-BR'];
    if (locale === 'pt-PT') return heroFallback['pt-PT'];
    return heroFallback.en;
  };
  
  const heroRaw = getHeroText();
  const seoContent = getSEOContent(locale);

  return (
    <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-transparent to-transparent" />
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-700/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Badge className="mb-6 bg-blue-500/10 text-blue-300 border-blue-500/20 hover:bg-blue-500/20">
            <Sparkles className="w-3 h-3 mr-1" />
            {(() => {
              if (locale === 'pt-BR' || locale === 'pt') return miscFallback['pt-BR'].builtForDevelopers;
              if (locale === 'pt-PT') return miscFallback['pt-PT'].builtForDevelopers;
              return miscFallback.en.builtForDevelopers;
            })()}
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-6">
            {seoContent.h1}
          </h1>

          <p className="text-xl text-gray-400 leading-relaxed mb-10 max-w-3xl mx-auto">
            {heroRaw.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                onClick={() => router.visit(`/${locale}/register`)}
                className="bg-white text-black hover:bg-gray-200 px-8 h-12 text-base font-medium shadow-lg shadow-white/20"
              >
                {heroRaw.cta_primary}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                variant="outline"
                onClick={onOpenDemo}
                className="border-white/20 text-white hover:bg-white/10 px-8 h-12 text-base font-medium"
              >
                <Play className="mr-2 h-4 w-4" />
                {heroRaw.cta_demo}
              </Button>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20"
        >
          <AnimatedProductDemo />
        </motion.div>
      </div>
    </section>
  );
}

function AnimatedProductDemo() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 pointer-events-none" />
      
      <motion.div
        className="bg-zinc-900 rounded-2xl border border-white/10 p-4 sm:p-8 shadow-2xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="flex gap-2 mb-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                step === i ? 'bg-blue-500' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold">1. Upload document</h3>
                  <p className="text-sm text-gray-400">PDF, JPG, or PNG</p>
                </div>
              </div>
              <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center">
                <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">invoice_march_2024.pdf</p>
                <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5 }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="define"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold">2. Define & review fields</h3>
                  <p className="text-sm text-gray-400">Edit extracted data</p>
                </div>
              </div>
              <div className="grid gap-3">
                {[
                  { label: "Invoice Number", value: "#INV-2024-001" },
                  { label: "Total Amount", value: "€12,450.00" },
                  { label: "Date", value: "2024-01-05" },
                ].map((field, i) => (
                  <motion.div
                    key={field.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white/5 rounded-lg p-4 flex items-center justify-between border border-white/10"
                  >
                    <div>
                      <p className="text-xs text-gray-400">{field.label}</p>
                      <p className="font-mono font-medium">{field.value}</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="export"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Database className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold">3. Export or use API</h3>
                  <p className="text-sm text-gray-400">Get structured data</p>
                </div>
              </div>
              <div className="bg-zinc-950 rounded-lg p-6 border border-white/10">
                <pre className="text-xs font-mono text-gray-300 overflow-x-auto">
                  <code>{`{
  "invoice_number": "#INV-2024-001",
  "amount": 12450.00,
  "date": "2024-01-05",
  "status": "validated"
}`}</code>
                </pre>
              </div>
              <div className="flex gap-2">
                {[
                  { icon: Download, label: "CSV" },
                  { icon: FileJson, label: "JSON" },
                  { icon: Code, label: "API" },
                ].map((item) => (
                  <Button
                    key={item.label}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-white/10 text-white hover:bg-white/5"
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function ProductFlow({ locale }: { locale: string }) {
  const getProductFlowText = () => {
    if (locale === 'pt-BR' || locale === 'pt') return productFlowFallback['pt-BR'];
    if (locale === 'pt-PT') return productFlowFallback['pt-PT'];
    return productFlowFallback.en;
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
  const getFeaturesText = () => {
    if (locale === 'pt-BR' || locale === 'pt') return featuresFallback['pt-BR'];
    if (locale === 'pt-PT') return featuresFallback['pt-PT'];
    return featuresFallback.en;
  };
  
  const featuresText = getFeaturesText();

  return (
    <section id="features" className="py-20 md:py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {featuresText.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuresText.items.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group"
            >
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-blue-500/50 transition-all duration-300">
                <feature.icon className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CodeExample({ locale, onOpenDemo }: { locale: string; onOpenDemo: () => void }) {
  const getCodeExampleText = () => {
    if (locale === 'pt-BR' || locale === 'pt') return codeExampleFallback['pt-BR'];
    if (locale === 'pt-PT') return codeExampleFallback['pt-PT'];
    return codeExampleFallback.en;
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

function Pricing({ locale }: { locale: string }) {
  const getPricingText = () => {
    if (locale === 'pt-BR' || locale === 'pt') return pricingFallback['pt-BR'];
    if (locale === 'pt-PT') return pricingFallback['pt-PT'];
    return pricingFallback.en;
  };

  const pricingText = getPricingText();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch(`/api/plans?locale=${locale}`);
        const data = await response.json();
        if (data && Object.keys(data).length > 0) {
          // Convert object to array and sort by order
          const plansArray = Object.values(data).map((plan: any, index) => ({
            ...plan,
            order: plan.id === 'free' ? 0 : plan.id === 'starter' ? 1 : plan.id === 'pro' ? 2 : 3,
          }));
          setPlans(plansArray.sort((a: any, b: any) => a.order - b.order));
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [locale]);

  const getRecurringText = (recurring: any) => {
    if (!recurring) return '';
    const interval = recurring.interval;
    const count = recurring.interval_count || 1;
    
    const intervalTexts: any = {
      en: { month: '/mo', year: '/yr' },
      'pt-BR': { month: '/mês', year: '/ano' },
      'pt-PT': { month: '/mês', year: '/ano' },
    };
    
    const localeTexts = intervalTexts[locale] || intervalTexts.en;
    
    if (count === 1) {
      return localeTexts[interval] || `/${interval}`;
    }
    return `/${count} ${interval}s`;
  };

  const displayPlans = plans.map(plan => ({
    id: plan.id,
    name: plan.display_name || plan.name,
    price: plan.id === 'free' ? '0' : plan.price,
    frequency: plan.id === 'free' ? pricingText.freeForever : (plan.recurring ? getRecurringText(plan.recurring) : ''),
    price_id: plan.price_id || plan.id,
    popular: plan.recommended || false,
    features: plan.features || [],
    order: plan.order || 0,
  }));

  return (
    <section id="pricing" className="py-20 md:py-32 relative">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">{pricingText.title}</h2>
          <p className="text-xl text-gray-400">{pricingText.subtitle}</p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading pricing...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No pricing plans available</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayPlans.map((plan, i) => (
              <motion.div
                key={plan.price_id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <div
                  className={`relative h-full rounded-2xl p-8 border transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-b from-blue-500/10 to-transparent border-blue-500 shadow-lg shadow-blue-500/20'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  {plan.popular && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="absolute -top-4 left-1/2 -translate-x-1/2"
                    >
                      <Badge className="bg-blue-500 text-white border-0">
                        {(() => {
                          if (locale === 'pt-BR' || locale === 'pt') return miscFallback['pt-BR'].mostPopular;
                          if (locale === 'pt-PT') return miscFallback['pt-PT'].mostPopular;
                          return miscFallback.en.mostPopular;
                        })()}
                      </Badge>
                    </motion.div>
                  )}
                  
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.frequency && (
                        <span className={plan.id === 'free' ? "text-blue-400 text-sm font-medium ml-1" : "text-gray-400"}>
                          {plan.frequency}
                        </span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <motion.li 
                        key={feature} 
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 + idx * 0.05 }}
                        className="flex items-center gap-2 text-sm text-gray-300"
                      >
                        <Check className="w-4 h-4 text-blue-400" />
                        {feature}
                      </motion.li>
                    ))}
                  </ul>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={() => router.visit(`/${locale}/register`)}
                      className={`w-full ${
                        plan.popular
                          ? 'bg-blue-500 hover:bg-blue-600 text-white'
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                      }`}
                    >
                      {pricingText.cta}
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
              ))}
            </div>
            
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-12 text-center"
            >
              <p className="text-gray-500 text-sm italic">
                {pricingText.limitsRenewMonthly}
              </p>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}

function FinalCTA({ locale }: { locale: string }) {
  const getFinalCTAText = () => {
    if (locale === 'pt-BR' || locale === 'pt') return finalCTAFallback['pt-BR'];
    if (locale === 'pt-PT') return finalCTAFallback['pt-PT'];
    return finalCTAFallback.en;
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
  return (
    <footer className="border-t border-white/10 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <FileJson className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg">DOCSET</span>
            </div>
            <p className="text-sm text-gray-400">
              Turn documents into structured data
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#features" className="hover:text-white transition">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href={`/${locale}/privacy`} className="hover:text-white transition">Privacy</a></li>
              <li><a href={`/${locale}/terms`} className="hover:text-white transition">Terms</a></li>
            </ul>
          </div>
        </div>

        <Separator className="my-12 bg-white/10" />

        <div className="text-center text-sm text-gray-400">
          <p> 2025 DOCSET. All rights reserved.</p>
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
        setError('File size must not exceed 5MB');
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
      setError('File size must not exceed 5MB');
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
          toast.error('You have already used the demo. Please register to continue using DOCSET.');
          setTimeout(() => {
            onClose();
            router.visit(`/${locale}/register`);
          }, 2500);
          return;
        }
        throw new Error(data.message || 'Extraction failed');
      }

      setResult(data.data);
      toast.success('Data extracted successfully!');
    } catch (error: any) {
      console.error('Demo extraction error:', error);
      setError(error.message || 'An error occurred');
      toast.error(error.message || 'An error occurred');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Try DOCSET Demo</DialogTitle>
          <DialogDescription className="text-gray-400">
            Upload a document to see how DOCSET extracts data automatically
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
                Click to upload
              </Label>
              <p className="text-sm text-gray-400 mt-3">
                PDF, JPG, PNG (max 5MB)
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
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Extract Data
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
                  <h3 className="text-xl font-bold text-green-400">Data Extracted Successfully!</h3>
                  <p className="text-sm text-gray-400">Review the extracted fields below</p>
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
              <p className="font-medium mb-2 text-blue-300">🎉 Demo completed!</p>
              <p className="text-sm text-gray-400">
                Register now to unlock unlimited processing and all features
              </p>
            </div>

            <Button 
              onClick={onDemoComplete} 
              className="w-full bg-white text-black hover:bg-gray-200" 
              size="lg"
            >
              Register to Continue
              <ArrowRight className="ml-2" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
