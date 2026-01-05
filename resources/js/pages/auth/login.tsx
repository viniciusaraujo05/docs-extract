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
  FileJson,
  CheckCircle,
  Shield,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({ status, canResetPassword, canRegister }: LoginProps) {
    const { t, i18n } = useTranslation();
    const { props } = usePage<{ auth?: { user?: any }; locale: string }>();
    const locale = props.locale || 'en';
    
    useEffect(() => {
        // Sincronizar idioma com i18n
        i18n.changeLanguage(locale);
        localStorage.setItem('selected-locale', locale);
    }, [locale, i18n]);
    
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
                toast.error('Invalid credentials');
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

    return (
        <>
            <Head title="Login - DOCSET" />
            
            <div className="min-h-screen flex bg-black text-white">
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
                                    <FileJson className="h-5 w-5 text-white" />
                                </div>
                                <span className="font-bold text-lg cursor-pointer">DOCSET</span>
                            </motion.div>

                            <h2 className="text-4xl font-bold mb-3">
                                {t('Welcome back')}
                            </h2>
                            <p className="text-gray-400">
                                {t('Enter your credentials to access your account')}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-300">
                                    {t('Email Address')}
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500"
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-sm text-red-400">{errors.email}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-sm font-medium text-gray-300">
                                        {t('Password')}
                                    </Label>
                                    {canResetPassword && (
                                        <button
                                            type="button"
                                            onClick={() => router.visit(`/${locale}/forgot-password`)}
                                            className="text-sm text-blue-400 hover:text-blue-300"
                                        >
                                            {t('Forgot password?')}
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="pl-10 pr-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500"
                                        required
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-red-400">{errors.password}</p>
                                )}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="remember"
                                    checked={remember}
                                    onCheckedChange={(checked) => setRemember(checked as boolean)}
                                    className="border-white/20"
                                />
                                <Label
                                    htmlFor="remember"
                                    className="text-sm font-normal cursor-pointer text-gray-300"
                                >
                                    {t('Remember me for 30 days')}
                                </Label>
                            </div>

                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full h-12 bg-white text-black hover:bg-gray-200 font-semibold"
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
                            </motion.div>
                        </form>

                        {canRegister && (
                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-400">
                                    {t("Don't have an account?")} {' '}
                                    <button
                                        onClick={() => router.visit(`/${locale}/register`)}
                                        className="text-blue-400 hover:text-blue-300 font-semibold"
                                    >
                                        {t('Sign up for free')}
                                    </button>
                                </p>
                            </div>
                        )}

                        <div className="mt-8 text-center">
                            <button
                                onClick={() => router.visit(`/${locale}`)}
                                className="text-sm text-gray-400 hover:text-white transition"
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

                    <div className="relative z-10 max-w-md text-white">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <h2 className="text-5xl font-bold mb-6 leading-tight">
                                Turn documents into structured data
                            </h2>
                            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
                                Extract, validate, and export data from PDFs and images with AI-powered precision.
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
                                        className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10"
                                    >
                                        <div className="bg-white/20 rounded-lg p-2">
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
                                    <CheckCircle className="h-5 w-5 text-green-400" />
                                    <span>Free plan available</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-400" />
                                    <span>No credit card required</span>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </>
    );
}
