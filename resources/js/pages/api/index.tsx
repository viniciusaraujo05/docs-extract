
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import apiRoutes from '@/routes/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Copy, Key, Plus, Trash2, AlertCircle, ChevronDown, BookOpen, Shield, FileText, RefreshCw, Radio } from 'lucide-react';
import { useCallback, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { useApiDocumentation } from '@/components/api/ApiDocumentation';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from '@/lib/utils';


interface WebhookEndpoint {
    id: number;
    url: string;
    secret: string;
    events: string[];
    is_active: boolean;
    created_at: string;
}

interface ApiClient {
    id: number;
    public_id: string;
    name: string;
    client_id: string;
    status: string;
    rate_limit_per_minute: number;
    last_used_at: string | null;
    created_at: string;
}

interface NewClient extends ApiClient {
    client_secret: string;
}

interface ApiPageProps extends SharedData {
    clients: ApiClient[];
    webhooks: WebhookEndpoint[];
    flash: {
        success?: string | null;
        error?: string | null;
        warning?: string | null;
        info?: string | null;
        newClient?: NewClient;
    };
    isZapierConnected?: boolean;
}

export default function ApiIndex() {
    const { t } = useTranslation();
    const page = usePage<ApiPageProps>();
    const { clients, webhooks, flash, isZapierConnected = false } = page.props;
    const locale = page.props.locale ?? 'pt';
    const [selectedEndpoint, setSelectedEndpoint] = useState<string>('auth.token');
    const [selectedResponseCode, setSelectedResponseCode] = useState<number>(200);

    const { gettingStarted, endpoints, endpointCategories, securityNotes, documentStatuses } = useApiDocumentation();
    const createForm = useForm({});
    const deleteForm = useForm({});
    const regenerateForm = useForm({});
    const createWebhookForm = useForm({ url: '' });
    const deleteWebhookForm = useForm({});
    const regenerateWebhookForm = useForm({});
    const newClient = flash?.newClient;
    const [shownSecrets, setShownSecrets] = useState<Set<number>>(new Set());

    const [activeTab, setActiveTab] = useState('api-keys');

    useEffect(() => {
        if (newClient && !shownSecrets.has(newClient.id)) {
            toast.success(t('API Client created successfully! The secret is displayed below.'), {
                duration: 5000,
            });
            setShownSecrets(prev => new Set(prev).add(newClient.id));
        }
    }, [newClient, shownSecrets, t]);

    const handleCreateClient = () => {
        createForm.post(apiRoutes.clients.store(locale).url, {
            onSuccess: () => {
                toast.success(t('API Client created successfully!'));
            },
            onError: () => toast.error(t('Failed to create API client.')),
        });
    };

    const handleDeleteClient = useCallback((client: ApiClient) => {
        toast.custom((toastId) => (
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg p-4 max-w-md">
                <div className="flex flex-col gap-3">
                    <p className="text-sm text-slate-900 dark:text-slate-50">{t('Are you sure you want to delete this API client? This action cannot be undone.')}</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                toast.dismiss(toastId);
                                deleteForm.delete(apiRoutes.clients.destroy({ locale, apiClient: client.id }).url, {
                                    preserveScroll: true,
                                    onSuccess: () => {
                                        toast.success(t('API Client deleted successfully!'));
                                    },
                                    onError: () => {
                                        toast.error(t('Failed to delete API client.'));
                                    },
                                });
                            }}
                            className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                        >
                            {t('Delete')}
                        </button>
                        <button
                            onClick={() => toast.dismiss(toastId)}
                            className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-50 text-sm rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                        >
                            {t('Cancel')}
                        </button>
                    </div>
                </div>
            </div>
        ));
    }, [deleteForm, locale, t]);

    const handleRegenerateClient = useCallback(
        (clientId: number) => {
            regenerateForm.post(apiRoutes.clients.regenerate({ locale, apiClient: clientId }).url, {
                preserveScroll: true,
                onSuccess: () => toast.success(t('API Client secret regenerated successfully!')),
                onError: () => toast.error(t('Failed to regenerate API client secret.')),
            });
        },
        [locale, regenerateForm, t],
    );

    const handleCreateWebhook = (e: React.FormEvent) => {
        e.preventDefault();
        createWebhookForm.post(`/api/webhooks`, {
            onSuccess: () => {
                toast.success(t('Webhook created successfully!'));
                createWebhookForm.reset();
            },
            onError: () => toast.error(t('Failed to create webhook.')),
        });
    };

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
    const [selectedWebhook, setSelectedWebhook] = useState<WebhookEndpoint | null>(null);

    const checkDeleteWebhook = (webhook: WebhookEndpoint) => {
        setSelectedWebhook(webhook);
        setShowDeleteDialog(true);
    };

    const confirmDeleteWebhook = () => {
        if (!selectedWebhook) return;
        
        deleteWebhookForm.delete(`/${locale}/api/webhooks/${selectedWebhook.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('Webhook deleted successfully!'));
                setShowDeleteDialog(false);
                setSelectedWebhook(null);
            },
        });
    };

    const checkRegenerateSecret = (webhook: WebhookEndpoint) => {
        setSelectedWebhook(webhook);
        setShowRegenerateDialog(true);
    };

    const confirmRegenerateSecret = () => {
        if (!selectedWebhook) return;

        regenerateWebhookForm.post(`/api/webhooks/${selectedWebhook.id}/regenerate`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('Webhook secret regenerated!'));
                setShowRegenerateDialog(false);
                setSelectedWebhook(null);
            },
        });
    };

    const [disconnectZapierDialogOpen, setDisconnectZapierDialogOpen] = useState(false);
    const handleDisconnectZapier = () => {
        router.post(`/api/integrations/zapier/disconnect`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('Zapier disconnected successfully'));
                setDisconnectZapierDialogOpen(false);
            },
            onError: () => {
                toast.error(t('Failed to disconnect Zapier'));
                setDisconnectZapierDialogOpen(false);
            }
        });
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} ${t('copied to clipboard!')}`);
    };

    // @ts-ignore
    const { api_url } = usePage().props;
    const baseApiUrl = api_url || (typeof window !== 'undefined' ? `${window.location.origin}/v1` : '/v1');
    const breadcrumbs: BreadcrumbItem[] = [{ title: t('API'), href: `/${locale}/api` }];
    const endpointKeys = Object.keys(endpoints);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('API')} />
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{t('API')}</h1>
                        <p className="text-muted-foreground mt-2">{t('Manage your API credentials and explore the documentation')}</p>
                    </div>

                <Tabs defaultValue="getting-started" className="flex flex-col md:flex-row gap-8 items-start">
                    <TabsList className="flex flex-row md:flex-col h-auto w-full md:w-64 shrink-0 rounded-none border-b md:border-b-0 md:border-r bg-transparent p-0 justify-start space-x-2 md:space-x-0 md:space-y-2 mb-6 md:mb-0">
                        <TabsTrigger 
                            value="getting-started" 
                            className="w-full justify-start rounded-md px-4 py-2 hover:bg-muted/50 data-[state=active]:bg-muted data-[state=active]:shadow-none border-l-2 border-transparent data-[state=active]:border-primary transition-all"
                        >
                            <BookOpen className="mr-2 h-4 w-4" />{t('Getting Started')}
                        </TabsTrigger>
                        <TabsTrigger 
                            value="clients" 
                            className="w-full justify-start rounded-md px-4 py-2 hover:bg-muted/50 data-[state=active]:bg-muted data-[state=active]:shadow-none border-l-2 border-transparent data-[state=active]:border-primary transition-all"
                        >
                            <Key className="mr-2 h-4 w-4" />{t('API Clients')}
                        </TabsTrigger>
                        <TabsTrigger 
                            value="webhooks" 
                            className="w-full justify-start rounded-md px-4 py-2 hover:bg-muted/50 data-[state=active]:bg-muted data-[state=active]:shadow-none border-l-2 border-transparent data-[state=active]:border-primary transition-all"
                        >
                            <Radio className="mr-2 h-4 w-4" />{t('Webhooks')}
                        </TabsTrigger>
                        <TabsTrigger 
                            value="zapier" 
                            className="w-full justify-start rounded-md px-4 py-2 hover:bg-muted/50 data-[state=active]:bg-muted data-[state=active]:shadow-none border-l-2 border-transparent data-[state=active]:border-primary transition-all"
                        >
                            <div className="mr-2 p-1 bg-[#FF4F00]/10 rounded-full">
                                <span className="flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-[#FF4F00]"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                                </span>
                            </div>
                            {t('Zapier Integration')}
                            <Badge variant="secondary" className="ml-2 text-[10px] h-5 px-1.5 bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">SOON</Badge>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="docs" 
                            className="w-full justify-start rounded-md px-4 py-2 hover:bg-muted/50 data-[state=active]:bg-muted data-[state=active]:shadow-none border-l-2 border-transparent data-[state=active]:border-primary transition-all"
                        >
                            <FileText className="mr-2 h-4 w-4" />{t('Documentation')}
                        </TabsTrigger>
                        <TabsTrigger 
                            value="security" 
                            className="w-full justify-start rounded-md px-4 py-2 hover:bg-muted/50 data-[state=active]:bg-muted data-[state=active]:shadow-none border-l-2 border-transparent data-[state=active]:border-primary transition-all"
                        >
                            <Shield className="mr-2 h-4 w-4" />{t('Security')}
                        </TabsTrigger>
                    </TabsList>
                    
                    <div className="flex-1 min-w-0">

                    <TabsContent value="getting-started" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>{gettingStarted.title}</CardTitle>
                                <CardDescription>{t('Follow these steps to start using the DOCSET API')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {gettingStarted.steps.map((step) => (
                                    <div key={step.number} className="flex gap-4">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">{step.number}</div>
                                        <div className="space-y-2 flex-1">
                                            <h3 className="font-semibold">{step.title}</h3>
                                            <p className="text-sm text-muted-foreground">{step.description}</p>
                                            {step.endpoint && <div className="rounded-md border bg-muted/30 px-3 py-2 font-mono text-sm">{step.endpoint}</div>}
                                        </div>
                                    </div>
                                ))}
                                <Separator />
                                <div className="space-y-3">
                                    <h3 className="font-semibold">{t('Document Status')}</h3>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {documentStatuses.map((item) => (
                                            <div key={item.status} className="rounded-lg border p-3">
                                                <Badge variant="outline" className="mb-1">{item.status}</Badge>
                                                <p className="text-sm text-muted-foreground">{item.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="clients" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('API Client')}</CardTitle>
                                <CardDescription>{t('Your credentials to access the DOCSET API')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {clients.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div className="rounded-full bg-primary/10 p-4 mb-4"><Key className="h-8 w-8 text-primary" /></div>
                                        <h3 className="text-lg font-semibold mb-2">{t('No API Client')}</h3>
                                        <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">{t('Create your API client to start integrating DOCSET with your applications')}</p>
                                        <Button onClick={handleCreateClient} disabled={createForm.processing} size="lg">
                                            <Plus className="mr-2 h-4 w-4" />{createForm.processing ? t('Creating...') : t('Create API Client')}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="rounded-lg border bg-card p-6 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold">{clients[0].name}</h3>
                                                <p className="text-sm text-muted-foreground mt-1">{t('Created')} {new Date(clients[0].created_at).toLocaleDateString()}</p>
                                            </div>
                                            <Badge variant={clients[0].status === 'active' ? 'default' : 'secondary'}>{clients[0].status}</Badge>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">{t('Client ID')}</label>
                                            <div className="flex items-center gap-2">
                                                <input type="text" value={clients[0].client_id} readOnly className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono" />
                                                <Button size="icon" variant="outline" onClick={() => copyToClipboard(clients[0].client_id, t('Client ID'))}><Copy className="h-4 w-4" /></Button>
                                            </div>
                                        </div>
                                        {newClient && newClient.id === clients[0].id ? (
                                            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
                                                <div className="flex items-center gap-2 text-primary font-semibold">
                                                    <Key className="h-4 w-4" />
                                                    <span>{t('Save these credentials now!')}</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{t('The client secret will not be shown again.')}</p>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">{t('Client Secret')}</label>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={newClient.client_secret}
                                                            readOnly
                                                            className="flex h-10 w-full rounded-md border border-primary/30 bg-white dark:bg-slate-950 px-3 py-2 text-sm font-mono"
                                                        />
                                                        <Button size="icon" variant="outline" onClick={() => copyToClipboard(newClient.client_secret, t('Client Secret'))}>
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <Alert>
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription>{t('The client secret was shown only once during creation. Keep it secure.')}</AlertDescription>
                                            </Alert>
                                        )}
                                        <Separator />
                                        {clients[0].last_used_at && (
                                            <>
                                                <div className="text-sm">
                                                    <span className="text-muted-foreground">{t('Last Used')}</span>
                                                    <p className="font-medium mt-1">{new Date(clients[0].last_used_at).toLocaleDateString()}</p>
                                                </div>
                                                <Separator />
                                            </>
                                        )}
                                        <div className="flex gap-2 justify-end">
                                            <Button 
                                                variant="outline" 
                                                size="icon"
                                                onClick={() => handleRegenerateClient(clients[0].id)} 
                                                disabled={regenerateForm.processing}
                                                title={t('Regenerate Secret')}
                                            >
                                                <RefreshCw className={`h-4 w-4 ${regenerateForm.processing ? 'animate-spin' : ''}`} />
                                            </Button>
                                            <Button 
                                                variant="destructive" 
                                                size="icon"
                                                onClick={() => handleDeleteClient(clients[0])} 
                                                disabled={deleteForm.processing}
                                                title={t('Delete API Client')}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="webhooks" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('Webhooks')}</CardTitle>
                                <CardDescription>{t('Receive real-time notifications when your documents are processed')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="rounded-lg border bg-card p-6">
                                    <form onSubmit={handleCreateWebhook} className="flex gap-4 items-end">
                                        <div className="flex-1 space-y-2">
                                            <Label htmlFor="webhook-url">{t('Webhook URL')}</Label>
                                            <input
                                                id="webhook-url"
                                                type="url"
                                                placeholder="https://your-api.com/webhooks/docset"
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={createWebhookForm.data.url}
                                                onChange={(e) => createWebhookForm.setData('url', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <Button type="submit" disabled={createWebhookForm.processing}>
                                            <Plus className="mr-2 h-4 w-4" />{createWebhookForm.processing ? t('Adding...') : t('Add Webhook')}
                                        </Button>
                                    </form>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">{t('Active Webhooks')}</h3>
                                    {webhooks.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                                            {t('No webhooks configured yet.')}
                                        </div>
                                    ) : (
                                        <div className="grid gap-4">
                                            {webhooks.map((webhook) => (
                                                <div key={webhook.id} className="rounded-lg border p-4 flex flex-col gap-4">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <div className="font-mono text-sm break-all">{webhook.url}</div>
                                                                {webhook.is_active && (
                                                                    <div className="flex items-center gap-1.5 ml-2">
                                                                        <span className="relative flex h-2.5 w-2.5">
                                                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                                                                        </span>
                                                                        <span className="text-xs text-muted-foreground">{t('Active')}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">
                                                                {t('Created')} {new Date(webhook.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm"
                                                                onClick={() => checkRegenerateSecret(webhook)}
                                                                disabled={regenerateWebhookForm.processing}
                                                            >
                                                                <RefreshCw className={cn("h-4 w-4 mr-2", regenerateWebhookForm.processing && "animate-spin")} />
                                                                {t('Regenerate Secret')}
                                                            </Button>
                                                            <Button 
                                                                variant="destructive" 
                                                                size="sm"
                                                                onClick={() => checkDeleteWebhook(webhook)}
                                                                disabled={deleteWebhookForm.processing}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="space-y-2 bg-muted/30 p-3 rounded-md">
                                                        <label className="text-sm font-medium flex items-center gap-2">
                                                            {t('Signing Secret')}
                                                            <Badge variant="outline" className="text-[10px] h-5">HMAC-SHA256</Badge>
                                                        </label>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="text"
                                                                value={webhook.secret}
                                                                readOnly
                                                                className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-1 text-sm font-mono text-muted-foreground"
                                                            />
                                                            <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => copyToClipboard(webhook.secret, t('Secret'))}>
                                                                <Copy className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            {t('Use this secret to verify the X-Webhook-Signature header.')}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">{t('Integration Guide')}</h3>
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                                            <h4 className="font-medium flex items-center gap-2">
                                                <Shield className="h-4 w-4" />
                                                {t('Verifying Signatures')}
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                {t('Secure your webhook endpoint by verifying the signature included in the request headers.')}
                                            </p>
                                            
                                            <div className="space-y-2">
                                                <Label>{t('PHP (Laravel) Example')}</Label>
                                                <div className="rounded-md bg-stone-900 border border-stone-800 p-3 overflow-x-auto">
<pre className="text-xs font-mono text-stone-50 leading-relaxed">
{`$payload = $request->getContent();
$signature = $request->header('X-Webhook-Signature');
$secret = 'whsec_...'; // Your signing secret

$computedSignature = hash_hmac('sha256', $payload, $secret);

if (!hash_equals($signature, $computedSignature)) {
    abort(403, 'Invalid signature');
}`}
</pre>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>{t('Node.js (Express) Example')}</Label>
                                                <div className="rounded-md bg-stone-900 border border-stone-800 p-3 overflow-x-auto">
<pre className="text-xs font-mono text-stone-50 leading-relaxed">
{`const crypto = require('crypto');

const payload = JSON.stringify(req.body);
const signature = req.headers['x-webhook-signature'];
const secret = 'whsec_...';

const computed = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex');

if (signature !== computed) {
  throw new Error('Invalid signature');
}`}
</pre>
                                                </div>
                                            </div>

                                            <Separator className="my-6 border-stone-800" />

                                            <div className="space-y-3">
                                                <h4 className="font-medium flex items-center gap-2">
                                                    <FileText className="h-4 w-4" />
                                                    {t('Events & Payload Reference')}
                                                </h4>
                                                
                                                <div className="grid gap-3 sm:grid-cols-3 my-4">
                                                    <div className="rounded border border-stone-800 bg-stone-900/50 p-3">
                                                        <Badge variant="outline" className="mb-2 border-stone-700 text-stone-300">document.created</Badge>
                                                        <p className="text-xs text-muted-foreground">{t('Fired immediately when a new document is uploaded.')}</p>
                                                    </div>
                                                    <div className="rounded border border-stone-800 bg-stone-900/50 p-3">
                                                        <Badge variant="outline" className="mb-2 border-stone-700 text-stone-300">document.updated</Badge>
                                                        <p className="text-xs text-muted-foreground">{t('Fired when status marks as completed or data is extracted.')}</p>
                                                    </div>
                                                    <div className="rounded border border-stone-800 bg-stone-900/50 p-3">
                                                        <Badge variant="outline" className="mb-2 border-stone-700 text-stone-300">document.deleted</Badge>
                                                        <p className="text-xs text-muted-foreground">{t('Fired when a document is permanently deleted.')}</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>{t('Payload Structure')}</Label>
                                                    <div className="rounded-md bg-stone-900 border border-stone-800 p-3 overflow-x-auto">
<pre className="text-xs font-mono text-stone-50 leading-relaxed">
{`{
  "event": "document.updated",
  "created_at": "2024-03-20T10:00:00Z",
  "data": {
    "id": 12345, // Document ID
    "type": "document",
    "status": "completed" // processing, completed, failed
  }
}`}
</pre>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('Are you sure?')}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {t('This action cannot be undone. This will permanently delete the webhook endpoint.')}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={confirmDeleteWebhook} className="bg-destructive hover:bg-destructive/90">
                                        {t('Delete')}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('Regenerate Secret')}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {t('This will invalidate the current secret key immediately. Any active integrations will stop working until updated with the new secret.')}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={confirmRegenerateSecret}>
                                        {t('Regenerate')}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        {/* Zapier Disconnect Dialog */}
                        <AlertDialog open={disconnectZapierDialogOpen} onOpenChange={setDisconnectZapierDialogOpen}>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('Disconnect Zapier?')}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {t('Are you sure you want to disconnect your Zapier integration? Existing Zaps may stop working until you reconnect.')}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDisconnectZapier} className="bg-red-500 hover:bg-red-600 focus:ring-red-500">
                                        {t('Disconnect')}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </TabsContent>

                    <TabsContent value="zapier" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <div className="p-2 bg-[#FF4F00]/10 rounded-full shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-[#FF4F00]"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                                    </div>
                                    {t('Zapier Integration')}
                                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">SOON</Badge>
                                </CardTitle>
                                <CardDescription>{t('Connect DOCSET with 5,000+ apps using Zapier')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {isZapierConnected && (
                                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm text-green-900 dark:text-green-100">{t('Zapier Connected')}</p>
                                                <p className="text-xs text-green-700 dark:text-green-300">{t('Your account is successfully connected to Zapier.')}</p>
                                            </div>
                                        </div>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => setDisconnectZapierDialogOpen(true)}
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-900/50"
                                        >
                                            {t('Disconnect')}
                                        </Button>
                                    </div>
                                )}

                                <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-blue-600 dark:text-blue-400"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                                    <AlertTitle className="text-blue-900 dark:text-blue-100">{t('How it works')}</AlertTitle>
                                    <AlertDescription className="text-blue-700 dark:text-blue-300 leading-relaxed">
                                        {t('Our Zapier integration uses OAuth2 for secure authentication. When you connect your account in Zapier, a secure access token is automatically generated and stored by Zapier to authorize requests on your behalf. No manual API key handling is required.')}
                                    </AlertDescription>
                                </Alert>

                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">{t('Connection Steps')}</h3>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="rounded-lg border p-4 space-y-3 bg-muted/20">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">1</div>
                                            <h4 className="font-medium">{t('Find Docset in Zapier')}</h4>
                                            <p className="text-sm text-muted-foreground">{t('Search for "Docset" in the Zapier app directory or click the invite link below if in private beta.')}</p>
                                        </div>
                                        <div className="rounded-lg border p-4 space-y-3 bg-muted/20">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">2</div>
                                            <h4 className="font-medium">{t('Connect Account')}</h4>
                                            <p className="text-sm text-muted-foreground">{t('Click "Connect" in Zapier. You will be redirected to Docset to authorize the connection securely.')}</p>
                                        </div>
                                        <div className="rounded-lg border p-4 space-y-3 bg-muted/20">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">3</div>
                                            <h4 className="font-medium">{t('Accept Invite')}</h4>
                                            <p className="text-sm text-muted-foreground">{t('Accept the invitation to use the Docset integration and grant the necessary permissions.')}</p>
                                        </div>
                                        <div className="rounded-lg border p-4 space-y-3 bg-muted/20">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">4</div>
                                            <h4 className="font-medium">{t('Start Automating')}</h4>
                                            <p className="text-sm text-muted-foreground">{t('Create Zaps using "Document Processed" triggers or "Extract Data" actions.')}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-lg bg-orange-50 dark:bg-orange-950/20 p-6 border border-orange-100 dark:border-orange-900/50 flex flex-col items-center text-center space-y-4">
                                    <div className="p-3 bg-white dark:bg-background rounded-full shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-[#FF4F00]"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                                    </div>
                                    <div className="space-y-2 max-w-lg">
                                        <h3 className="text-xl font-bold text-orange-950 dark:text-orange-100">{t('Explore Docset on Zapier')}</h3>
                                        <p className="text-orange-800 dark:text-orange-200/80">
                                            {t('Browse our pre-built templates and start automating your document workflows in minutes.')}
                                        </p>
                                    </div>
                                    <Button size="lg" className="bg-[#FF4F00] hover:bg-[#FF4F00]/90 text-white border-0 shadow-lg shadow-orange-500/20" onClick={() => window.open('https://zapier.com/apps/docset/integrations', '_blank')}>
                                        {t('Go to Zapier')}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="docs" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('API Documentation')}</CardTitle>
                                <CardDescription>{t('Complete reference for DOCSET API v1')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>{t('Base URL')}</Label>
                                    <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/30 px-3 py-2 font-mono text-sm">
                                        <span>{baseApiUrl}</span>
                                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(baseApiUrl, t('Base URL'))}><Copy className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-6">
                                    {Object.entries(endpointCategories).map(([categoryKey, category]) => (
                                        <div key={categoryKey} className="space-y-3">
                                            <div>
                                                <h3 className="text-lg font-semibold">{category.title}</h3>
                                                <p className="text-sm text-muted-foreground">{category.description}</p>
                                            </div>
                                            <div className="space-y-3">
                                                {category.endpoints.map((key) => {
                                                    const endpoint = endpoints[key];
                                                    if (!endpoint) return null;
                                                    const isSelected = selectedEndpoint === key;
                                                    return (
                                                        <Collapsible key={key} open={isSelected} onOpenChange={(open) => open && setSelectedEndpoint(key)}>
                                                            <Card>
                                                                <CollapsibleTrigger asChild>
                                                                    <button className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors">
                                                                        <div className="flex items-center gap-3">
                                                                            <Badge variant={endpoint.method === 'GET' ? 'secondary' : endpoint.method === 'POST' ? 'default' : endpoint.method === 'PUT' ? 'default' : 'destructive'}>{endpoint.method}</Badge>
                                                                            <div>
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="font-mono font-semibold">{endpoint.path}</span>
                                                                                    <Button 
                                                                                        size="icon" 
                                                                                        variant="ghost" 
                                                                                        className="h-6 w-6 text-muted-foreground hover:text-foreground" 
                                                                                        onClick={(e) => { 
                                                                                            e.stopPropagation(); 
                                                                                            const origin = typeof window !== 'undefined' ? window.location.origin : '';
                                                                                            copyToClipboard(`${origin}${endpoint.path}`, t('Endpoint URL')); 
                                                                                        }}
                                                                                        title={t('Copy endpoint URL')}
                                                                                    >
                                                                                        <Copy className="h-3 w-3" />
                                                                                    </Button>
                                                                                    {endpoint.requiresAuth && <Badge variant="outline" className="text-xs">JWT</Badge>}
                                                                                </div>
                                                                                <p className="text-sm text-muted-foreground mt-1">{endpoint.description}</p>
                                                                            </div>
                                                                        </div>
                                                                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isSelected ? 'rotate-180' : ''}`} />
                                                                    </button>
                                                                </CollapsibleTrigger>
                                                    <CollapsibleContent>
                                                        <div className="space-y-4 px-4 pb-4">
                                                            <Separator />
                                                            {endpoint.requestBody?.fields && (
                                                                <div className="space-y-2">
                                                                    <Label>{t('Request Body')} ({endpoint.requestBody.type})</Label>
                                                                    <div className="rounded-md border overflow-hidden">
                                                                        <table className="w-full text-sm">
                                                                            <thead className="border-b bg-muted/30">
                                                                                <tr>
                                                                                    <th className="px-3 py-2 text-left font-medium">{t('Field')}</th>
                                                                                    <th className="px-3 py-2 text-left font-medium">{t('Type')}</th>
                                                                                    <th className="px-3 py-2 text-left font-medium">{t('Required')}</th>
                                                                                    <th className="px-3 py-2 text-left font-medium">{t('Description')}</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {endpoint.requestBody.fields.map((field) => (
                                                                                    <tr key={field.name} className="border-b last:border-0">
                                                                                        <td className="px-3 py-2 font-mono">{field.name}</td>
                                                                                        <td className="px-3 py-2 text-muted-foreground">{field.type}</td>
                                                                                        <td className="px-3 py-2"><Badge variant={field.required ? 'destructive' : 'secondary'} className="text-xs">{field.required ? t('Yes') : t('No')}</Badge></td>
                                                                                        <td className="px-3 py-2 text-muted-foreground">{field.description}</td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {endpoint.queryParams && endpoint.queryParams.length > 0 && (
                                                                <div className="space-y-2">
                                                                    <Label>{t('Query Parameters')}</Label>
                                                                    <div className="rounded-md border overflow-hidden">
                                                                        <table className="w-full text-sm">
                                                                            <thead className="border-b bg-muted/30">
                                                                                <tr>
                                                                                    <th className="px-3 py-2 text-left font-medium">{t('Parameter')}</th>
                                                                                    <th className="px-3 py-2 text-left font-medium">{t('Type')}</th>
                                                                                    <th className="px-3 py-2 text-left font-medium">{t('Required')}</th>
                                                                                    <th className="px-3 py-2 text-left font-medium">{t('Description')}</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {endpoint.queryParams.map((param) => (
                                                                                    <tr key={param.name} className="border-b last:border-0">
                                                                                        <td className="px-3 py-2 font-mono">{param.name}</td>
                                                                                        <td className="px-3 py-2 text-muted-foreground">{param.type}</td>
                                                                                        <td className="px-3 py-2"><Badge variant={param.required ? 'destructive' : 'secondary'} className="text-xs">{param.required ? t('Yes') : t('No')}</Badge></td>
                                                                                        <td className="px-3 py-2 text-muted-foreground">{param.description}</td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <div className="space-y-2">
                                                                <Label>{t('Responses')}</Label>
                                                                <Tabs value={selectedResponseCode.toString()} onValueChange={(v) => setSelectedResponseCode(parseInt(v))}>
                                                                    <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${endpoint.responses.length}, 1fr)` }}>
                                                                        {endpoint.responses.map((response) => (
                                                                            <TabsTrigger key={response.status} value={response.status.toString()}>
                                                                                <Badge variant={response.status === 200 || response.status === 201 ? 'default' : 'destructive'} className="mr-2">{response.status}</Badge>
                                                                                {response.status === 200 || response.status === 201 ? t('Success') : t('Error')}
                                                                            </TabsTrigger>
                                                                        ))}
                                                                    </TabsList>
                                                                    {endpoint.responses.map((response) => (
                                                                        <TabsContent key={response.status} value={response.status.toString()} className="space-y-2">
                                                                            <p className="text-sm text-muted-foreground">{response.description}</p>
                                                                            <div className="relative">
                                                                                <ScrollArea className="h-[200px] rounded-md border bg-muted/30 p-3">
                                                                                    <pre className="font-mono text-xs">{JSON.stringify(response.example, null, 2)}</pre>
                                                                                </ScrollArea>
                                                                                <Button size="sm" variant="outline" className="absolute top-2 right-2" onClick={() => copyToClipboard(JSON.stringify(response.example, null, 2), t('Response'))}>
                                                                                    <Copy className="h-3 w-3" />
                                                                                </Button>
                                                                            </div>
                                                                        </TabsContent>
                                                                    ))}
                                                                </Tabs>
                                                            </div>
                                                        </div>
                                                    </CollapsibleContent>
                                                                </Card>
                                                            </Collapsible>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('Security & Best Practices')}</CardTitle>
                                <CardDescription>{t('Important security considerations for using the DOCSET API')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {securityNotes.map((note, index) => (
                                    <div key={index} className="rounded-lg border p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-full bg-primary/10 p-2 mt-0.5"><Shield className="h-4 w-4 text-primary" /></div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold mb-1">{note.title}</h3>
                                                <p className="text-sm text-muted-foreground">{note.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    </div>
                </Tabs>
                </div>
            </div>
        </AppLayout>
    );
}
