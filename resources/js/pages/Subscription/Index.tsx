import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { CancelSubscriptionModal } from '@/components/CancelSubscriptionModal';
import { useState } from 'react';
import { CreditCard, Download, Calendar, CheckCircle, XCircle } from 'lucide-react';

interface Subscription {
    id: string;
    name: string;
    stripe_status: string;
    stripe_price: string;
    quantity: number;
    trial_ends_at: string | null;
    ends_at: string | null;
}

interface Invoice {
    id: string;
    date: string;
    total: string;
    status: string;
    invoice_pdf: string;
}

export default function SubscriptionIndex({
    subscription,
    subscriptions,
    invoices,
}: {
    subscription: Subscription | null;
    subscriptions: Subscription[];
    invoices: Invoice[];
}) {
    const [showCancelModal, setShowCancelModal] = useState(false);

    const handlePortal = () => {
        const locale = document.documentElement.lang || 'en';
        router.visit(`/${locale}/subscription/portal`);
    };

    const handleCancelSubscription = () => {
        setShowCancelModal(true);
    };

    const handleResumeSubscription = async () => {
        try {
            const locale = document.documentElement.lang || 'en';
            const response = await fetch(`/${locale}/subscription/resume`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                router.reload();
            }
        } catch (error) {
            console.error('Error resuming subscription:', error);
        }
    };

    return (
        <AppLayout>
            <Head title="Subscription" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold">Subscription Management</h1>
                        <Button onClick={handlePortal} variant="outline">
                            <CreditCard className="mr-2 h-4 w-4" />
                            Billing Portal
                        </Button>
                    </div>

                    {subscription ? (
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>Current Subscription</CardTitle>
                                        <CardDescription>Manage your active subscription</CardDescription>
                                    </div>
                                    <Badge
                                        variant={
                                            subscription.stripe_status === 'active'
                                                ? 'default'
                                                : subscription.stripe_status === 'canceled'
                                                ? 'destructive'
                                                : 'secondary'
                                        }
                                    >
                                        {subscription.stripe_status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Plan</p>
                                        <p className="font-semibold">{subscription.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Price ID</p>
                                        <p className="font-mono text-sm">{subscription.stripe_price}</p>
                                    </div>
                                </div>

                                {subscription.ends_at && (
                                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-yellow-600" />
                                            <p className="text-sm">
                                                Subscription ends on{' '}
                                                <span className="font-semibold">
                                                    {new Date(subscription.ends_at).toLocaleDateString()}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    {subscription.stripe_status === 'active' && !subscription.ends_at && (
                                        <Button onClick={handleCancelSubscription} variant="destructive">
                                            Cancel Subscription
                                        </Button>
                                    )}
                                    {subscription.ends_at && (
                                        <Button onClick={handleResumeSubscription}>Resume Subscription</Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle>No Active Subscription</CardTitle>
                                <CardDescription>Choose a plan to get started</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button onClick={() => {
                                    const locale = document.documentElement.lang || 'en';
                                    router.visit(`/${locale}`);
                                }}>View Plans</Button>
                            </CardContent>
                        </Card>
                    )}

                    {invoices && invoices.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Billing History</CardTitle>
                                <CardDescription>View and download your invoices</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {invoices.map((invoice) => (
                                        <div
                                            key={invoice.id}
                                            className="flex items-center justify-between p-4 border rounded-lg"
                                        >
                                            <div className="flex items-center gap-4">
                                                {invoice.status === 'paid' ? (
                                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-red-500" />
                                                )}
                                                <div>
                                                    <p className="font-semibold">{invoice.total}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {new Date(invoice.date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={invoice.invoice_pdf} target="_blank" rel="noopener noreferrer">
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Download
                                                </a>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
            <CancelSubscriptionModal 
                open={showCancelModal} 
                onOpenChange={setShowCancelModal} 
            />
        </AppLayout>
    );
}
