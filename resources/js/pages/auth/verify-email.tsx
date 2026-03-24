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
  LogOut,
  FileJson
} from 'lucide-react';
import { toast } from 'sonner';

interface VerifyEmailProps {
    status?: string;
}

export default function VerifyEmail({ status }: VerifyEmailProps) {
    const { t, i18n } = useTranslation();
    const { props } = usePage<{ locale: string }>();
    const locale = props.locale || 'en';
    
    const [processing, setProcessing] = useState(false);
    
    useEffect(() => {
        i18n.changeLanguage(locale);
        localStorage.setItem('selected-locale', locale);
    }, [locale, i18n]);

    useEffect(() => {
        if (status === 'verification-link-sent') {
            toast.success(t('A new verification link has been sent to your email address.'));
        }
    }, [status]);

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

    return (
        <>
            <Head title="Verify Email - DOCSET" />
            
            <div className="min-h-screen flex bg-background text-foreground">
                <div className="flex-1 flex items-center justify-center p-6 lg:p-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-transparent to-blue-950/20" />
                    <div className="absolute inset-0">
                        <motion.div 
                          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                          }}
                          transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                        <motion.div 
                          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-700/20 rounded-full blur-3xl"
                          animate={{
                            scale: [1.2, 1, 1.2],
                            opacity: [0.5, 0.3, 0.5],
                          }}
                          transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1
                          }}
                        />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full max-w-md relative z-10"
                    >
                        <div className="mb-8">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-center gap-2 mb-8"
                                onClick={() => router.visit(`/${locale}`)}
                            >
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center cursor-pointer">
                                    <FileJson className="h-5 w-5 text-foreground" />
                                </div>
                                <span className="font-bold text-lg cursor-pointer">DOCSET</span>
                            </motion.div>

                            <div className="flex items-center justify-center mb-6">
                                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                                    <Mail className="w-8 h-8 text-blue-600" />
                                </div>
                            </div>

                            <h2 className="text-4xl font-bold mb-3 text-center">
                                {t('auth.verify_email.title')}
                            </h2>
                            <p className="text-muted-foreground text-center">
                                {t('auth.verify_email.description')}
                            </p>
                            <p className="text-muted-foreground text-center mt-2">
                                {t('auth.verify_email.link_sent')}
                            </p>
                        </div>

                        <form onSubmit={handleResend} className="space-y-6">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-semibold"
                                >
                                    {processing ? (
                                        <LoaderCircle className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            {t('Click here to resend verification email.')}
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </>
                                    )}
                                </Button>
                            </motion.div>
                        </form>

                        <div className="mt-6 text-center">
                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center gap-2 mx-auto text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </button>
                        </div>

                        <div className="mt-8 text-center">
                            <button
                                onClick={() => router.visit(`/${locale}`)}
                                className="text-sm text-muted-foreground hover:text-foreground transition"
                            >
                                ← {t('Back to home')}
                            </button>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 p-12 items-center justify-center relative overflow-hidden"
                >
                    <div className="absolute inset-0">
                        {[...Array(30)].map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    y: [0, -150, 0],
                                    x: [0, Math.random() * 100 - 50, 0],
                                    opacity: [0, 0.8, 0],
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: Math.random() * 8 + 5,
                                    delay: Math.random() * 5,
                                }}
                                className="absolute w-1 h-1 bg-white rounded-full"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                }}
                            />
                        ))}
                    </div>

                    <div className="relative z-10 max-w-md text-foreground">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <h2 className="text-5xl font-bold mb-6 leading-tight">
                                One step away from automation
                            </h2>
                            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
                                Verifying your email ensures the security of your account and enables full access to DOCSET.
                            </p>

                            <div className="space-y-4">
                                {[
                                    { icon: <Sparkles className="h-5 w-5" />, text: 'AI-powered extraction' },
                                    { icon: <Zap className="h-5 w-5" />, text: 'Process in seconds' },
                                    { icon: <Shield className="h-5 w-5" />, text: 'Bank-level security' },
                                ].map((benefit, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 + i * 0.1 }}
                                        className="flex items-center gap-3 bg-muted backdrop-blur-sm rounded-xl p-4 border border-border"
                                    >
                                        <div className="bg-muted rounded-lg p-2">
                                            {benefit.icon}
                                        </div>
                                        <span className="font-medium text-lg">{benefit.text}</span>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="mt-10 flex items-center gap-6 text-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <span>Instant activation</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <span>Secure access</span>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </>
    );
}
