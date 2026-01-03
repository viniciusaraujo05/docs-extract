import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Head, router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Lock, 
  ArrowRight, 
  Sparkles,
  Shield,
  Zap,
  CheckCircle,
  LoaderCircle,
  KeyRound,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { REGEXP_ONLY_DIGITS } from 'input-otp';

export default function TwoFactorChallenge() {
    const { t } = useTranslation();
    const { props } = usePage<{ locale: string }>();
    const locale = props.locale || 'pt';

    const [showRecoveryInput, setShowRecoveryInput] = useState<boolean>(false);
    const [code, setCode] = useState<string>('');
    const [recoveryCode, setRecoveryCode] = useState<string>('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<any>({});

    const authConfigContent = useMemo(() => {
        if (showRecoveryInput) {
            return {
                title: t('Recovery Code'),
                description: t('Please confirm access to your account by entering one of your emergency recovery codes.'),
                toggleText: t('Use an authentication code'),
            };
        }

        return {
            title: t('Two-Factor Authentication'),
            description: t('Enter the authentication code provided by your authenticator application.'),
            toggleText: t('Use a recovery code'),
        };
    }, [showRecoveryInput, t]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        router.post(`/${locale}/two-factor-challenge`, {
            code: showRecoveryInput ? undefined : code,
            recovery_code: showRecoveryInput ? recoveryCode : undefined,
        }, {
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    const benefits = [
        { icon: <Sparkles className="h-5 w-5" />, text: t('AI-powered extraction') },
        { icon: <Zap className="h-5 w-5" />, text: t('Process documents in seconds') },
        { icon: <Shield className="h-5 w-5" />, text: t('Bank-level security') },
    ];

    return (
        <>
            <Head title={t('Two-Factor Authentication')} />
            
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
                                {authConfigContent.title}
                            </h2>
                            <p className="text-sm sm:text-base text-muted-foreground">
                                {authConfigContent.description}
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                            {!showRecoveryInput ? (
                                <div className="flex flex-col items-center justify-center space-y-3">
                                    <InputOTP
                                        maxLength={6}
                                        value={code}
                                        onChange={(value) => setCode(value)}
                                        pattern={REGEXP_ONLY_DIGITS}
                                        autoFocus
                                    >
                                        <InputOTPGroup>
                                            <InputOTPSlot index={0} />
                                            <InputOTPSlot index={1} />
                                            <InputOTPSlot index={2} />
                                            <InputOTPSlot index={3} />
                                            <InputOTPSlot index={4} />
                                            <InputOTPSlot index={5} />
                                        </InputOTPGroup>
                                    </InputOTP>
                                    {errors.code && <p className="text-sm text-red-600">{errors.code}</p>}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="relative">
                                        <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            type="text"
                                            value={recoveryCode}
                                            onChange={(e) => setRecoveryCode(e.target.value)}
                                            placeholder={t('Enter recovery code')}
                                            className="pl-10 h-11 sm:h-12"
                                            autoFocus
                                        />
                                    </div>
                                    {errors.recovery_code && <p className="text-sm text-red-600">{errors.recovery_code}</p>}
                                </div>
                            )}

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
                                        {t('Verify')}
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Toggle Mode */}
                        <div className="mt-6 text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowRecoveryInput(!showRecoveryInput);
                                    setCode('');
                                    setRecoveryCode('');
                                    setErrors({});
                                }}
                                className="flex items-center justify-center gap-2 mx-auto text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                            >
                                <RefreshCw className="h-4 w-4" />
                                {authConfigContent.toggleText}
                            </button>
                        </div>

                        {/* Back to Home */}
                        <div className="mt-8 text-center">
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
                                {t('Double Protection')}
                            </h2>
                            <p className="text-xl text-blue-100 mb-8">
                                {t('Your account is protected by an extra layer of security. This keeps your document data safe even if someone gets your password.')}
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
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </>
    );
}
