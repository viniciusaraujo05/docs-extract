import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { CreditCard, ArrowLeft, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface CheckoutProps {
    priceId?: string;
    planName?: string;
    userName?: string;
    userEmail?: string;
}

export default function Checkout({ priceId, planName, userName, userEmail }: CheckoutProps) {
    const { t } = useTranslation();
    const [isProcessing, setIsProcessing] = useState(false);
    const locale = document.documentElement.lang || 'en';
    const handleCheckout = () => {
        if (!priceId) {
            alert(t('subscription.checkout.noPriceSelected'));
            return;
        }

        setIsProcessing(true);

        // Use Inertia router to handle CSRF token automatically
        router.post(`/api/subscription/checkout`, {
            price_id: priceId
        }, {
            onFinish: () => setIsProcessing(false),
            onError: (errors) => {
                console.error('Checkout error:', errors);
                setIsProcessing(false);
            }
        });
    };

    const handleBack = () => {
        router.visit(`/${locale}`);
    };

    return (
        <AppLayout>
            <Head title={t('subscription.checkout.title')} />

            <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
                <div className="container mx-auto px-4 max-w-2xl">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        className="mb-6"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t('subscription.checkout.back')}
                    </Button>

                    <Card className="border-2">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <CreditCard className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle className="text-3xl">
                                {t('subscription.checkout.title')}
                            </CardTitle>
                            
                            {/* Personalization */}
                            {userName && (
                                <div className="mt-2 text-primary font-medium">
                                    {t('subscription.checkout.welcome', 'Hello, {{name}}!', { name: userName })}
                                </div>
                            )}

                            <CardDescription className="text-lg mt-2">
                                {planName ? (
                                    <>
                                        {t('subscription.checkout.selectedPlan')}: <span className="font-semibold text-foreground">{planName}</span>
                                    </>
                                ) : (
                                    t('subscription.checkout.description')
                                )}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <div className="rounded-lg bg-muted/50 p-6 space-y-4">
                                <h3 className="font-semibold text-lg">
                                    {t('subscription.checkout.whatHappensNext')}
                                </h3>
                                <ol className="space-y-3 text-sm text-muted-foreground">
                                    <li className="flex items-start">
                                        <span className="mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                            1
                                        </span>
                                        <span>{t('subscription.checkout.step1')}</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                            2
                                        </span>
                                        <span>{t('subscription.checkout.step2')}</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                            3
                                        </span>
                                        <span>{t('subscription.checkout.step3')}</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                            4
                                        </span>
                                        <span>{t('subscription.checkout.step4')}</span>
                                    </li>
                                </ol>
                            </div>

                            <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
                                <div className="flex items-start space-x-3">
                                    <CreditCard className="h-5 w-5 text-primary mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">
                                            {t('subscription.checkout.securePayment')}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {t('subscription.checkout.securePaymentDesc')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Button
                                    onClick={handleCheckout}
                                    disabled={isProcessing || !priceId}
                                    className="w-full h-12 text-lg"
                                    size="lg"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            {t('subscription.checkout.processing')}
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="mr-2 h-5 w-5" />
                                            {t('subscription.checkout.proceedToPayment')}
                                        </>
                                    )}
                                </Button>

                                <p className="text-center text-xs text-muted-foreground">
                                    {t('subscription.checkout.cancelAnytime')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        <p>{t('subscription.checkout.questions')}</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
