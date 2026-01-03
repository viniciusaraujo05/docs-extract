import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Head, router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  ArrowRight, 
  Sparkles,
  Shield,
  Zap,
  CheckCircle,
  LoaderCircle,
  LogOut
} from 'lucide-react';
import { toast } from 'sonner';

interface VerifyEmailProps {
    status?: string;
}

export default function VerifyEmail({ status }: VerifyEmailProps) {
    const { t } = useTranslation();
    const { props } = usePage<{ locale: string }>();
    const locale = props.locale || 'pt';
    
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (status === 'verification-link-sent') {
            toast.success(t('A new verification link has been sent to your email address.'));
        }
    }, [status, t]);

    const handleResend = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        router.post(`/${locale}/email/verification-notification`, {}, {
            onFinish: () => setProcessing(false),
        });
    };

    const handleLogout = () => {
        router.post(`/${locale}/logout`);
    };

    const benefits = [
        { icon: <Sparkles className="h-5 w-5" />, text: t('AI-powered extraction') },
        { icon: <Zap className="h-5 w-5" />, text: t('Process documents in seconds') },
        { icon: <Shield className="h-5 w-5" />, text: t('Bank-level security') },
    ];

    return (
        <>
            <Head title={t('Verify Email')} />
            
            <div className="min-h-screen flex">
                {/* Left Side - Form */}
                <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full max-w-md"
                    >
                        {/* Logo */}
                        <div className="mb-6 sm:mb-8">
                            <motion.h1
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"
                            >
                                DOCSET
                            </motion.h1>
                        </div>

                        {/* Header */}
                        <div className="mb-6 sm:mb-8">
                            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                                {t('Verify your email')}
                            </h2>
                            <p className="text-sm sm:text-base text-muted-foreground">
                                {t('Thanks for signing up! Before getting started, could you verify your email address by clicking on the link we just emailed to you?')}{' '}
                                {t("If you didn't receive the email, we will gladly send you another.")}
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleResend} className="space-y-4 sm:space-y-6">
                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full h-11 sm:h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-sm sm:text-base"
                            >
                                {processing ? (
                                    <LoaderCircle className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        {t('Resend Verification Email')}
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Logout */}
                        <div className="mt-6 text-center">
                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center gap-2 mx-auto text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                {t('Logout')}
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="mt-6 sm:mt-8 mb-4 sm:mb-6 flex items-center">
                            <div className="flex-1 border-t border-border"></div>
                            <span className="px-4 text-sm text-gray-500">{t('or')}</span>
                            <div className="flex-1 border-t border-border"></div>
                        </div>

                        {/* Back to Home */}
                        <div className="text-center">
                            <button
                                onClick={() => router.visit(`/${locale}`)}
                                className="text-sm text-muted-foreground hover:text-foreground"
                            >
                                ← {t('Back to home')}
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Right Side - Benefits */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 p-8 lg:p-12 items-center justify-center relative overflow-hidden"
                >
                    {/* Animated Background */}
                    <div className="absolute inset-0">
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    y: [0, -100, 0],
                                    x: [0, Math.random() * 100 - 50, 0],
                                    opacity: [0, 1, 0],
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: Math.random() * 5 + 3,
                                    delay: Math.random() * 5,
                                }}
                                className="absolute w-2 h-2 bg-white rounded-full"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                }}
                            />
                        ))}
                    </div>

                    <div className="relative z-10 max-w-md text-white">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <h2 className="text-4xl font-bold mb-6">
                                {t('One step away from automation')}
                            </h2>
                            <p className="text-xl text-blue-100 mb-8">
                                {t('Verifying your email ensures the security of your account and enables full access to Docset.')}
                            </p>

                            <div className="space-y-4">
                                {benefits.map((benefit, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 + i * 0.1 }}
                                        className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4"
                                    >
                                        <div className="bg-white/20 rounded-full p-2">
                                            {benefit.icon}
                                        </div>
                                        <span className="font-medium">{benefit.text}</span>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="mt-8 flex items-center gap-6 text-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5" />
                                    <span>{t('Instant activation')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5" />
                                    <span>{t('Secure access')}</span>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </>
    );
}
