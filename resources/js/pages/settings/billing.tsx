import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { router, usePage } from "@inertiajs/react";
import { Head } from "@inertiajs/react";
import { type BreadcrumbItem, type SharedData } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Settings,
  ArrowRight,
  Zap,
  Shield,
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
}

interface Usage {
  documents: number;
  models: number;
  api_requests: number;
  api_keys: number;
}

interface UsagePercentages {
  documents: number;
  models: number;
  api_requests: number;
  api_keys: number;
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
  const { auth } = page.props;
  const [locale, setLocale] = useState('pt');

  useEffect(() => {
    const savedLocale = localStorage.getItem('selected-locale') || 'pt';
    setLocale(savedLocale);
  }, []);

  const BREADCRUMBS: BreadcrumbItem[] = [
    { title: t('Dashboard'), href: `/${locale}/dashboard` },
    { title: t('Settings'), href: `/${locale}/settings/billing` },
    { title: t('Billing', 'Billing'), href: `/${locale}/settings/billing` },
  ];

  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [planData, setPlanData] = useState<Plan | null>(null);
  const [usage, setUsage] = useState<Usage>({ documents: 0, models: 0, api_requests: 0, api_keys: 0 });
  const [usagePercentages, setUsagePercentages] = useState<UsagePercentages>({
    documents: 0,
    models: 0,
    api_requests: 0,
    api_keys: 0,
  });
  const [nextBillingDate, setNextBillingDate] = useState<string | null>(null);
  const [isTrial, setIsTrial] = useState(false);
  const [isPastDue, setIsPastDue] = useState(false);
  const [isCanceled, setIsCanceled] = useState(false);
  const [upcomingInvoice, setUpcomingInvoice] = useState<any>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Default limits for free plan
  const defaultLimits = {
    documents: 20,
    models: 2,
    api_requests: 100,
    api_keys: 1,
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
        fetch(`/${locale}/api/plans/current`, {
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          },
        }),
        fetch(`/${locale}/api/plans`, {
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
            documents: usageData.usage.documents?.used || 0,
            models: usageData.usage.models?.used || 0,
            api_requests: usageData.usage.api_requests?.used || 0,
            api_keys: 0,
          });
          
          setUsagePercentages({
            documents: usageData.usage.documents?.percentage || 0,
            models: usageData.usage.models?.percentage || 0,
            api_requests: usageData.usage.api_requests?.percentage || 0,
            api_keys: 0,
          });

          if (usageData.period?.end) {
            const endDate = new Date(usageData.period.end);
            setNextBillingDate(endDate.toLocaleDateString());
          }

          setCurrentPlan(usageData.plan?.name?.toLowerCase() || 'free');
          setIsPastDue(usageData.plan?.status !== 'active');
          
