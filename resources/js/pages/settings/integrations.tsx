import { Head, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import SettingsLayout from "@/layouts/settings/layout";
import { type BreadcrumbItem, type SharedData } from "@/types";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, RefreshCw, AlertCircle, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { router } from '@inertiajs/react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Integration {
    provider: string;
    name: string;
    email: string;
    avatar: string;
    created_at: string;
}

interface IntegrationsProps {
    integrations: Integration[];
    isZapierConnected: boolean;
}

export default function Integrations({ integrations, isZapierConnected }: IntegrationsProps) {
    const { t } = useTranslation();
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const locale = (page.props as any).locale || 'pt';
    const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);
    const [providerToDisconnect, setProviderToDisconnect] = useState<string | null>(null);

    const BREADCRUMBS: BreadcrumbItem[] = [
        { title: t('Dashboard'), href: `/${locale}/dashboard` },
        { title: t('Settings'), href: `/${locale}/settings/billing` },
        { title: t('Integrations'), href: `/${locale}/settings/integrations` },
    ];

    const handleConnect = (provider: string) => {
        window.location.href = `/${locale}/integrations/${provider}/connect`;
    };

    const handleDisconnectClick = (provider: string) => {
        setProviderToDisconnect(provider);
        setDisconnectDialogOpen(true);
    };

    const handleDisconnectConfirm = () => {
        if (!providerToDisconnect) return;

        router.post(`/api/integrations/${providerToDisconnect}/disconnect`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('Account disconnected successfully'));
                setDisconnectDialogOpen(false);
                setProviderToDisconnect(null);
            },
            onError: () => {
                toast.error(t('Failed to disconnect account'));
                setDisconnectDialogOpen(false);
                setProviderToDisconnect(null);
            }
        });
    };

    const googleAccount = integrations.find(i => i.provider === 'google');



    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title={t('Integrations')} />
            
            <SettingsLayout>
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium">{t('Integrations')}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {t('Connect external services to import documents and export data.')}
                        </p>
                    </div>

                    {/* Messages */}
                    {page.props.flash?.success && (
                        <Alert className="border-green-500 bg-green-50 dark:bg-green-900/10 text-green-800 dark:text-green-300">
                            <CheckCircle className="h-4 w-4" />
                            <AlertTitle>{t('Success')}</AlertTitle>
                            <AlertDescription>{page.props.flash.success}</AlertDescription>
                        </Alert>
                    )}
                    {page.props.flash?.error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>{t('Error')}</AlertTitle>
                            <AlertDescription>{page.props.flash.error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="grid gap-6">
                        {/* Google Drive / Sheets */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-full shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" role="img">
                                            <path d="M23.49,12.275 C23.49,11.485 23.425,10.73 23.295,10 H12 V14.51 H18.46 C18.18,15.99 17.335,17.245 16.08,18.09 L16.08,21.09 L19.905,21.09 C22.145,19.03 23.49,15.98 23.49,12.275 Z" fill="#4285F4"/>
                                            <path d="M12,24 C15.24,24 17.965,22.935 19.91,21.09 L16.08,18.09 C15.005,18.815 13.62,19.25 12,19.25 C8.865,19.25 6.215,17.135 5.265,14.29 L1.3,14.29 L1.3,17.385 C3.26,21.275 7.315,24 12,24 Z" fill="#34A853"/>
                                            <path d="M5.265,14.29 C5.025,13.565 4.9,12.795 4.9,12 C4.9,11.205 5.025,10.435 5.265,9.71 L5.265,6.62 L1.3,6.62 C0.47,8.28 0,10.09 0,12 C0,13.91 0.47,15.72 1.3,17.385 L5.265,14.29 Z" fill="#FBBC05"/>
                                            <path d="M12,4.75 C13.77,4.75 15.355,5.36 16.605,6.55 L20.02,3.135 C17.96,1.215 15.235,0 12,0 C7.315,0 3.26,2.725 1.3,6.62 L5.265,9.71 C6.215,6.865 8.865,4.75 12,4.75 Z" fill="#EA4335"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <CardTitle>Google Drive & Sheets</CardTitle>
                                        <CardDescription>{t('Import documents from Drive and export data to Sheets.')}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {googleAccount ? (
                                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            {googleAccount.avatar && (
                                                <img src={googleAccount.avatar} alt={googleAccount.name} className="w-10 h-10 rounded-full" />
                                            )}
                                            <div>
                                                <p className="font-medium text-sm">{googleAccount.name}</p>
                                                <p className="text-xs text-muted-foreground">{googleAccount.email}</p>
                                                <div className="flex items-center gap-1 mt-1 text-green-600">
                                                    <CheckCircle className="h-3 w-3" />
                                                    <span className="text-xs font-medium">{t('Connected')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => handleDisconnectClick('google')}
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                        >
                                            {t('Disconnect')}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <p className="text-sm text-muted-foreground max-w-md">
                                            {t('Connect your Google account to access your Drive files directly within the app and export extracted data to Google Sheets.')}
                                        </p>
                                        <Button onClick={() => handleConnect('google')}>
                                            {t('Connect Google')}
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Zapier Integration */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-[#FF4F00]/10 rounded-full shadow-sm">
                                        <Zap className="h-6 w-6 text-[#FF4F00]" fill="currentColor" />
                                    </div>
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            Zapier
                                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">SOON</Badge>
                                        </CardTitle>
                                        <CardDescription>{t('Automate workflows by connecting Docset to 5,000+ apps.')}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isZapierConnected ? (
                                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[#FF4F00] flex items-center justify-center">
                                                <Zap className="h-6 w-6 text-white" fill="currentColor" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">Zapier</p>
                                                <div className="flex items-center gap-1 mt-1 text-green-600">
                                                    <CheckCircle className="h-3 w-3" />
                                                    <span className="text-xs font-medium">{t('Connected')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <p className="text-sm text-muted-foreground max-w-md">
                                            {t('Connect Docset to Zapier to automatically export data, trigger actions, and streamline your workflow.')}
                                        </p>
                                        <Button 
                                            variant="outline"
                                            onClick={() => window.location.href = `/${locale}/api?tab=zapier`}
                                            className="border-[#FF4F00] text-[#FF4F00] hover:bg-[#FF4F00]/10"
                                        >
                                            {t('Connect Zapier')}
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </SettingsLayout>

            {/* Disconnect Confirmation Dialog */}
            <AlertDialog open={disconnectDialogOpen} onOpenChange={setDisconnectDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('Disconnect Account')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('Are you sure you want to disconnect this account? You will need to reconnect to access your files again.')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDisconnectConfirm}
                            className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
                        >
                            {t('Disconnect')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
