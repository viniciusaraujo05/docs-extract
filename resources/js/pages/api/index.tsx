import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import apiRoutes from '@/routes/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Copy, Key, Plus, Trash2, AlertCircle, ChevronDown, BookOpen, Shield, FileText, RefreshCw } from 'lucide-react';
import { useCallback, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { type BreadcrumbItem } from '@/types';
import { useApiDocumentation } from '@/components/api/ApiDocumentation';

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

interface PageProps {
    clients: ApiClient[];
    flash?: {
        newClient?: NewClient;
    };
}

export default function ApiIndex() {
    const { t } = useTranslation();
    const page = usePage<PageProps & { locale?: string }>();
    const { clients, flash } = page.props;
    const locale = page.props.locale ?? 'pt';
    const [selectedEndpoint, setSelectedEndpoint] = useState<string>('auth.token');
    const [selectedResponseCode, setSelectedResponseCode] = useState<number>(200);

    const { gettingStarted, endpoints, securityNotes, documentStatuses } = useApiDocumentation();
    const createForm = useForm({});
    const deleteForm = useForm({});
    const regenerateForm = useForm({});
    const newClient = flash?.newClient;
    const [shownSecrets, setShownSecrets] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (newClient && !shownSecrets.has(newClient.id)) {
            toast.custom((toastId) => (
                <div className="flex flex-col gap-3 max-w-sm">
                    <div>
                        <p className="font-semibold text-sm mb-2">{t('Save these credentials now!')}</p>
                        <p className="text-xs text-muted-foreground mb-3">{t('The client secret will not be shown again.')}</p>
                    </div>
                    <div className="space-y-2">
                        <div>
                            <label className="text-xs font-medium">{t('Client ID')}</label>
                            <div className="flex items-center gap-2 mt-1">
                                <input
                                    type="text"
                                    value={newClient.client_id}
                                    readOnly
                                    className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs font-mono"
                                />
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(newClient.client_id);
                                        toast.success(`${t('Client ID')} ${t('copied to clipboard!')}`);
                                    }}
                                    className="p-1 hover:bg-muted rounded"
                                >
                                    <Copy className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium">{t('Client Secret')}</label>
                            <div className="flex items-center gap-2 mt-1">
                                <input
                                    type="text"
                                    value={newClient.client_secret}
                                    readOnly
                                    className="flex h-8 w-full rounded-md border border-primary/30 bg-primary/5 px-2 py-1 text-xs font-mono"
                                />
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(newClient.client_secret);
                                        toast.success(`${t('Client Secret')} ${t('copied to clipboard!')}`);
                                    }}
                                    className="p-1 hover:bg-muted rounded"
                                >
                                    <Copy className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ), {
                duration: 10000,
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
            <div className="flex flex-col gap-2">
                <p>{t('Are you sure you want to delete this API client? This action cannot be undone.')}</p>
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
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        {t('Delete')}
                    </button>
                    <button
                        onClick={() => toast.dismiss(toastId)}
                        className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        {t('Cancel')}
                    </button>
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

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} ${t('copied to clipboard!')}`);
    };

    const baseApiUrl = `${window.location.origin}/api/v1`;
    const breadcrumbs: BreadcrumbItem[] = [{ name: t('API'), href: `/${locale}/api` }];
    const endpointKeys = Object.keys(endpoints);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('API')} />
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('API')}</h1>
                    <p className="text-muted-foreground mt-2">{t('Manage your API credentials and explore the documentation')}</p>
                </div>

                <Tabs defaultValue="getting-started" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="getting-started"><BookOpen className="mr-2 h-4 w-4" />{t('Getting Started')}</TabsTrigger>
                        <TabsTrigger value="clients"><Key className="mr-2 h-4 w-4" />{t('API Clients')}</TabsTrigger>
                        <TabsTrigger value="docs"><FileText className="mr-2 h-4 w-4" />{t('Documentation')}</TabsTrigger>
                        <TabsTrigger value="security"><Shield className="mr-2 h-4 w-4" />{t('Security')}</TabsTrigger>
                    </TabsList>

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
                                        <Alert>
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>{t('The client secret was shown only once during creation. Keep it secure.')}</AlertDescription>
                                        </Alert>
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
                                <div className="space-y-3">
                                    {endpointKeys.map((key) => {
                                        const endpoint = endpoints[key];
                                        const isSelected = selectedEndpoint === key;
                                        return (
                                            <Collapsible key={key} open={isSelected} onOpenChange={(open) => open && setSelectedEndpoint(key)}>
                                                <Card>
                                                    <CollapsibleTrigger asChild>
                                                        <button className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors">
                                                            <div className="flex items-center gap-3">
                                                                <Badge variant={endpoint.method === 'GET' ? 'secondary' : endpoint.method === 'POST' ? 'default' : 'destructive'}>{endpoint.method}</Badge>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-mono font-semibold">{endpoint.path}</span>
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
                                                                                        <td className="px-3 py-2"><Badge variant={field.required ? 'destructive' : 'secondary'} className="text-xs">{field.required ? 'Yes' : 'No'}</Badge></td>
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
                                                                                        <td className="px-3 py-2"><Badge variant={param.required ? 'destructive' : 'secondary'} className="text-xs">{param.required ? 'Yes' : 'No'}</Badge></td>
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
                </Tabs>
            </div>
        </AppLayout>
    );
}
