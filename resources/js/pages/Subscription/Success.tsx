import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, ArrowRight, Zap, Shield, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export default function SubscriptionSuccess({ session_id }: { session_id?: string }) {
    const locale = document.documentElement.lang || 'en';
    const { t } = useTranslation();
    const [countdown, setCountdown] = useState(5);
    
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    router.visit(`/${locale}/settings/billing`);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [locale]);

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 blur-[128px] rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 blur-[128px] rounded-full animate-pulse delay-700" />
            </div>

            <Head title={t('subscription.success.title', 'Payment Successful')} />

            <div className="relative z-10 w-full max-w-md px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="border-border/50 bg-background/60 backdrop-blur-xl shadow-2xl overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-primary animate-gradient-x" />
                        
                        <CardContent className="pt-12 pb-8 px-8 text-center">
                            {/* Success Icon Animation */}
                            <motion.div 
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                                className="mx-auto mb-8 w-24 h-24 bg-green-500/10 dark:bg-green-500/20 rounded-full flex items-center justify-center relative group"
                            >
                                <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping opacity-20" />
                                <Check className="h-12 w-12 text-green-600 dark:text-green-400 drop-shadow-sm" strokeWidth={3} />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 mb-3">
                                    {t('subscription.success.heading', 'Payment Successful!')}
                                </h1>
                                <p className="text-muted-foreground mb-8 text-lg">
                                    {t('subscription.success.message', 'Thank you for subscribing. Your account has been instantly upgraded to the premium plan.')}
                                </p>
                            </motion.div>
                            
                            {/* Features Preview */}
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="grid grid-cols-3 gap-2 mb-8"
                            >
                                <div className="flex flex-col items-center p-3 rounded-lg bg-secondary/30 border border-border/30">
                                    <Zap className="h-5 w-5 text-amber-500 mb-2" />
                                    <span className="text-xs font-medium text-foreground/80">{t('subscription.success.instant', 'Instant Access')}</span>
                                </div>
                                <div className="flex flex-col items-center p-3 rounded-lg bg-secondary/30 border border-border/30">
                                    <Shield className="h-5 w-5 text-blue-500 mb-2" />
                                    <span className="text-xs font-medium text-foreground/80">{t('subscription.success.secure', 'Secure')}</span>
                                </div>
                                <div className="flex flex-col items-center p-3 rounded-lg bg-secondary/30 border border-border/30">
                                    <Sparkles className="h-5 w-5 text-primary mb-2" />
                                    <span className="text-xs font-medium text-foreground/80">{t('subscription.success.premium', 'Premium')}</span>
                                </div>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="flex flex-col gap-3"
                            >
                                <Button 
                                    onClick={() => router.visit(`/${locale}/settings/billing`)} 
                                    className="w-full h-12 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                                >
                                    {t('subscription.success.button.billing', 'View Subscription')}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                                
                                <Button 
                                    onClick={() => router.visit(`/${locale}/dashboard`)} 
                                    variant="ghost" 
                                    className="w-full text-muted-foreground hover:text-foreground"
                                >
                                    {t('subscription.success.button.dashboard', 'Go to Dashboard')}
                                </Button>
                            </motion.div>

                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="text-xs text-muted-foreground mt-8"
                            >
                                {t('subscription.success.redirect', 'Redirecting automatically in {{seconds}}s...', { seconds: countdown })}
                            </motion.p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
