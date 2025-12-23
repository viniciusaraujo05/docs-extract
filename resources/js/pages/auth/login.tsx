import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Head, router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff,
  Sparkles,
  Shield,
  Zap,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({ status, canResetPassword, canRegister }: LoginProps) {
    const { t } = useTranslation();
    const { props } = usePage<{ auth?: { user?: any }; locale: string }>();
    const locale = props.locale || 'pt';
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        if (props.auth?.user) {
            router.visit(`/${locale}/dashboard`);
            return;
        }
        
        if (status) {
            toast.success(status);
        }
    }, [status, props.auth, locale]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        router.post(`/${locale}/login`, {
            email,
            password,
            remember,
        }, {
            onError: (errors) => {
                setErrors(errors);
                toast.error(t('Invalid credentials'));
                setProcessing(false);
            },
            onSuccess: () => {
                toast.success(t('Welcome back!'));
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
            <Head title={t('Login')} />
            
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
                                {t('Welcome back')}
                            </h2>
                            <p className="text-sm sm:text-base text-muted-foreground">
                                {t('Enter your credentials to access your account')}
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium">
                                    {t('Email Address')}
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="pl-10 h-11 sm:h-12 text-sm sm:text-base"
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-sm text-red-400">{errors.email}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-sm font-medium">
                                        {t('Password')}
                                    </Label>
                                    {canResetPassword && (
                                        <button
                                            type="button"
                                            onClick={() => router.visit(`/${locale}/forgot-password`)}
                                            className="text-sm text-primary hover:text-primary/80"
                                        >
                                            {t('Forgot password?')}
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="pl-10 pr-10 h-11 sm:h-12 text-sm sm:text-base"
                                        required
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="remember"
                                    checked={remember}
                                    onCheckedChange={(checked) => setRemember(checked as boolean)}
                                />
                                <Label
                                    htmlFor="remember"
                                    className="text-sm font-normal cursor-pointer"
                                >
                                    {t('Remember me for 30 days')}
                                </Label>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full h-11 sm:h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-sm sm:text-base"
                            >
                                {processing ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 1 }}
                                    >
                                        <Sparkles className="h-5 w-5" />
                                    </motion.div>
                                ) : (
                                    <>
                                        {t('Sign in')}
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Register Link */}
                        {canRegister && (
                            <div className="mt-4 sm:mt-6 text-center">
                                <p className="text-sm text-muted-foreground">
                                    {t("Don't have an account?")}{' '}
                                    <button
                                        onClick={() => router.visit(`/${locale}/register`)}
                                        className="text-primary hover:text-primary/80 font-semibold"
                                    >
                                        {t('Sign up for free')}
                                    </button>
                                </p>
                            </div>
                        )}

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
                                {t('Transform documents into actionable data')}
                            </h2>
                            <p className="text-xl text-blue-100 mb-8">
                                {t('Join thousands of teams using AI to extract, organize and analyze document data automatically.')}
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
                                    <span>{t('14-day free trial')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5" />
                                    <span>{t('No credit card required')}</span>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </>
    );
}
