import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { router, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { setPortugueseVariant } from "@/i18n/config";
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
  Server,
  Calendar,
  Menu,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";

const heroFallback = {
  eyebrow: "Intelligent data extraction platform",
  title: "Turn chaotic documents",
  highlight: "into reliable, usable data",
  subtitle:
    "Upload PDFs or images, define the fields that matter, review every record and deliver structured data for reports or integrations.",
  cta_primary: "Start for free",
  cta_secondary: "Watch demo",
  triggers: [
    "No heavy implementation",
    "You define the model and edit before saving",
    "Reports and API access without complex BI",
  ],
};

const valuePropsFallback = {
  items: [
    {
      title: "Save hours every week",
      desc: "Automate everything that used to depend on copy & paste.",
    },
    {
      title: "Models you control",
      desc: "Define text, number or date fields and reuse templates whenever needed.",
    },
    {
      title: "Transparent review",
      desc: "Compare document vs extracted data and approve with confidence.",
    },
    {
      title: "Reports & API ready",
      desc: "Structured history for simple dashboards, exports or API integrations.",
    },
  ],
};

const controlFallback = {
  title: "End-to-end control",
  subtitle: "The user decides what to extract, how to review and when to activate reports or API access.",
  items: [
    {
      label: "01",
      title: "You define the schema",
      desc: "Create templates with the exact fields that matter (text, number, date) and reuse them across uploads.",
    },
    {
      label: "02",
      title: "Review before saving",
      desc: "Edit each field with side-by-side context and keep full ownership of the final record.",
    },
    {
      label: "03",
      title: "Structured history",
      desc: "Statuses, reprocessing, exports and API access powered by the data you curated.",
    },
  ],
};

const featuresFallback = {
  title: "Real Features. Real Power.",
  subtitle: "Everything we already ship (and what is on the near-term roadmap) to give teams full control.",
  sections: [
    {
      title: "📄 Documents",
      items: [
        "Upload PDFs and images",
        "Full preview with zoom",
        "Processing queue with status history",
        "Async reprocessing on demand",
        "Secure storage with temporary URLs",
      ],
    },
    {
      title: "🧩 Models",
      items: [
        "Custom field definitions (text, number, date)",
        "Reusable templates",
        "Automatic validation",
        "Foundation for extraction and reports",
      ],
    },
    {
      title: "🤖 AI extraction",
      items: [
        "Model-based prompts in PT/EN",
        "OCR fallback for difficult PDFs",
        "JSON output aligned with your schema",
        "Clear error messages",
        "Usage limits by credits/plan",
      ],
    },
    {
      title: "✍️ Review & control",
      items: [
        "Editable fields before saving",
        "Confidence indicators per field",
        "User decides the final result",
      ],
    },
    {
      title: "📊 Reports",
      items: [
        "Built from historical data",
        "Manual or automatic document selection",
        "Date filters & aggregations (sum, avg, count, growth)",
        "Simple charts + CSV/Excel export",
      ],
    },
    {
      title: "🔌 API",
      items: [
        "Upload via API with template selection",
        "Status endpoints to check progress",
        "JSON responses ready for downstream systems",
        "Plan-based limits and API keys",
        "Webhooks + multiple keys on advanced plans",
      ],
    },
    {
      title: "🔐 Security",
      items: [
        "Secure storage with temporary links",
        "Users can delete everything at any time",
        "We never train public models with your data",
      ],
    },
  ],
};

const howItWorksFallback = {
  title: "How it works (3 steps + API)",
  subtitle: "A clear path from document to decision — without friction.",
  steps: [
    {
      title: "Upload",
      desc: "Send PDFs or images. We process asynchronously with queue visibility.",
    },
    {
      title: "Define fields",
      desc: "Choose (or create) a template with the fields that matter.",
    },
    {
      title: "Review & approve",
      desc: "Edit, validate and save. No black boxes.",
    },
    {
      title: "Report & integrate",
      desc: "Use structured history for dashboards, exports or API calls.",
    },
  ],
};

const securityFallback = {
  title: "Security & governance",
  subtitle: "Storage, privacy and deletion policies designed for teams that take data seriously.",
  cards: [
    {
      title: "Storage & privacy",
      desc: "Encrypted storage, temporary links and access only for authorized users.",
    },
    {
      title: "Governance & control",
      desc: "Audit history, ability to delete everything and zero usage of your data to train public models.",
    },
  ],
};

const demoApiFallback = {
  title: "Finance Team",
  subtitle: "Invoice processing example",
  invoiceLabel: "Invoice total",
  invoiceValue: "€18,923.40",
  totalLabel: "Saved using automation",
  totalValue: "€6,134.50",
  benefit: "Saved per quarter with automated data entry",
  cards: [
    {
      title: "Invoice ID",
      desc: "#INV-98213",
    },
    {
      title: "Vendor",
      desc: "Atlantic Services Lda",
    },
    {
      title: "Processed by",
      desc: "Maria S.",
    },
  ],
  integration: {
    title: "Accounting integration",
    subtitle: "Real-time data sync",
    cards: [
      {
        title: "DOC Number",
        desc: "#DOC-98213",
        meta: "Registered in DOCSET",
      },
      {
        title: "Workflow",
        desc: "Approved → Exported → Synced",
        meta: "Status: Completed",
      },
      {
        title: "API Endpoint",
        desc: "POST /api/integrations/accounting",
        meta: "Connected to ERP",
      },
    ],
    example_label: "Quick example",
    example_note: "Available for PRO, Business/Dev and Enterprise.",
    example_code: [
      "curl -X POST https://api.docset.com/upload \\",
      '  -H "Authorization: Bearer <API_KEY>" \\',
      '  -F "file=@document.pdf" \\',
      '  -F "model=invoice_v2"',
      "",
      "curl -X GET https://api.docset.com/status/<JOB_ID> \\",
      '  -H "Authorization: Bearer <API_KEY>"',
    ],
  },
};

const demoFallback = {
  invoiceLabel: "Invoice Number",
  invoiceValue: "#INV-2024",
  totalLabel: "Total Amount",
  totalValue: "€12,450",
  success: "Data extracted successfully!",
};

const faqFallback = {
  title: "Frequently asked questions",
  items: [
    {
      q: "Can I define my own fields?",
      a: "Yes. You decide the schema for each template (text, number, date) and reuse it whenever you upload new documents.",
    },
    {
      q: "Do I need to code to use the platform?",
      a: "No. The UI lets you upload, review and export without writing a single line of code. The API is optional for advanced automation.",
    },
    {
      q: "Is my data secure?",
      a: "Documents are stored securely with temporary links. You can delete everything whenever you need and we never train public models with your data.",
    },
    {
      q: "When should I upgrade to a paid plan?",
      a: "Upgrade when you need more documents, multiple templates, saved reports or API access. You can switch plans anytime.",
    },
  ],
};

const ctaFallback = {
  title: "Ready to structure your documents?",
  subtitle: "Start free, review every field and unlock API access whenever the business needs it.",
  primary: "Start free",
  secondary: "Talk to sales",
};

const pricingFallback = {
  title: "Clear, defensible pricing",
  subtitle: "Start free, grow with predictable limits and unlock API access when it matters.",
  plans: [
    {
      name: "FREE",
      tagline: "Experience the value",
      price: "€0",
      frequency: "",
      highlight: false,
      cta: "Start free",
      features: ["20 documents included", "1 custom model", "UI only", "No saved reports", "No API"],
    },
    {
      name: "STARTER",
      tagline: "For freelancers / personal use",
      price: "€15",
      frequency: "/month",
      highlight: false,
      cta: "Choose Starter",
      features: ["300 documents", "Up to 5 models", "Basic reports", "CSV / Excel export", "Full UI", "No API"],
    },
    {
      name: "PRO",
      tagline: "Primary plan",
      price: "€39",
      frequency: "/month",
      highlight: true,
      cta: "Choose Pro",
      features: [
        "1,500 documents",
        "Unlimited models",
        "Advanced reports + calculated fields",
        "Full export options",
        "API included (5,000 requests / month)",
        "1 API key",
      ],
    },
    {
      name: "BUSINESS",
      tagline: "For teams and technical use",
      price: "€89",
      frequency: "/month",
      highlight: false,
      cta: "Choose Business",
      features: [
        "5,000 documents",
        "Everything in PRO",
        "Advanced API features",
        "25,000 requests / month",
        "Multiple API keys",
        "Webhooks + priority processing",
      ],
    },
    {
      name: "ENTERPRISE",
      tagline: "Custom volume & SLA",
      price: "Custom",
      frequency: "",
      highlight: false,
      cta: "Talk to us",
      features: [
        "Custom document volume",
        "Dedicated SLA",
        "Annual contract",
        "Dedicated support",
        "Onboarding & success",
        "Roadmap alignment",
      ],
    },
  ],
  disclaimer: "All plans include secure storage, manual review workflow and multi-language extraction.",
};

export default function Welcome() {
  const { t, i18n } = useTranslation();
  const { props } = usePage<{ auth?: { user?: any }; canRegister: boolean; locale: string }>();
  const isAuthenticated = !!props.auth?.user;
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
        const response = await fetch('/api/geolocation/detect');
        const data = await response.json();
        const country = data.countryCode?.toLowerCase();
        const continent = data.continent?.toLowerCase();

        const isBrazil = country === 'br';
        const isPortugal = country === 'pt';
        const isEurope = continent === 'europe';

        let detectedLocale: 'pt' | 'en' = 'en';
        let detectedVariant: 'pt-PT' | 'pt-BR' = 'pt-PT';

        if (isBrazil) {
          detectedLocale = 'pt';
          detectedVariant = 'pt-BR';
        } else if (isPortugal || isEurope) {
          detectedLocale = 'pt';
          detectedVariant = 'pt-PT';
        } else {
          detectedLocale = 'en';
        }

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
        const fallbackLocale = (localStorage.getItem('selected-locale') as 'pt' | 'en' | null) ?? 'en';
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
        ptVariant={ptVariant}
        onLocaleChange={handleLocaleChange}
        theme={theme}
        onToggleTheme={toggleTheme}
        isAuthenticated={isAuthenticated}
      />
      <Hero locale={locale} onDemoClick={handleDemoClick} />
      <ValueProps />
      <ControlSection />
      <FeaturesSection />
      <HowItWorks />
      <SecuritySection />
      <Integration />
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
            toast.success(t('Demo completed! Register to continue using Docset.'));
            setTimeout(() => router.visit(`/${locale}/register`), 2000);
          }}
        />
      )}
    </div>
  );
}