          // Debug log
          console.log('Current plan set to:', usageData.plan?.name?.toLowerCase() || 'free');
        }
      }

      // Process plan data
      if (planResponse.status === 'fulfilled') {
        const planDataResponse = await planResponse.value.json();
        setPlanData(planDataResponse.plan_data || null);
      }

      // Process available plans
      if (plansResponse.status === 'fulfilled') {
        const plansData = await plansResponse.value.json();
        setAvailablePlans((Object.values(plansData) as Plan[]).filter((p: Plan) => p.name !== currentPlan));
      }

      // Process invoice data
      if (invoiceResponse.status === 'fulfilled') {
        const invoiceData = await invoiceResponse.value.json();
        // Only set if we have actual data (not null)
        if (invoiceData && invoiceData.amount !== undefined) {
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
          setInvoices(invoicesData || []);
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

  const handleManageBilling = () => {
    router.visit(`/${locale}/subscription/portal`);
  };

  const handleUpgrade = (priceId: string) => {
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

  const getStatusBadge = () => {
    if (isPastDue) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Past Due
        </Badge>
      );
    }
    if (isCanceled) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Canceled
        </Badge>
      );
    }
    if (isTrial) {
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <Zap className="h-3 w-3" />
          Trial
        </Badge>
      );
    }
    if (currentPlan !== 'free') {
      return (
        <Badge className="flex items-center gap-1 bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3" />
          Active
        </Badge>
      );
    }
    return null;
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 95) return 'text-red-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-green-600';
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
        {/* Header */}
        <div>
          <h3 className="text-lg font-medium">{t('billing.title', 'Billing & Subscription')}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {t('billing.subtitle', 'Manage your plan, view usage, and control your subscription.')}
          </p>
        </div>

        {/* Current Plan Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3">
                  <span>Current Plan</span>
                  {getStatusBadge()}
                </CardTitle>
                <CardDescription>
                  You are currently on the {planData?.name || 'FREE'} plan ({planData?.price || '€0'}
                  {planData?.interval ? `/${planData.interval}` : ''})
                  {nextBillingDate && (
                    <span className="ml-2">
                      • Next billing date: {nextBillingDate}
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {currentPlan !== 'free' && (
                  <Button
                    variant="outline"
                    onClick={handleManageBilling}
                    className="gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Manage Billing
                  </Button>
                )}
                <Button
                  onClick={() => setShowUpgradeDialog(true)}
                  className="gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  {currentPlan === 'free' ? 'Upgrade Plan' : 'Change Plan'}
                </Button>
                {currentPlan !== 'free' && (
                  <Button
                    variant="destructive"
                    onClick={() => setShowCancelDialog(true)}
                    className="gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Cancel Subscription
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Usage Overview */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>{usage?.documents || 0} of {planData?.limits?.documents === -1 ? '∞' : (planData?.limits?.documents || defaultLimits.documents)}</span>
                  <span className={getUsageColor(usagePercentages?.documents || 0)}>
                    {(usagePercentages?.documents || 0).toFixed(0)}%
                  </span>
                </div>
                <Progress
                  value={usagePercentages?.documents || 0}
                  className="h-2"
                />
                {usagePercentages?.documents >= 80 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {usagePercentages?.documents >= 95
                        ? "You've reached your document limit. Upgrade to continue uploading."
                        : "You're approaching your document limit. Consider upgrading soon."}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Models
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>{usage?.models || 0} of {planData?.limits?.models === -1 ? '∞' : (planData?.limits?.models || defaultLimits.models)}</span>
                  <span className={getUsageColor(usagePercentages?.models || 0)}>
                    {(usagePercentages?.models || 0).toFixed(0)}%
                  </span>
                </div>
                <Progress
                  value={usagePercentages?.models || 0}
                  className="h-2"
                />
                {usagePercentages?.models >= 80 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {usagePercentages?.models >= 95
                        ? "You've reached your models limit. Upgrade to continue creating new models."
                        : "You're approaching your models limit. Consider upgrading soon."}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                API Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>{usage?.api_requests || 0} of {planData?.limits?.api_requests === -1 ? '∞' : (planData?.limits?.api_requests || defaultLimits.api_requests)}</span>
                  <span className={getUsageColor(usagePercentages?.api_requests || 0)}>
                    {(usagePercentages?.api_requests || 0).toFixed(0)}%
                  </span>
                </div>
                <Progress
                  value={usagePercentages?.api_requests || 0}
                  className="h-2"
                />
                {usagePercentages?.api_requests >= 80 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {usagePercentages?.api_requests >= 95
                        ? "You've reached your API requests limit. Upgrade to continue using the API."
                        : "You're approaching your API requests limit. Consider upgrading soon."}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Keys
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>{usage?.api_keys || 0} of {planData?.limits?.api_keys === -1 ? '∞' : (planData?.limits?.api_keys || defaultLimits.api_keys)}</span>
                  <span className={getUsageColor(usagePercentages?.api_keys || 0)}>
                    {(usagePercentages?.api_keys || 0).toFixed(0)}%
                  </span>
                </div>
                <Progress
                  value={usagePercentages?.api_keys || 0}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Invoice */}
        {upcomingInvoice && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Invoice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold">
                    {upcomingInvoice?.amount != null && !isNaN(upcomingInvoice.amount) ? 
                      new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: upcomingInvoice?.currency || 'USD',
                      }).format((upcomingInvoice?.amount || 0) / 100) :
                      'N/A'
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Due on {upcomingInvoice?.date || 'N/A'}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  View Details
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
                        {invoice.amount != null && !isNaN(invoice.amount) ?
                          new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: invoice.currency,
                          }).format(invoice.amount / 100) :
                          'N/A'
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {invoice.date}
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
                        View
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No invoices yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Features Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Features</CardTitle>
            <CardDescription>
              What's included in your {planData?.name} plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {planData?.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </div>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('billing.change_plan', 'Change Your Plan')}</DialogTitle>
            <DialogDescription>
              {t('billing.current_plan_description', 'You are currently on the')} <strong>{planData?.name || t('billing.free_plan', 'FREE')}</strong> {t('billing.plan_select', 'plan. Select a new plan that fits your needs')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2 mt-4">
            {availablePlans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${
                  plan.recommended ? 'border-primary' : ''
                }`}
              >
                {plan.recommended && (
                  <Badge className="absolute -top-2 left-4">
                    Recommended
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.tagline}</CardDescription>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.interval && (
                      <span className="text-muted-foreground">/{plan.interval}</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    onClick={() => plan.stripe_price_id && handleUpgrade(plan.stripe_price_id)}
                  >
                    Subscribe to {plan.name}
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
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription? You will lose access to all premium features at the end of your billing period.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Subscription
            </Button>
            <Button variant="destructive" onClick={handleCancelSubscription}>
              Cancel Subscription
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </SettingsLayout>
    </AppLayout>
  );
}
