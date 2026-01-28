import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { router, usePage } from "@inertiajs/react";
import { Head } from "@inertiajs/react";
import { EmailVerificationBanner } from "@/components/email-verification-banner";
import { type BreadcrumbItem, type SharedData } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import AppLayout from "@/layouts/app-layout";
import SettingsLayout from "@/layouts/settings/layout";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  FileText,
  Database,
  Key,
  Globe,
  Calendar,
  DollarSign,
  TrendingUp,
  Download,
  ExternalLink,
  ArrowRight,
  Zap,
  Shield,
  BarChart3,
  MousePointerClick,
} from "lucide-react";
import { toast } from "sonner";

interface Plan {
  name: string;
  price: string;
  interval?: string;
  tagline: string;
  features: string[];
  limits: Record<string, any>;
  color: string;
  recommended: boolean;
  stripe_price_id?: string;
  currency?: string;
}

interface Usage {
  pages: number;
  documents: number;
  models: number;
  api_requests: number;
  reports: number;
}

interface UsagePercentages {
  pages: number;
  documents: number;
  models: number;
  api_requests: number;
  reports: number;
}

interface PageUsageDocument {
  id: number;
  name: string;
  pages: number;
  created_at: string;
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  date: string;
  status: string;
  url: string;
}

export default function BillingIndex() {
  const { t, i18n } = useTranslation();
  const page = usePage<SharedData>();
  const props = page.props as unknown as SharedData & { locale: string };
  const serverLocale = props.locale;
  const { auth } = page.props;
  const [locale, setLocale] = useState(serverLocale || 'pt');

  useEffect(() => {
    if (serverLocale) {
      setLocale(serverLocale);
      i18n.changeLanguage(serverLocale);
    } else {
      const savedLocale = localStorage.getItem('selected-locale') || 'pt';
      setLocale(savedLocale);
      i18n.changeLanguage(savedLocale);
    }
  }, [serverLocale, i18n]);

  const BREADCRUMBS: BreadcrumbItem[] = [
    { title: t('Dashboard'), href: `/${locale}/dashboard` },
    { title: t('Settings'), href: `/${locale}/settings/billing` },
    { title: t('Billing', 'Billing'), href: `/${locale}/settings/billing` },
  ];

  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [planData, setPlanData] = useState<Plan | null>(null);
  const [usage, setUsage] = useState<Usage>({ pages: 0, documents: 0, models: 0, api_requests: 0, reports: 0 });
  const [usagePercentages, setUsagePercentages] = useState<UsagePercentages>({
    pages: 0,
    documents: 0,
    models: 0,
    api_requests: 0,
    reports: 0,
  });
  const [nextBillingDate, setNextBillingDate] = useState<string | null>(null);
  const [isTrial, setIsTrial] = useState(false);
  const [isCanceled, setIsCanceled] = useState(false);
  const [upcomingInvoice, setUpcomingInvoice] = useState<any>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPagesModal, setShowPagesModal] = useState(false);
  const [pagesDetail, setPagesDetail] = useState<PageUsageDocument[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]); // Store raw plans
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Default limits for free plan
  const defaultLimits = {
    documents: 20,
    models: 2,
    api_requests: 100,
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [usageResponse, planResponse, plansResponse, invoiceResponse] = await Promise.allSettled([
        fetch(`/${locale}/api/usage`, {
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          },
        }),
        fetch(`/${locale}/api/plans/current?locale=${locale}`, {
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          },
        }),
        fetch(`/api/plans?locale=${locale}`, {
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          },
        }),
        fetch(`/${locale}/api/plans/upcoming-invoice`, {
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          },
        }),
      ]);

      // Process usage data
      if (usageResponse.status === 'fulfilled') {
        const usageData = await usageResponse.value.json();
        if (usageData.success) {
          setUsage({
            pages: usageData.usage.documents?.used || 0, // Use documents data for pages display
            documents: usageData.usage.documents?.used || 0,
            models: usageData.usage.models?.used || 0,
            api_requests: usageData.usage.api_requests?.used || 0,
            reports: usageData.usage.reports?.used || 0,
          });
          
          setUsagePercentages({
            pages: usageData.usage.documents?.percentage || 0, // Use documents percentage for pages
            documents: usageData.usage.documents?.percentage || 0,
            models: usageData.usage.models?.percentage || 0,
            api_requests: usageData.usage.api_requests?.percentage || 0,
            reports: usageData.usage.reports?.percentage || 0,
          });

          if (usageData.period?.end) {
            setNextBillingDate(usageData.period.end); // Assuming ISO string now
          }

          setCurrentPlan(usageData.plan?.name?.toLowerCase() || 'free');
          
        }
      }

      // Process plan data
      if (planResponse.status === 'fulfilled') {
        const planDataResponse = await planResponse.value.json();
        setPlanData(planDataResponse.plan_data || null);
        
        // Use backend provided status and dates
        if (planDataResponse.is_canceled !== undefined) {
            setIsCanceled(planDataResponse.is_canceled);
        }
        
        // Prefer the date from the subscription object (ends_at) if available
        if (planDataResponse.next_billing_date) {
            setNextBillingDate(planDataResponse.next_billing_date);
        }
      }

      // Process available plans
      if (plansResponse.status === 'fulfilled' && plansResponse.value.ok) {
        const plansData = await plansResponse.value.json();
        const plansArray = Object.values(plansData) as Plan[];
        setPlans(plansArray);
        // The filtering happens in the useEffect now
      }

      // Process invoice data
      if (invoiceResponse.status === 'fulfilled') {
        const invoiceData = await invoiceResponse.value.json();
        // Only set if we have actual data (not null)
        if (invoiceData && typeof invoiceData.amount === 'number') {
          setUpcomingInvoice(invoiceData);
        }
      }

      // Fetch invoices separately (less critical)
      try {
        const invoicesResponse = await fetch(`/${locale}/api/plans/invoices`, {
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          },
        });
        if (invoicesResponse.ok) {
          const invoicesData = await invoicesResponse.json();
          // Filter only valid invoices with numeric amount
          const validInvoices = (invoicesData || []).filter((invoice: any) => 
            invoice && typeof invoice.amount === 'number'
          );
          setInvoices(validInvoices);
        }
      } catch (e) {
        console.error('Error fetching invoices:', e);
      }
    } catch (error) {
      console.error('Error fetching billing data:', error);
      setError('Failed to load billing information');
      toast.error('Failed to load billing information');
    } finally {
      setLoading(false);
    }
  };

  // Filter plans whenever currentPlan or plans list changes
  useEffect(() => {
    if (plans.length > 0) {
      setAvailablePlans(plans.filter((p: Plan) => {
        const isCurrentPlan = p.name && p.name.toLowerCase() === (currentPlan || '').toLowerCase();
        // Hide Free plan if user is on a paid plan (assuming 'free' is the identifier for the free plan)
        const isFreePlan = p.name && p.name.toLowerCase() === 'free';
        const userIsOnPaidPlan = currentPlan && currentPlan.toLowerCase() !== 'free';
        
        if (userIsOnPaidPlan && isFreePlan) return false;
        
        return !isCurrentPlan;
      }));
    }
  }, [currentPlan, plans]);

  const formatPrice = (amount: string | number | null | undefined, currency: string = 'EUR') => {
    // Treat null/undefined as 0
    if (amount === null || amount === undefined || amount === 'N/A') amount = 0;
    
    // Ensure we have a number
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString(locale, { dateStyle: 'long' });
  };


  const handleUpgrade = (priceId: string) => {
    if (!priceId) {
      toast.error('Invalid plan selected');
      return;
    }
    router.visit(`/${locale}/subscription/checkout?price_id=${priceId}`);
  };

  const handleCancelSubscription = async () => {
    try {
      const response = await fetch(`/${locale}/api/plans/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      if (response.ok) {
        setShowCancelDialog(false);
        window.location.reload();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      setError('Failed to cancel subscription');
    }
  };

  const handleShowPagesDetail = async () => {
    try {
      const response = await fetch(`/api/usage/pages-detail`, {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name=\"csrf-token\"]')?.getAttribute('content') || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPagesDetail(data.documents || []);
          setShowPagesModal(true);
        }
      }
    } catch (error) {
      toast.error('Failed to load page details');
    }
  };

  const getStatusBadge = () => {
    if (isCanceled) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Canceled
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="flex items-center gap-1 bg-green-600 hover:bg-green-700">
        <CheckCircle className="h-3 w-3" />
        Active
      </Badge>
    );
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 95) return 'text-red-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  const translateFeature = (feature: string): string => {
    const translations: { [key: string]: string } = {
      'Perfect for trying out DOCSET': t('billing.perfect_for_trying', 'Perfect for trying out DOCSET'),
      'For individuals and small businesses': t('billing.for_individuals', 'For individuals and small businesses'),
      'For teams that need full power': t('billing.for_teams', 'For teams that need full power'),
      'For enterprises and serious integrations': t('billing.for_enterprises', 'For enterprises and serious integrations'),
      '/month': t('billing.per_month', '/month'),
      'documents per month': t('billing.documents_per_month', 'documents per month'),
      'models': t('billing.models_plural', 'models'),
      'reports': t('billing.reports', 'reports'),
      'API access': t('billing.api_access', 'API access'),
      'API requests per month': t('billing.api_requests_per_month', 'API requests per month'),
      'API clients': t('billing.api_clients', 'API clients'),
      'CSV & JSON exports': t('billing.csv_json_exports', 'CSV & JSON exports'),
      'DOCSET branding on exports': t('billing.branding_exports', 'DOCSET branding on exports'),
      'Full UI': t('billing.full_ui', 'Full UI'),
      'Review before saving': t('billing.review_before_saving', 'Review before saving'),
      'Unlimited reports': t('billing.unlimited_reports', 'Unlimited reports'),
      'Unlimited models': t('billing.unlimited_models', 'Unlimited models'),
      '5,000+ documents per month': t('billing.documents_per_month_plus', '5,000+ documents per month'),
      '100,000+ API requests per month': t('billing.api_requests_per_month_plus', '100,000+ API requests per month'),
    };
    
    return translations[feature] || feature;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 95) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return null;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <AppLayout breadcrumbs={BREADCRUMBS}>
      <Head title={t('Billing', 'Billing & Subscription')} />
      
      <SettingsLayout>
        <div className="space-y-6">
          {page.props.auth.user && !page.props.auth.user.email_verified_at && (
             <EmailVerificationBanner 
                email={page.props.auth.user.email} 
                locale={page.props.locale} 
             />
          )}
        {/* Header */}
        <div>
          <h3 className="text-lg font-medium">{t('billing.title', 'Billing & Subscription')}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {t('billing.subtitle', 'Manage your plan, view usage, and control your subscription.')}
          </p>
        </div>

        {/* Flash Messages */}
        {page.props.flash?.success && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-900/10 text-green-800 dark:text-green-300">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{page.props.flash.success}</AlertDescription>
          </Alert>
        )}
        {page.props.flash?.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{page.props.flash.error}</AlertDescription>
          </Alert>
        )}

        {/* Current Plan Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3">
                  <span>{t('billing.current_plan', 'Current Plan')}</span>
                  {getStatusBadge()}
                </CardTitle>
                <CardDescription>
                  {t('billing.current_plan_description', 'You are currently on the')} {planData?.name || t('billing.free_plan', 'FREE')} {t('billing.current_plan', 'plan')} ({formatPrice(planData?.price, planData?.currency)}
                  {planData?.interval ? `/${planData.interval}` : ''})
                  {nextBillingDate && currentPlan !== 'free' && (
                    <span className="ml-2 block sm:inline mt-1 sm:mt-0">
                      {isCanceled ? (
                         <span className="text-amber-600 dark:text-amber-400 font-medium">
                           • {t('billing.scheduled_cancel', 'Scheduled to cancel on')}: {formatDate(nextBillingDate)}
                         </span>
                      ) : (
                        <span>
                          • {t('billing.next_billing', 'Next billing date')}: {formatDate(upcomingInvoice?.date || nextBillingDate)}
                        </span>
                      )}
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => setShowUpgradeDialog(true)}
                  className="gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  {currentPlan === 'free' ? t('billing.upgrade_plan', 'Upgrade Plan') : t('billing.change_plan', 'Change Plan')}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Usage Overview */}
        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          {/* Pages Card - Clickable */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={handleShowPagesDetail}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Pages
                      <MousePointerClick className="h-3 w-3 ml-auto text-muted-foreground" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>{usage?.pages || 0} of {planData?.limits?.documents === -1 ? '∞' : (planData?.limits?.documents || 100)}</span>
                        <span className={getUsageColor(usagePercentages?.pages || 0)}>
                          {(usagePercentages?.pages || 0).toFixed(0)}%
                        </span>
                      </div>
                      <Progress
                        value={usagePercentages?.pages || 0}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              {usagePercentages?.pages >= 80 && (
                <TooltipContent>
                  <p className="text-sm">
                    {usagePercentages?.pages >= 95
                      ? "You've reached your page limit. Upgrade to continue."
                      : "You're approaching your page limit. Consider upgrading soon."}
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          {/* Models Card */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      {t('billing.models', 'Models')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>{usage?.models || 0} of {planData?.limits?.models === -1 ? '∞' : (planData?.limits?.models || 5)}</span>
                        <span className={getUsageColor(usagePercentages?.models || 0)}>
                          {(usagePercentages?.models || 0).toFixed(0)}%
                        </span>
                      </div>
                      <Progress
                        value={usagePercentages?.models || 0}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              {usagePercentages?.models >= 80 && (
                <TooltipContent>
                  <p className="text-sm">
                    {usagePercentages?.models >= 95
                      ? "You've reached your models limit. Upgrade to continue creating new models."
                      : "You're approaching your models limit. Consider upgrading soon."}
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          {/* Reports Card */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Reports
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>{usage?.reports || 0} of {planData?.limits?.reports === -1 ? '∞' : (planData?.limits?.reports || 1)}</span>
                        <span className={getUsageColor(usagePercentages?.reports || 0)}>
                          {(usagePercentages?.reports || 0).toFixed(0)}%
                        </span>
                      </div>
                      <Progress
                        value={usagePercentages?.reports || 0}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              {usagePercentages?.reports >= 80 && (
                <TooltipContent>
                  <p className="text-sm">
                    {usagePercentages?.reports >= 95
                      ? "You've reached your reports limit. Upgrade to create more reports."
                      : "You're approaching your reports limit. Consider upgrading soon."}
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          {/* API Requests Card */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      {t('billing.api_requests', 'API Requests')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>{usage?.api_requests || 0} of {planData?.limits?.api_requests === -1 ? '∞' : (planData?.limits?.api_requests || 100)}</span>
                        <span className={getUsageColor(usagePercentages?.api_requests || 0)}>
                          {(usagePercentages?.api_requests || 0).toFixed(0)}%
                        </span>
                      </div>
                      <Progress
                        value={usagePercentages?.api_requests || 0}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              {usagePercentages?.api_requests >= 80 && (
                <TooltipContent>
                  <p className="text-sm">
                    {usagePercentages?.api_requests >= 95
                      ? "You've reached your API requests limit. Upgrade to continue using the API."
                      : "You're approaching your API requests limit. Consider upgrading soon."}
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Upcoming Invoice */}
        {upcomingInvoice && upcomingInvoice.amount !== undefined && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t('billing.upcoming_invoice', 'Upcoming Invoice')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold">
                    {upcomingInvoice?.amount != null ? 
                      formatPrice(upcomingInvoice.amount / 100, upcomingInvoice.currency) :
                      'N/A'
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('billing.due_on', 'Due on')} {formatDate(upcomingInvoice?.date) || 'N/A'}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  {t('billing.view_details', 'View Details')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invoice History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Invoice History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length > 0 ? (
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">
                        {invoice.amount != null ?
                          formatPrice(invoice.amount / 100, invoice.currency) :
                          'N/A'
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(invoice.date)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <a
                        href={invoice.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {t('billing.view', 'View')}
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                {t('billing.no_invoices', 'No invoices yet')}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Features Summary */}
        <Card>
          <CardHeader>
            <CardTitle>{t('billing.plan_features', 'Plan Features')}</CardTitle>
            <CardDescription>
              {t('billing.whats_included', "What's included in your")} {planData?.name} {t('billing.current_plan', 'plan')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.isArray(planData?.features) && planData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cancellation Section */}
        {currentPlan !== 'free' && !isCanceled && (
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <XCircle className="h-5 w-5" />
                {t('billing.cancel_subscription_title', 'Cancel Subscription')}
              </CardTitle>
              <CardDescription>
                {t('billing.cancel_subscription_description', "If you need to cancel your subscription, you can do it here. You'll continue to have access until the end of your billing period.")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="destructive" 
                onClick={() => setShowCancelDialog(true)}
                className="gap-2"
              >
                <XCircle className="h-4 w-4" />
                {t('billing.cancel_subscription', 'Cancel Subscription')}
              </Button>
            </CardContent>
          </Card>
        )}
        </div>

      {/* Page Usage Details Modal */}
      <Dialog open={showPagesModal} onOpenChange={setShowPagesModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Page Usage Details</DialogTitle>
            <DialogDescription>
              Detailed breakdown of pages used this billing period
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {pagesDetail.length > 0 ? (
              <>
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-3 text-left font-medium">Document</th>
                        <th className="p-3 text-right font-medium">Pages</th>
                        <th className="p-3 text-right font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagesDetail.map((doc, index) => (
                        <tr key={doc.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                          <td className="p-3 text-sm">{doc.name}</td>
                          <td className="p-3 text-right text-sm font-medium">{doc.pages}</td>
                          <td className="p-3 text-right text-sm text-muted-foreground">
                            {new Date(doc.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t bg-muted/50 font-semibold">
                        <td className="p-3">Total</td>
                        <td className="p-3 text-right">{pagesDetail.reduce((sum, doc) => sum + doc.pages, 0)}</td>
                        <td className="p-3"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                  <span>{pagesDetail.length} documents this period</span>
                  <span>Limit: {planData?.limits?.documents || 100} pages/month</span>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No documents found in this billing period</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{t('billing.change_plan', 'Change Your Plan')}</DialogTitle>
            <DialogDescription className="text-base">
              {t('billing.current_plan_description', 'You are currently on the')} <strong className="text-primary">{planData?.name || t('billing.free_plan', 'FREE')}</strong> {t('billing.plan_select', 'plan. Select a new plan that fits your needs')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
            {/* Show current plan first */}
            {planData && (
              <Card className="relative border-2 border-green-500 dark:border-green-600 bg-green-50/50 dark:bg-green-950/20">
                <Badge className="absolute -top-3 left-4 bg-green-600 hover:bg-green-600">
                  {t('billing.current_plan_badge', 'Current Plan')}
                </Badge>
                <CardHeader className="pt-6">
                  <CardTitle className="text-green-700 dark:text-green-400">{planData.name}</CardTitle>
                  <CardDescription>{translateFeature(planData.tagline)}</CardDescription>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-green-700 dark:text-green-400">{formatPrice(planData.price, planData.currency)}</span>
                    {planData.interval && (
                      <span className="text-muted-foreground">{translateFeature('/' + planData.interval)}</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {Array.isArray(planData.features) && planData.features.slice(0, 5).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{translateFeature(feature)}</span>
                      </li>
                    ))}
                  </ul>
                  <Button disabled className="w-full" variant="outline">
                    {t('billing.current', 'Current')}
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {/* Show other available plans */}
            {availablePlans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative transition-all hover:shadow-lg ${
                  plan.recommended ? 'border-2 border-primary shadow-md' : 'border'
                }`}
              >
                {plan.recommended && (
                  <Badge className="absolute -top-3 left-4 bg-primary">
                    {t('billing.recommended', 'Recommended')}
                  </Badge>
                )}
                <CardHeader className={plan.recommended ? 'pt-6' : ''}>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{translateFeature(plan.tagline)}</CardDescription>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{formatPrice(plan.price, plan.currency)}</span>
                    {plan.interval && (
                      <span className="text-muted-foreground">{translateFeature('/' + plan.interval)}</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {Array.isArray(plan.features) && plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{translateFeature(feature)}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.recommended ? "default" : "outline"}
                    onClick={() => plan.stripe_price_id && handleUpgrade(plan.stripe_price_id)}
                  >
                    {t('billing.subscribe_to', 'Subscribe to')} {plan.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('billing.cancel_subscription_title', 'Cancel Subscription')}</DialogTitle>
            <DialogDescription>
              {t('billing.cancel_confirmation', 'Are you sure you want to cancel your subscription? You will lose access to all premium features at the end of your billing period.')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              {t('billing.keep_subscription', 'Keep Subscription')}
            </Button>
            <Button variant="destructive" onClick={handleCancelSubscription}>
              {t('billing.cancel_subscription', 'Cancel Subscription')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </SettingsLayout>
    </AppLayout>
  );
}