function Header({
  locale,
  ptVariant,
  onLocaleChange,
  theme,
  onToggleTheme,
  isAuthenticated,
}: {
  locale: string;
  ptVariant: 'pt-PT' | 'pt-BR';
  onLocaleChange: (locale: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isAuthenticated?: boolean;
}) {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/95 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-b border-border/50"
          : "bg-background/60 backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <motion.div
          whileHover={{ scale: 1.05, rotate: [0, -1, 1, 0] }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 cursor-pointer"
        >
          <motion.div
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30"
            whileHover={{ boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)" }}
          >
            <FileJson className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </motion.div>
          <span className="font-bold text-lg sm:text-xl bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent">
            Docset
          </span>
        </motion.div>

        <nav className="hidden lg:flex gap-6 text-sm font-medium">
          {[
            { label: t('landing.nav.product'), href: '#product' },
            { label: t('landing.nav.control'), href: '#control' },
            { label: t('landing.nav.security'), href: '#security' },
            { label: t('landing.nav.pricing'), href: '#pricing' },
          ].map((item, idx) => (
            <motion.a
              key={item.label}
              href={item.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx, duration: 0.4 }}
              whileHover={{ scale: 1.05, color: "hsl(var(--primary))" }}
              className="text-muted-foreground hover:text-foreground transition-colors relative group"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-400 group-hover:w-full transition-all duration-300" />
            </motion.a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            className="relative hidden sm:inline-flex"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Language Selector */}
          <div className="hidden sm:flex items-center gap-1 bg-muted rounded-lg p-1">
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

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => router.visit(`/${locale}/dashboard`)}
                variant="default"
                className="gap-2"
              >
                <ArrowRight className="h-4 w-4" />
                {t('landing.hero.cta_primary', heroFallback.cta_primary)}
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => router.visit(`/${locale}/login`)}
                className="hidden lg:inline-flex"
                size="sm"
              >
                {t('Login')}
              </Button>

              <Button 
                onClick={() => router.visit(`/${locale}/register`)}
                className="hidden sm:inline-flex"
                size="sm"
              >
                {t('Start Free Trial')}
              </Button>
            </>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="lg:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl"
        >
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
            {/* Mobile Navigation */}
            <nav className="flex flex-col gap-2">
              {[
                { label: t('landing.nav.product'), href: '#product' },
                { label: t('landing.nav.control'), href: '#control' },
                { label: t('landing.nav.security'), href: '#security' },
                { label: t('landing.nav.pricing'), href: '#pricing' },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <Separator />

            {/* Mobile Language & Theme */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant={locale === 'pt' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onLocaleChange('pt')}
                >
                  🇵🇹 PT
                </Button>
                <Button
                  variant={locale === 'en' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onLocaleChange('en')}
                >
                  🇬🇧 EN
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleTheme}
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </div>

            <Separator />

            {/* Mobile Auth Buttons */}
            <div className="flex flex-col gap-2">
              {isAuthenticated ? (
                <Button
                  onClick={() => router.visit(`/${locale}/dashboard`)}
                  variant="default"
                  className="w-full gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  Go to dashboard
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => router.visit(`/${locale}/login`)}
                    className="w-full"
                  >
                    {t('Login')}
                  </Button>
                  <Button 
                    onClick={() => router.visit(`/${locale}/register`)}
                    className="w-full"
                  >
                    {t('Start Free Trial')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}

function Hero({ locale, onDemoClick }: { locale: string; onDemoClick: () => void }) {
  const { t } = useTranslation();
  const heroRaw = t('landing.hero', { returnObjects: true }) as Partial<typeof heroFallback>;
  const hero = {
    eyebrow: typeof heroRaw?.eyebrow === 'string' ? heroRaw.eyebrow : heroFallback.eyebrow,
    title: typeof heroRaw?.title === 'string' ? heroRaw.title : heroFallback.title,
    highlight: typeof heroRaw?.highlight === 'string' ? heroRaw.highlight : heroFallback.highlight,
    subtitle: typeof heroRaw?.subtitle === 'string' ? heroRaw.subtitle : heroFallback.subtitle,
    cta_primary: typeof heroRaw?.cta_primary === 'string' ? heroRaw.cta_primary : heroFallback.cta_primary,
    cta_secondary:
      typeof heroRaw?.cta_secondary === 'string' ? heroRaw.cta_secondary : heroFallback.cta_secondary,
    triggers:
      Array.isArray(heroRaw?.triggers) && heroRaw.triggers.length > 0 ? heroRaw.triggers : heroFallback.triggers,
  };
  const triggers = hero.triggers;

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_#1f3b8a,_transparent_60%)] pointer-events-none" />
      <div className="pt-24 sm:pt-32 lg:pt-36 pb-16 sm:pb-20 lg:pb-24 px-4 sm:px-6 max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge variant="outline" className="mb-4 sm:mb-6 text-xs tracking-[0.15em] sm:tracking-[0.2em] uppercase">
              {hero.eyebrow}
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6 text-foreground">
              {hero.title}{' '}
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                {hero.highlight}
              </span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed mb-6 sm:mb-8 lg:mb-10 max-w-2xl">
              {hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-8 sm:mb-10">
              <Button
                onClick={() => router.visit(`/${locale}/register`)}
                size="lg"
                className="w-full sm:w-auto text-base px-6 sm:px-8 py-5 sm:py-6"
              >
                {hero.cta_primary}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button onClick={onDemoClick} size="lg" variant="outline" className="w-full sm:w-auto text-base px-6 sm:px-8 py-5 sm:py-6">
                <Sparkles className="mr-2 h-5 w-5" />
                {hero.cta_secondary}
              </Button>
            </div>

          </motion.div>

          <HeroAnimation />
        </div>

        <div className="mt-8 sm:mt-10 lg:mt-12 grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {triggers.map((trigger, idx) => (
            <motion.div
              key={trigger}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 + 0.5 }}
              className="flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-border/60 bg-background/80 px-4 sm:px-5 py-3 sm:py-4 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur"
            >
              <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-500" />
              <span className="text-xs sm:text-sm text-foreground">{trigger}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HeroAnimation() {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const demoRaw = t('landing.heroAnimation', { returnObjects: true }) as Partial<typeof demoFallback>;
  const demo = {
    invoiceLabel: typeof demoRaw?.invoiceLabel === 'string' ? demoRaw.invoiceLabel : demoFallback.invoiceLabel,
    invoiceValue: typeof demoRaw?.invoiceValue === 'string' ? demoRaw.invoiceValue : demoFallback.invoiceValue,
    totalLabel: typeof demoRaw?.totalLabel === 'string' ? demoRaw.totalLabel : demoFallback.totalLabel,
    totalValue: typeof demoRaw?.totalValue === 'string' ? demoRaw.totalValue : demoFallback.totalValue,
    success: typeof demoRaw?.success === 'string' ? demoRaw.success : demoFallback.success,
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 3);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
      className="relative"
    >
      <Card className="overflow-hidden shadow-2xl border-border/50">
        <CardContent className="p-8">
          <div className="flex justify-center gap-2 mb-6">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  width: step === i ? 32 : 8,
                  backgroundColor: step === i ? "hsl(var(--primary))" : "hsl(var(--muted))",
                }}
                transition={{ duration: 0.3 }}
                className="h-2 rounded-full"
              />
            ))}
          </div>

          {step === 0 && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl border border-border/50">
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center"
                >
                  <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </motion.div>
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 rounded-xl p-8 text-white shadow-lg"
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <CardDescription>{demo.invoiceLabel}</CardDescription>
                      <CardTitle className="text-2xl">{demo.invoiceValue}</CardTitle>
                    </CardHeader>
                  </Card>
                </motion.div>
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <CardDescription>{demo.totalLabel}</CardDescription>
                      <CardTitle className="text-2xl text-green-600">{demo.totalValue}</CardTitle>
                    </CardHeader>
                  </Card>
                </motion.div>
              </div>
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2 text-sm text-green-600 font-medium"
              >
                <CheckCircle className="h-4 w-4" />
                {demo.success}
              </motion.div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ValueProps() {
  const { t } = useTranslation();
  const valueRaw = t('landing.valueProps', { returnObjects: true }) as Partial<typeof valuePropsFallback>;
  const list =
    Array.isArray(valueRaw?.items) && valueRaw.items.length > 0 ? valueRaw.items : valuePropsFallback.items;

  const icons = [Zap, Target, TrendingUp, Sparkles];

  return (
    <section id="product" className="py-12 sm:py-16 lg:py-24 bg-muted/30 relative overflow-hidden">
      <motion.div
        className="absolute inset-0 opacity-5"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{ duration: 30, repeat: Infinity, repeatType: 'reverse' }}
        style={{
          backgroundImage: 'linear-gradient(45deg, hsl(var(--primary)) 25%, transparent 25%, transparent 75%, hsl(var(--primary)) 75%)',
          backgroundSize: '60px 60px',
        }}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {list.map((item, i) => {
            const Icon = icons[i] || Zap;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -10, scale: 1.03 }}
              >
                <Card className="h-full border-border/60 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.15 }}
                      transition={{ duration: 0.5 }}
                      className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-3 shadow-lg shadow-blue-500/30"
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </motion.div>
                    <CardTitle className="text-base sm:text-lg">{item.title}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm leading-relaxed">{item.desc}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ControlSection() {
  const { t } = useTranslation();
  const controlRaw = t('landing.control', { returnObjects: true }) as Partial<typeof controlFallback>;
  const control = {
    title: typeof controlRaw?.title === 'string' ? controlRaw.title : controlFallback.title,
    subtitle: typeof controlRaw?.subtitle === 'string' ? controlRaw.subtitle : controlFallback.subtitle,
    items:
      Array.isArray(controlRaw?.items) && controlRaw.items.length > 0
        ? controlRaw.items
        : controlFallback.items,
  };

  return (
    <section id="control" className="py-12 sm:py-16 lg:py-24 bg-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12 lg:mb-16 max-w-3xl mx-auto"
        >
          <Badge variant="outline" className="mb-3 sm:mb-4">
            {t('landing.nav.control')}
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">{control.title}</h2>
          <p className="text-base sm:text-lg text-muted-foreground">{control.subtitle}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {control.items.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -40 : 40, scale: 0.95 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.6, ease: "easeOut" }}
              whileHover={{ scale: 1.03, y: -8 }}
            >
              <Card className="h-full border-border/60 shadow-lg hover:shadow-2xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    </motion.div>
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base leading-relaxed mt-2">{item.desc}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const { t } = useTranslation();
  const featuresRaw = t('landing.features', { returnObjects: true }) as Partial<typeof featuresFallback>;
  const features = {
    title: typeof featuresRaw?.title === 'string' ? featuresRaw.title : featuresFallback.title,
    subtitle: typeof featuresRaw?.subtitle === 'string' ? featuresRaw.subtitle : featuresFallback.subtitle,
    sections:
      Array.isArray(featuresRaw?.sections) && featuresRaw.sections.length > 0
        ? featuresRaw.sections
        : featuresFallback.sections,
  };

  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-10 lg:space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <Badge variant="outline" className="mb-3 sm:mb-4">
            {features.title}
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">{features.title}</h2>
          <p className="text-base sm:text-lg text-muted-foreground">{features.subtitle}</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.sections.map((section, idx) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05, duration: 0.6 }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <Card className="h-full bg-background border border-border/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(Array.isArray(section.items) ? section.items : []).map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const { t } = useTranslation();
  const flowRaw = t('landing.howItWorks', { returnObjects: true }) as Partial<typeof howItWorksFallback>;
  const flow = {
    title: typeof flowRaw?.title === 'string' ? flowRaw.title : howItWorksFallback.title,
    subtitle: typeof flowRaw?.subtitle === 'string' ? flowRaw.subtitle : howItWorksFallback.subtitle,
    steps:
      Array.isArray(flowRaw?.steps) && flowRaw.steps.length > 0 ? flowRaw.steps : howItWorksFallback.steps,
  };

  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % flow.steps.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [flow.steps.length]);

  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-background via-muted/30 to-background relative overflow-hidden">
      {/* Animated background particles */}
      <motion.div
        className="absolute inset-0 opacity-10"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
        style={{
          backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 space-y-16 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <Badge variant="outline" className="mb-4 text-sm">
            {t('landing.nav.product')}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">{flow.title}</h2>
          <p className="text-lg text-muted-foreground">{flow.subtitle}</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side: Animated visualization */}
          <div className="relative h-[500px] flex items-center justify-center">
            <AnimatedDocumentFlow activeStep={activeStep} />
          </div>

          {/* Right side: Steps */}
          <div className="space-y-6">
            {flow.steps.map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.6 }}
                onClick={() => setActiveStep(idx)}
                className={`cursor-pointer transition-all duration-500 ${
                  activeStep === idx ? 'scale-105' : 'scale-100 opacity-70 hover:opacity-100'
                }`}
              >
                <Card className={`border-2 transition-all duration-500 ${
                  activeStep === idx
                    ? 'border-blue-600 shadow-xl shadow-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20'
                    : 'border-border/50 hover:border-blue-400'
                }`}>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <motion.div
                        animate={{
                          scale: activeStep === idx ? [1, 1.2, 1] : 1,
                          rotate: activeStep === idx ? [0, 360] : 0,
                        }}
                        transition={{ duration: 0.6 }}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-lg ${
                          activeStep === idx
                            ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-blue-500/40'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {idx + 1}
                      </motion.div>
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{step.title}</CardTitle>
                        <CardDescription className="text-base leading-relaxed">
                          {step.desc}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Progress indicators */}
        <div className="flex justify-center gap-3">
          {flow.steps.map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`h-2 rounded-full transition-all duration-500 ${
                activeStep === idx ? 'w-12 bg-blue-600' : 'w-2 bg-muted hover:bg-blue-400'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function AnimatedDocumentFlow({ activeStep }: { activeStep: number }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Step 0: Document Upload */}
      <motion.div
        animate={{
          opacity: activeStep === 0 ? 1 : 0,
          scale: activeStep === 0 ? 1 : 0.8,
          y: activeStep === 0 ? 0 : 20,
        }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          <Card className="w-64 h-80 bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-2xl border-2 border-border/50">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-6 w-6 text-blue-600" />
                <span className="font-semibold text-sm">invoice_2024.pdf</span>
              </div>
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="h-2 bg-muted rounded"
                  style={{ width: `${Math.random() * 40 + 60}%` }}
                />
              ))}
            </CardContent>
          </Card>
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-4 -right-4 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg"
          >
            <Upload className="h-6 w-6 text-white" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Step 1: AI Processing */}
      <motion.div
        animate={{
          opacity: activeStep === 1 ? 1 : 0,
          scale: activeStep === 1 ? 1 : 0.8,
          rotate: activeStep === 1 ? 0 : -10,
        }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="relative">
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 flex items-center justify-center shadow-2xl"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-40 h-40 rounded-full bg-background flex items-center justify-center"
            >
              <Sparkles className="h-16 w-16 text-blue-600" />
            </motion.div>
          </motion.div>
          {/* Orbiting particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.3,
              }}
              className="absolute inset-0"
              style={{
                transformOrigin: 'center',
              }}
            >
              <div
                className="absolute w-3 h-3 bg-blue-500 rounded-full shadow-lg"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) translateY(-${100 + i * 10}px)`,
                }}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Step 2: Review & Validate */}
      <motion.div
        animate={{
          opacity: activeStep === 2 ? 1 : 0,
          scale: activeStep === 2 ? 1 : 0.8,
        }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="space-y-4 w-80">
          {[
            { label: 'Invoice #', value: 'INV-2024-001', icon: FileText },
            { label: 'Total Amount', value: '€12,450', icon: DollarSign },
            { label: 'Date', value: '2024-12-22', icon: Calendar },
          ].map((field, i) => (
            <motion.div
              key={field.label}
              initial={{ x: -50, opacity: 0 }}
              animate={{
                x: activeStep === 2 ? 0 : -50,
                opacity: activeStep === 2 ? 1 : 0,
              }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
            >
              <Card className="border-2 border-border/50 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <field.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{field.label}</p>
                        <p className="font-semibold">{field.value}</p>
                      </div>
                    </div>
                    <motion.div
                      animate={{
                        scale: [0, 1.2, 1],
                        rotate: [0, 360, 360],
                      }}
                      transition={{ delay: i * 0.15 + 0.3, duration: 0.5 }}
                    >
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Step 3: Export & Integrate */}
      <motion.div
        animate={{
          opacity: activeStep === 3 ? 1 : 0,
          scale: activeStep === 3 ? 1 : 0.8,
        }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="relative">
          <Card className="w-80 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-2 border-green-500/50 shadow-2xl">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Database className="h-6 w-6 text-green-600" />
                  <span className="font-bold">Structured Data</span>
                </div>
                <Badge className="bg-green-600">Ready</Badge>
              </div>
              
              <motion.div
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="space-y-2 font-mono text-xs"
              >
                <div className="text-blue-600">{'{'}</div>
                <div className="pl-4">"invoice": "INV-2024-001",</div>
                <div className="pl-4">"amount": 12450,</div>
                <div className="pl-4">"date": "2024-12-22",</div>
                <div className="pl-4">"status": "validated"</div>
                <div className="text-blue-600">{'}'}</div>
              </motion.div>

              <div className="flex gap-2 pt-4">
                {[
                  { icon: Download, label: 'CSV' },
                  { icon: FileJson, label: 'JSON' },
                  { icon: Code, label: 'API' },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{
                      y: activeStep === 3 ? 0 : 20,
                      opacity: activeStep === 3 ? 1 : 0,
                    }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    whileHover={{ scale: 1.1, y: -4 }}
                    className="flex-1 p-2 bg-background rounded-lg border border-border/50 flex flex-col items-center gap-1 cursor-pointer hover:border-blue-500 transition-colors"
                  >
                    <item.icon className="h-5 w-5 text-blue-600" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Success particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -100],
                opacity: [1, 0],
                scale: [0, 1.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeOut",
              }}
              className="absolute w-2 h-2 bg-green-500 rounded-full"
              style={{
                left: `${50 + Math.cos((i * Math.PI * 2) / 8) * 40}%`,
                top: `${50 + Math.sin((i * Math.PI * 2) / 8) * 40}%`,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function SecuritySection() {
  const { t } = useTranslation();
  const securityRaw = t('landing.security', { returnObjects: true }) as Partial<typeof securityFallback>;
  const security = {
    title: typeof securityRaw?.title === 'string' ? securityRaw.title : securityFallback.title,
    subtitle: typeof securityRaw?.subtitle === 'string' ? securityRaw.subtitle : securityFallback.subtitle,
    cards:
      Array.isArray(securityRaw?.cards) && securityRaw.cards.length > 0
        ? securityRaw.cards
        : securityFallback.cards,
  };

  return (
    <section id="security" className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <Badge variant="outline" className="mb-4">
            {t('landing.nav.security')}
          </Badge>
          <h2 className="text-4xl font-bold mb-4">{security.title}</h2>
          <p className="text-lg text-muted-foreground">{security.subtitle}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {security.cards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <Card className="h-full border border-border/70">
                <CardHeader>
                  <CardTitle className="text-2xl">{card.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed mt-4">
                    {card.desc}
                  </CardDescription>
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
  const integrationRaw = t('landing.integration', { returnObjects: true }) as Partial<typeof integrationFallback>;
  const integration = {
    title: typeof integrationRaw?.title === 'string' ? integrationRaw.title : integrationFallback.title,
    subtitle:
      typeof integrationRaw?.subtitle === 'string' ? integrationRaw.subtitle : integrationFallback.subtitle,
    cards:
      Array.isArray(integrationRaw?.cards) && integrationRaw.cards.length > 0
        ? integrationRaw.cards
        : integrationFallback.cards,
    example_label:
      typeof integrationRaw?.example_label === 'string'
        ? integrationRaw.example_label
        : integrationFallback.example_label,
    example_note:
      typeof integrationRaw?.example_note === 'string'
        ? integrationRaw.example_note
        : integrationFallback.example_note,
    example_code:
      Array.isArray(integrationRaw?.example_code) && integrationRaw.example_code.length > 0
        ? integrationRaw.example_code
        : integrationFallback.example_code,
  };
  const cards = integration.cards;
  const exampleCode = integration.example_code;

  return (
    <section id="integration" className="py-24 bg-muted/30">
      <div className="max-w-6xl mx-auto px-6 space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <Badge variant="outline" className="mb-4">
            {t('landing.nav.product')}
          </Badge>
          <h2 className="text-4xl font-bold mb-4">{integration.title}</h2>
          <p className="text-lg text-muted-foreground">{integration.subtitle}</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <Card className="h-full">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">{integration.title}</CardTitle>
              <CardDescription>{integration.subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {cards.map((card, idx) => (
                <div key={card.title} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Code className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium">{card.title}</p>
                    <p className="text-sm text-muted-foreground">{card.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-background border border-border/60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{integration.example_label}</CardTitle>
                  <CardDescription>{integration.example_note}</CardDescription>
                </div>
                <Badge variant="secondary">API</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <pre className="text-xs font-mono overflow-x-auto leading-relaxed">
                {exampleCode.join('\n')}
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
      quote: t('Docset saved our finance team 45 hours per month. The ROI was immediate and the accuracy is incredible.'),
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: t('Operations Manager'),
      avatar: "👨‍💼",
      quote: t('We process 500+ invoices monthly. Docset reduced our processing time by 90%.'),
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
  const { props } = usePage<{ auth?: { user?: any } }>();
  const isAuthenticated = !!props.auth?.user;
  const [stripePrices, setStripePrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const pricingRaw = t('landing.pricing', { returnObjects: true }) as Partial<typeof pricingFallback>;
  const pricing = {
    title: typeof pricingRaw?.title === 'string' ? pricingRaw.title : pricingFallback.title,
    subtitle: typeof pricingRaw?.subtitle === 'string' ? pricingRaw.subtitle : pricingFallback.subtitle,
    plans: Array.isArray(pricingRaw?.plans) && pricingRaw.plans.length > 0 ? pricingRaw.plans : pricingFallback.plans,
    disclaimer: typeof pricingRaw?.disclaimer === 'string' ? pricingRaw.disclaimer : pricingFallback.disclaimer,
  };

  useEffect(() => {
    const fetchStripePrices = async () => {
      try {
        const response = await fetch('/api/stripe/prices');
        const data = await response.json();
        if (data.success && data.prices && data.prices.length > 0) {
          setStripePrices(data.prices);
        }
      } catch (error) {
        console.error('Error fetching Stripe prices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStripePrices();
  }, []);

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat(locale === 'pt' ? 'pt-PT' : 'en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const normalizePlanName = (name?: string | null) =>
    (name ?? '')
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

  const getRecurringText = (recurring: any) => {
    if (!recurring) return '';
    const interval = recurring.interval;
    const count = recurring.interval_count;
    if (count === 1) {
      return `/${t(interval === 'month' ? 'month' : interval)}`;
    }
    return `/${count} ${t(interval)}s`;
  };

  // Merge Stripe prices with fallback plans
  const mergedPlans = pricing.plans.map(plan => {
    const stripePrice = stripePrices.find(
      (p) => normalizePlanName(p.plan_name) === normalizePlanName(plan.name)
    );
    if (stripePrice) {
      return {
        ...plan,
        price: formatPrice(stripePrice.unit_amount, stripePrice.currency),
        frequency: getRecurringText(stripePrice.recurring),
        price_id: stripePrice.id,
        stripe_data: stripePrice,
      };
    }
    return plan;
  });

  return (
    <section id="pricing" className="py-12 sm:py-16 lg:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12 lg:mb-16 max-w-3xl mx-auto"
        >
          <Badge variant="outline" className="mb-3 sm:mb-4">
            {t('landing.nav.pricing')}
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">{pricing.title}</h2>
          <p className="text-base sm:text-lg text-muted-foreground">{pricing.subtitle}</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {mergedPlans.map((plan, i) => {
            const hasPriceId = plan.price_id && plan.name !== 'FREE' && plan.name !== 'ENTERPRISE';
            
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: plan.highlight ? -12 : -8, scale: plan.highlight ? 1.02 : 1 }}
                className={plan.highlight ? 'md:col-span-1 lg:col-span-1' : ''}
              >
                <Card className={`relative h-full border-border/70 ${
                  plan.highlight ? 'border-blue-600 border-2 shadow-xl shadow-blue-500/20' : ''
                }`}>
                  {plan.highlight && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-500">
                      ⭐ PRO
                    </Badge>
                  )}

                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">{plan.name}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">{plan.tagline}</CardDescription>
                    <div className="mt-4">
                      {plan.price === 'Custom' || plan.price === 'Personalizado' ? (
                        <span className="text-2xl sm:text-3xl font-bold">{plan.price}</span>
                      ) : (
                        <>
                          <span className="text-3xl sm:text-4xl font-bold">{plan.price}</span>
                          <span className="text-xs sm:text-sm text-muted-foreground">{plan.frequency}</span>
                        </>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <ul className="space-y-1.5 sm:space-y-2">
                      {plan.features.map((feature, j) => (
                        <li key={j} className="flex items-start gap-2 text-xs sm:text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {hasPriceId ? (
                      <Button
                        onClick={() => {
                          if (!isAuthenticated) {
                            router.visit(`/${locale}/register`);
                            return;
                          }
                          
                          router.visit(`/${locale}/subscription/checkout`, {
                            data: {
                              price_id: plan.price_id,
                              plan_name: plan.name
                            }
                          });
                        }}
                        className="w-full"
                        size="sm"
                        variant={plan.highlight ? 'default' : 'outline'}
                      >
                        {plan.cta}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => router.visit(`/${locale}/register`)}
                        className="w-full"
                        size="sm"
                        variant={plan.highlight ? 'default' : 'outline'}
                      >
                        {plan.cta}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center mt-12 text-sm text-muted-foreground">
          {pricing.disclaimer}
        </p>
      </div>
    </section>
  );
}

function FAQ() {
  const { t } = useTranslation();
  const faqRaw = t('landing.faq', { returnObjects: true }) as Partial<typeof faqFallback>;
  const faq = {
    title: typeof faqRaw?.title === 'string' ? faqRaw.title : faqFallback.title,
    items: Array.isArray(faqRaw?.items) && faqRaw.items.length > 0 ? faqRaw.items : faqFallback.items,
  };

  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">{faq.title}</h2>
        </motion.div>

        <div className="space-y-4">
          {faq.items.map((item, i) => (
            <motion.details
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <summary className="flex items-center justify-between p-6 rounded-xl bg-muted/50 cursor-pointer hover:bg-muted/80 transition-all border border-border/50">
                <span className="font-semibold">{item.q}</span>
                <motion.span
                  className="text-2xl"
                  animate={{ rotate: 0 }}
                  whileHover={{ scale: 1.1 }}
                >
                  ↓
                </motion.span>
              </summary>
              <Card className="mt-2 border-t-0 rounded-t-none border-border/50">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground leading-relaxed">{item.a}</p>
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
  const ctaRaw = t('landing.cta', { returnObjects: true }) as Partial<typeof ctaFallback>;
  const cta = {
    title: typeof ctaRaw?.title === 'string' ? ctaRaw.title : ctaFallback.title,
    subtitle: typeof ctaRaw?.subtitle === 'string' ? ctaRaw.subtitle : ctaFallback.subtitle,
    primary: typeof ctaRaw?.primary === 'string' ? ctaRaw.primary : ctaFallback.primary,
    secondary: typeof ctaRaw?.secondary === 'string' ? ctaRaw.secondary : ctaFallback.secondary,
  };

  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 dark:from-blue-900 dark:via-blue-800 dark:to-gray-900" />
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
        style={{
          backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-white"
        >
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
          >
            {cta.title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl mb-12 text-blue-100 max-w-2xl mx-auto"
          >
            {cta.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Button
              onClick={() => router.visit(`/${locale}/register`)}
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-6 shadow-2xl hover:scale-105 transition-transform"
            >
              {cta.primary}
              <ArrowRight className="ml-2" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-2 border-white text-white hover:bg-white/20 hover:scale-105 transition-all"
            >
              {cta.secondary}
            </Button>
          </motion.div>
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
              <span className="font-bold text-lg">Docset</span>
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
          <p>© {new Date().getFullYear()} Docset. {t('All rights reserved.')}</p>
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
          toast.error(t('You have already used the demo. Please register to continue using Docset.'));
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
          <DialogTitle>{t('Try Docset Demo')}</DialogTitle>
          <DialogDescription>
            {t('Upload a document to see how Docset extracts data automatically')}
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
