import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { router, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { setPortugueseVariant } from "@/i18n/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Flag from "react-world-flags";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Users,
  BarChart3,
  Lock,
  X,
  Moon,
  Sun,
  Code,
  Database,
  FileJson,
  Smartphone,
  Globe2,
  TrendingUp,
  DollarSign,
  Clock,
  Target,
  Layers,
  Settings,
  Download,
  Eye,
  Check,
} from "lucide-react";
import { toast } from "sonner";

export default function Welcome() {
  const { t, i18n } = useTranslation();
  const { props } = usePage();
  const [locale, setLocale] = useState<'pt' | 'en'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('selected-locale') as 'pt' | 'en' | null) === 'en' ? 'en' : 'pt';
    }
    return 'pt';
  });
  const [ptVariant, setPtVariant] = useState<'pt-PT' | 'pt-BR'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pt-variant') as 'pt-PT' | 'pt-BR' | null;
      return saved ?? 'pt-PT';
    }
    return 'pt-PT';
  });
  const [showDemo, setShowDemo] = useState(false);
  const [demoUsed, setDemoUsed] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Detectar tema salvo
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }

    // Detectar localização
    const detectLocale = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const country = data.country_code?.toLowerCase();
        const portugueseCountries = ['pt', 'br', 'ao', 'mz', 'gw', 'cv', 'st', 'tl'];
        const isPortugueseCountry = country ? portugueseCountries.includes(country) : false;
        const detectedLocale: 'pt' | 'en' = isPortugueseCountry ? 'pt' : 'en';
        const detectedVariant: 'pt-PT' | 'pt-BR' = country === 'br' ? 'pt-BR' : 'pt-PT';

        const savedLocale = localStorage.getItem('selected-locale') as 'pt' | 'en' | null;
        const savedVariant = localStorage.getItem('pt-variant') as 'pt-PT' | 'pt-BR' | null;

        const finalLocale = savedLocale ?? detectedLocale;
        const finalVariant = savedVariant ?? detectedVariant;

        setLocale(finalLocale);
        localStorage.setItem('selected-locale', finalLocale);
        i18n.changeLanguage(finalLocale);

        if (finalLocale === 'pt') {
          setPtVariant(finalVariant);
          setPortugueseVariant(finalVariant);
          localStorage.setItem('pt-variant', finalVariant);
        }
      } catch (error) {
        const fallbackLocale = (localStorage.getItem('selected-locale') as 'pt' | 'en' | null) ?? 'pt';
        const fallbackVariant = (localStorage.getItem('pt-variant') as 'pt-PT' | 'pt-BR' | null) ?? 'pt-PT';

        setLocale(fallbackLocale);
        i18n.changeLanguage(fallbackLocale);

        if (fallbackLocale === 'pt') {
          setPtVariant(fallbackVariant);
          setPortugueseVariant(fallbackVariant);
        }
      }
    };

    detectLocale();
    const used = localStorage.getItem('demo-used');
    if (used) setDemoUsed(true);
  }, [i18n]);

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

  const handleLocaleChange = useCallback((newLocale: 'pt' | 'en', variant?: 'pt-PT' | 'pt-BR') => {
    let variantChanged = false;

    if (newLocale === 'pt') {
      const nextVariant = variant ?? ptVariant;
      if (nextVariant !== ptVariant) {
        variantChanged = true;
        setPtVariant(nextVariant);
        setPortugueseVariant(nextVariant);
        localStorage.setItem('pt-variant', nextVariant);
      }
    }

    if (locale === newLocale && !variantChanged) {
      return;
    }

    if (locale !== newLocale) {
      setLocale(newLocale);
      localStorage.setItem('selected-locale', newLocale);
      i18n.changeLanguage(newLocale);
      window.location.href = `/${newLocale}`;
    } else if (variantChanged) {
      i18n.changeLanguage('pt');
    }
  }, [i18n, locale, ptVariant]);

  const handleDemoClick = useCallback(() => {
    if (demoUsed) {
      toast.error(t('Demo already used. Please register to continue.'));
      setTimeout(() => router.visit(`/${locale}/register`), 2000);
    } else {
      setShowDemo(true);
    }
  }, [demoUsed, locale, t]);

  return (
    <div className="bg-background text-foreground antialiased overflow-x-hidden transition-colors duration-300">
      <Header
        locale={locale}
        onLocaleChange={handleLocaleChange}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <Hero locale={locale} onDemoClick={handleDemoClick} />
      <TrustBadges />
      <Stats />
      <Features />
      <RealFeatures />
      <HowItWorks />
      <UseCases />
      <Integration />
      <Testimonials />
      <Pricing locale={locale} />
      <FAQ />
      <FinalCTA locale={locale} />
      <Footer locale={locale} />

      {showDemo && (
        <DemoModal
          onClose={() => setShowDemo(false)}
          locale={locale}
          onDemoComplete={() => {
            setDemoUsed(true);
            localStorage.setItem('demo-used', 'true');
            setShowDemo(false);
            toast.success(t('Demo completed! Register to continue using GetData.'));
            setTimeout(() => router.visit(`/${locale}/register`), 2000);
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
}: {
  locale: string;
  onLocaleChange: (locale: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}) {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-lg shadow-lg border-b"
          : "bg-background/80 backdrop-blur"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
            <FileJson className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            GetData
          </span>
        </motion.div>

        <nav className="hidden md:flex gap-6 text-sm font-medium">
          {[
            { label: t('Features'), href: '#features' },
            { label: t('How it works'), href: '#how-it-works' },
            { label: t('API'), href: '#integration' },
            { label: t('Pricing'), href: '#pricing' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-muted-foreground hover:text-foreground transition"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            className="relative"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button
              variant={locale === 'pt' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onLocaleChange('pt')}
              className="gap-1.5"
            >
              <span className="text-base">🇵🇹</span>
              <span className="text-xs">PT</span>
            </Button>
            <Button
              variant={locale === 'en' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onLocaleChange('en')}
              className="gap-1.5"
            >
              <span className="text-base">🇬🇧</span>
              <span className="text-xs">EN</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            onClick={() => router.visit(`/${locale}/login`)}
            className="hidden md:inline-flex"
          >
            {t('Login')}
          </Button>

          <Button onClick={() => router.visit(`/${locale}/register`)}>
            {t('Start Free Trial')}
          </Button>
        </div>
      </div>
    </motion.header>
  );
}

function Hero({ locale, onDemoClick }: { locale: string; onDemoClick: () => void }) {
  const { t } = useTranslation();

  return (
    <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="h-3 w-3 mr-1" />
            {t('Join 2,500+ teams saving 40+ hours/month')}
          </Badge>

          <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
            {t('Turn documents into')}
            <span className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent">
              {" "}
              {t('actionable data')}
            </span>
            <br />
            {t('in seconds')}
          </h1>

          <p className="text-xl text-muted-foreground leading-relaxed mb-8">
            {t('Stop wasting hours copying data from PDFs manually. GetData uses AI to extract, organize and analyze information from any document — automatically.')}
          </p>

          <div className="flex flex-wrap gap-4 mb-8">
            <Button
              onClick={() => router.visit(`/${locale}/register`)}
              size="lg"
              className="text-base"
            >
              {t('Get Started Free')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <Button onClick={onDemoClick} size="lg" variant="outline" className="text-base">
              <Sparkles className="mr-2 h-5 w-5" />
              {t('Try Demo (Free)')}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            {[
              t('No credit card required'),
              t('14-day free trial'),
              t('Cancel anytime'),
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                {text}
              </div>
            ))}
          </div>
        </motion.div>

        <HeroAnimation />
      </div>
    </section>
  );
}

function HeroAnimation() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative"
    >
      <Card className="overflow-hidden">
        <CardContent className="p-8">
          <div className="flex justify-center gap-2 mb-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  step === i ? 'w-8 bg-blue-600' : 'w-2 bg-muted'
                }`}
              />
            ))}
          </div>

          {step === 0 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold">invoice_march_2024.pdf</p>
                  <p className="text-sm text-muted-foreground">245 KB • PDF Document</p>
                </div>
              </div>
              <Progress value={100} className="h-2" />
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="w-16 h-16 mx-auto mb-4"
              >
                <Sparkles className="h-16 w-16" />
              </motion.div>
              <p className="text-center font-semibold">AI Extracting Data...</p>
              <Progress value={65} className="mt-4 bg-white/20" />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Invoice Number</CardDescription>
                    <CardTitle className="text-2xl">#INV-2024</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Total Amount</CardDescription>
                    <CardTitle className="text-2xl text-green-600">€12,450</CardTitle>
                  </CardHeader>
                </Card>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                <CheckCircle className="h-4 w-4" />
                Data extracted successfully!
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TrustBadges() {
  const { t } = useTranslation();
  const badges = [
    { icon: "🏆", text: t('G2 Leader 2024') },
    { icon: "⭐", text: t('4.9/5 on Capterra') },
    { icon: "🔒", text: t('ISO 27001 Certified') },
    { icon: "🇪🇺", text: t('GDPR Compliant') },
    { icon: "💯", text: t('99.9% Uptime') },
  ];

  return (
    <section className="py-12 bg-muted/50 border-y">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap justify-center items-center gap-8">
          {badges.map((badge, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2"
            >
              <span className="text-2xl">{badge.icon}</span>
              <span className="font-medium text-sm">{badge.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const { t } = useTranslation();
  const stats = [
    { value: "95%", label: t('Time Saved'), icon: Clock },
    { value: "€2,850", label: t('Monthly Savings'), icon: DollarSign },
    { value: "99.8%", label: t('Accuracy Rate'), icon: Target },
    { value: "24/7", label: t('Automated'), icon: Zap },
  ];

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">{t('The numbers speak for themselves')}</h2>
          <p className="text-xl text-muted-foreground">
            {t('Real results from real businesses')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                    <stat.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent">
                    {stat.value}
                  </CardTitle>
                  <CardDescription className="text-base">{stat.label}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const { t } = useTranslation();
  const features = [
    {
      icon: Zap,
      title: t('Lightning Fast'),
      desc: t('Extract data from documents in seconds'),
    },
    {
      icon: Shield,
      title: t('99.8% Accuracy'),
      desc: t('Industry-leading precision powered by AI'),
    },
    {
      icon: Lock,
      title: t('Bank-Level Security'),
      desc: t('AES-256 encryption and GDPR compliant'),
    },
    {
      icon: BarChart3,
      title: t('Advanced Analytics'),
      desc: t('Built-in dashboards and insights'),
    },
  ];

  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">{t('Why teams choose GetData')}</h2>
          <p className="text-xl text-muted-foreground">
            {t('Everything you need to transform documents')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.desc}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RealFeatures() {
  const { t } = useTranslation();

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">{t('Real Features. Real Power.')}</h2>
          <p className="text-xl text-muted-foreground">
            {t('Everything built into the platform')}
          </p>
        </motion.div>

        <Tabs defaultValue="extraction" className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4">
            <TabsTrigger value="extraction">
              <FileText className="h-4 w-4 mr-2" />
              {t('Extraction')}
            </TabsTrigger>
            <TabsTrigger value="validation">
              <Eye className="h-4 w-4 mr-2" />
              {t('Validation')}
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              {t('Analytics')}
            </TabsTrigger>
            <TabsTrigger value="export">
              <Download className="h-4 w-4 mr-2" />
              {t('Export')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="extraction" className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>{t('AI-Powered Data Extraction')}</CardTitle>
                <CardDescription>
                  {t('Extract data from any document format with 99.8% accuracy')}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">{t('Multi-Format Support')}</p>
                      <p className="text-sm text-muted-foreground">
                        PDF, JPG, PNG, TIFF, Scanned Documents
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">{t('Custom Field Mapping')}</p>
                      <p className="text-sm text-muted-foreground">
                        Define exactly which fields to extract
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">{t('Batch Processing')}</p>
                      <p className="text-sm text-muted-foreground">
                        Process hundreds of documents simultaneously
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">{t('50+ Languages')}</p>
                      <p className="text-sm text-muted-foreground">
                        Extract data from documents in any language
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-6 font-mono text-sm">
                  <pre className="text-xs overflow-x-auto">
{`{
  "invoice_number": "INV-2024-03-001",
  "date": "2024-03-15",
  "customer": "ACME Corp",
  "total": 12450.00,
  "currency": "EUR",
  "items": [
    {
      "description": "Service A",
      "quantity": 10,
      "unit_price": 1245.00
    }
  ],
  "status": "paid"
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="validation" className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>{t('Visual Validation Interface')}</CardTitle>
                <CardDescription>
                  {t('Review and edit extracted data before saving')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-3">
                      <CardDescription>{t('Side-by-side view')}</CardDescription>
                      <CardTitle className="text-lg">
                        {t('Document + Data')}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-3">
                      <CardDescription>{t('Quick edit')}</CardDescription>
                      <CardTitle className="text-lg">
                        {t('Inline corrections')}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-3">
                      <CardDescription>{t('Confidence score')}</CardDescription>
                      <CardTitle className="text-lg">
                        {t('Per-field accuracy')}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>{t('Built-in Analytics Dashboard')}</CardTitle>
                <CardDescription>
                  {t('Real-time insights from your document data')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Processed', value: '1,247', trend: '+12%' },
                    { label: 'Revenue', value: '€45,230', trend: '+8%' },
                    { label: 'Accuracy', value: '99.8%', trend: '+0.2%' },
                    { label: 'Time Saved', value: '42h', trend: '+15%' },
                  ].map((stat, i) => (
                    <Card key={i}>
                      <CardHeader className="pb-3">
                        <CardDescription>{stat.label}</CardDescription>
                        <CardTitle className="text-2xl">{stat.value}</CardTitle>
                        <Badge variant="secondary" className="w-fit mt-2">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {stat.trend}
                        </Badge>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>{t('Multiple Export Options')}</CardTitle>
                <CardDescription>
                  {t('Export your data in any format you need')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { format: 'Excel / CSV', icon: '📊', desc: 'Spreadsheet formats' },
                    { format: 'JSON', icon: '{ }', desc: 'API-ready data' },
                    { format: 'PDF Report', icon: '📄', desc: 'Professional reports' },
                  ].map((option, i) => (
                    <Card key={i} className="bg-muted/30">
                      <CardHeader>
                        <div className="text-4xl mb-2">{option.icon}</div>
                        <CardTitle className="text-lg">{option.format}</CardTitle>
                        <CardDescription>{option.desc}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

function HowItWorks() {
  const { t } = useTranslation();
  const steps = [
    {
      title: t('Upload Documents'),
      desc: t('Drag & drop PDFs, images, or scan documents'),
      icon: Upload,
    },
    {
      title: t('AI Extracts Data'),
      desc: t('Our AI identifies and extracts key information'),
      icon: Sparkles,
    },
    {
      title: t('Review & Validate'),
      desc: t('Check and approve extracted data'),
      icon: Eye,
    },
    {
      title: t('Export & Integrate'),
      desc: t('Export or integrate via API'),
      icon: Download,
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">
            {t('From document to insight in 4 steps')}
          </h2>
          <p className="text-xl text-muted-foreground">
            {t('No technical knowledge required')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
            >
              <Card className="relative h-full">
                <Badge className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center">
                  {i + 1}
                </Badge>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                    <step.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle>{step.title}</CardTitle>
                  <CardDescription>{step.desc}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function UseCases() {
  const { t } = useTranslation();
  const cases = [
    {
      title: t('Finance & Accounting'),
      desc: t('Process invoices and expense reports'),
      icon: "💰",
      metrics: t('Save 35+ hours/month'),
    },
    {
      title: t('Legal & Compliance'),
      desc: t('Extract data from contracts'),
      icon: "⚖️",
      metrics: t('99.9% accuracy'),
    },
    {
      title: t('HR & Recruitment'),
      desc: t('Parse resumes instantly'),
      icon: "👥",
      metrics: t('10x faster processing'),
    },
    {
      title: t('Healthcare'),
      desc: t('Digitize medical records'),
      icon: "🏥",
      metrics: t('HIPAA compliant'),
    },
  ];

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">{t('Built for every industry')}</h2>
          <p className="text-xl text-muted-foreground">
            {t('Trusted by teams across multiple sectors')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cases.map((useCase, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="text-5xl mb-4">{useCase.icon}</div>
                  <CardTitle>{useCase.title}</CardTitle>
                  <CardDescription className="mb-4">{useCase.desc}</CardDescription>
                  <Badge className="w-fit">{useCase.metrics}</Badge>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Integration() {
  const { t } = useTranslation();

  return (
    <section id="integration" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">{t('Powerful API Integration')}</h2>
          <p className="text-xl text-muted-foreground">
            {t('Connect GetData with your existing tools')}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <Card>
            <CardHeader>
              <CardTitle>{t('RESTful API')}</CardTitle>
              <CardDescription>
                {t('Simple, powerful, and well-documented API')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Code className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">{t('Easy Integration')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('Connect in minutes with any programming language')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Database className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">{t('Webhooks')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('Real-time notifications when processing completes')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Layers className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">{t('SDK Available')}</p>
                  <p className="text-sm text-muted-foreground">
                    Python, Node.js, PHP, Ruby
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="p-6">
              <pre className="text-xs font-mono overflow-x-auto">
{`// Upload & extract data
const formData = new FormData();
formData.append('file', pdfFile);

const response = await fetch(
  'https://api.getdata.io/v1/extract',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    },
    body: formData
  }
);

const data = await response.json();
console.log(data);
// {
//   "invoice_number": "INV-2024-03-001",
//   "total": 12450.00,
//   "customer": "ACME Corp"
// }`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const { t } = useTranslation();
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: t('CFO at TechCorp'),
      avatar: "👩‍💼",
      quote: t('GetData saved our finance team 45 hours per month. The ROI was immediate and the accuracy is incredible.'),
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: t('Operations Manager'),
      avatar: "👨‍💼",
      quote: t('We process 500+ invoices monthly. GetData reduced our processing time by 90%.'),
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: t('Legal Director'),
      avatar: "👩‍⚖️",
      quote: t('The ability to extract data from contracts has transformed how our legal team works.'),
      rating: 5,
    },
  ];

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">{t('Loved by teams worldwide')}</h2>
          <p className="text-xl text-muted-foreground">
            {t('Join 2,500+ companies transforming their workflows')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-lg">⭐</span>
                    ))}
                  </div>
                  <CardDescription className="text-base italic mb-4">
                    "{testimonial.quote}"
                  </CardDescription>
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{testimonial.avatar}</div>
                    <div>
                      <p className="font-bold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing({ locale }: { locale: string }) {
  const { t } = useTranslation();
  const plans = [
    {
      name: t('Starter'),
      price: "49",
      desc: t('Perfect for small teams'),
      features: [
        t('100 documents/month'),
        t('Basic AI extraction'),
        t('Email support'),
        t('Export to CSV/Excel'),
      ],
      popular: false,
    },
    {
      name: t('Professional'),
      price: "149",
      desc: t('For growing businesses'),
      features: [
        t('500 documents/month'),
        t('Advanced AI extraction'),
        t('Priority support'),
        t('API access'),
        t('Advanced analytics'),
      ],
      popular: true,
    },
    {
      name: t('Enterprise'),
      price: t('Custom'),
      desc: t('For large organizations'),
      features: [
        t('Unlimited documents'),
        t('Custom AI training'),
        t('Dedicated support'),
        t('SLA guarantee'),
      ],
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">{t('Simple, transparent pricing')}</h2>
          <p className="text-xl text-muted-foreground">
            {t('Start free, upgrade as you grow')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: plan.popular ? -12 : -8 }}
              className={plan.popular ? 'scale-105' : ''}
            >
              <Card className={`relative h-full ${plan.popular ? 'border-blue-600 border-2' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    {t('MOST POPULAR')}
                  </Badge>
                )}

                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.desc}</CardDescription>
                  <div className="mt-4">
                    {plan.price === t('Custom') ? (
                      <span className="text-4xl font-bold">{plan.price}</span>
                    ) : (
                      <>
                        <span className="text-5xl font-bold">€{plan.price}</span>
                        <span className="text-muted-foreground">/{t('month')}</span>
                      </>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => router.visit(`/${locale}/register`)}
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {t('Start Free Trial')}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <p className="text-center mt-12 text-muted-foreground">
          {t('All plans include 14-day free trial • No credit card • Cancel anytime')}
        </p>
      </div>
    </section>
  );
}

function FAQ() {
  const { t } = useTranslation();
  const faqs = [
    {
      q: t('How accurate is the data extraction?'),
      a: t('GetData achieves 99.8% accuracy on average. Our AI is trained on millions of documents.'),
    },
    {
      q: t('What file formats do you support?'),
      a: t('We support PDF, JPG, PNG, TIFF, and scanned documents.'),
    },
    {
      q: t('Is my data secure?'),
      a: t('Yes. We use AES-256 encryption and are GDPR compliant.'),
    },
    {
      q: t('Can I try before buying?'),
      a: t('Yes! We offer a 14-day free trial with no credit card required.'),
    },
  ];

  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">{t('Frequently asked questions')}</h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.details
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <summary className="flex items-center justify-between p-6 rounded-lg bg-muted cursor-pointer hover:bg-muted/80 transition">
                <span className="font-semibold">{faq.q}</span>
                <span className="text-2xl group-open:rotate-180 transition-transform">↓</span>
              </summary>
              <Card className="mt-2 border-t-0 rounded-t-none">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            </motion.details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ locale }: { locale: string }) {
  const { t } = useTranslation();

  return (
    <section className="py-32 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 dark:from-blue-900 dark:via-blue-800 dark:to-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            {t('Ready to transform your document workflow?')}
          </h2>

          <p className="text-2xl mb-12 text-blue-100">
            {t('Start your free 14-day trial. No credit card required.')}
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={() => router.visit(`/${locale}/register`)}
              size="lg"
              variant="secondary"
              className="text-lg"
            >
              {t('Start Free Trial')}
              <ArrowRight className="ml-2" />
            </Button>

            <Button
              onClick={() => router.visit(`/${locale}/login`)}
              size="lg"
              variant="outline"
              className="text-lg border-white text-white hover:bg-white/10"
            >
              {t('Login')}
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer({ locale }: { locale: string }) {
  const { t } = useTranslation();

  return (
    <footer className="bg-muted py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                <FileJson className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg">GetData</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('Transform documents into actionable data')}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t('Product')}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[t('Features'), t('Pricing'), t('API')].map((item, i) => (
                <li key={i}>
                  <a href="#" className="hover:text-foreground transition">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t('Company')}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[t('About'), t('Blog'), t('Contact')].map((item, i) => (
                <li key={i}>
                  <a href="#" className="hover:text-foreground transition">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t('Legal')}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[t('Privacy Policy'), t('Terms of Service')].map((item, i) => (
                <li key={i}>
                  <a href="#" className="hover:text-foreground transition">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} GetData. {t('All rights reserved.')}</p>
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

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError(t('File size must not exceed 5MB'));
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
      setError(t('File size must not exceed 5MB'));
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
          toast.error(t('You have already used the demo. Please register to continue using GetData.'));
          setTimeout(() => {
            onClose();
            router.visit(`/${locale}/register`);
          }, 2500);
          return;
        }
        throw new Error(data.message || 'Extraction failed');
      }

      setResult(data.data);
      toast.success(t('Data extracted successfully!'));
    } catch (error: any) {
      console.error('Demo extraction error:', error);
      setError(error.message || t('An error occurred'));
      toast.error(error.message || t('An error occurred'));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('Try GetData Demo')}</DialogTitle>
          <DialogDescription>
            {t('Upload a document to see how GetData extracts data automatically')}
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-6">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <Input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                id="demo-file"
              />
              <Label
                htmlFor="demo-file"
                className="cursor-pointer text-blue-600 hover:text-blue-700 font-semibold"
              >
                {t('Click to upload')}
              </Label>
              <p className="text-sm text-muted-foreground mt-2">
                {t('PDF, JPG, PNG (max 5MB)')}
              </p>
              {file && (
                <Badge variant="secondary" className="mt-4">
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </Badge>
              )}
              {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                </div>
              )}
            </div>

            <Button onClick={handleProcess} disabled={!file || processing || !!error} className="w-full" size="lg">
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
            <Card className="bg-green-50 dark:bg-green-950">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <CardTitle className="text-green-900 dark:text-green-100">
                    {t('Data Extracted Successfully!')}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(result).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-3 bg-white dark:bg-gray-900 rounded-lg">
                    <span className="font-medium capitalize">
                      {key.replace('_', ' ')}:
                    </span>
                    <span className="font-bold">{value as string}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-blue-50 dark:bg-blue-950">
              <CardContent className="pt-6">
                <p className="font-medium mb-2">🎉 {t('Demo completed!')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('Register now to unlock unlimited processing')}
                </p>
              </CardContent>
            </Card>

            <Button onClick={onDemoComplete} className="w-full" size="lg">
              {t('Register to Continue')}
              <ArrowRight className="ml-2" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
