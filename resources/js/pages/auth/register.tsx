import axios from 'axios';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Head, router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Eye, 
  EyeOff,
  Sparkles,
  CheckCircle,
  Shield,
  Zap,
  BarChart3,
  FileJson,
} from 'lucide-react';
import { toast } from 'sonner';

interface RegisterProps {
    canRegister: boolean;
}

export default function Register({ canRegister }: RegisterProps) {
    const { t, i18n } = useTranslation();
    const { props } = usePage<{ auth?: { user?: any }; locale: string }>();
    const locale = props.locale || 'en';
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<any>({});
    const [passwordStrength, setPasswordStrength] = useState(0);
    
    // Checkout flow states
    const [priceId, setPriceId] = useState<string | null>(null);
    const [planName, setPlanName] = useState<string | null>(null);

    useEffect(() => {
        // Ensure fresh CSRF token on mount to prevent 419 errors
        const refreshCsrf = async () => {
            try {
                await axios.get('/sanctum/csrf-cookie');
            } catch (error) {
                console.error('Failed to refresh CSRF token', error);
            }
        };
        refreshCsrf();
    }, []);

    useEffect(() => {
        if (props.auth?.user) {
            router.visit(`/${locale}/dashboard`);
            return;
        }
    }, [props.auth, locale]);
    
    useEffect(() => {
        // Sincronizar idioma com i18n
        i18n.changeLanguage(locale);
        localStorage.setItem('selected-locale', locale);
    }, [locale, i18n]);

    useEffect(() => {
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 25;
        if (password.match(/[0-9]/)) strength += 25;
        if (password.match(/[^a-zA-Z0-9]/)) strength += 25;
        setPasswordStrength(strength);
    }, [password]);

    // Capture plan parameters if present (for paid plan checkout flow)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const plan = params.get('plan');
            const urlPriceId = params.get('price_id') || plan; // plan param can also be price_id
            const urlPlanName = params.get('plan_name') || '';
            
            if (urlPriceId && urlPriceId.startsWith('price_')) {
                setPriceId(urlPriceId);
                setPlanName(urlPlanName);
            } else if (plan) {
                // Legacy: save to localStorage for dashboard pickup
                localStorage.setItem('pending_plan', plan);
                if (urlPlanName) localStorage.setItem('pending_plan_name', urlPlanName);
            }
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        // If priceId is set, use checkout flow (direct to Stripe)
        if (priceId) {
            router.post(`/${locale}/register-checkout`, {
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
                price_id: priceId,
                plan_name: planName,
                locale: locale, // Pass current locale
            }, {
                onError: (errors) => {
                    setErrors(errors);
                    toast.error(t('Please check the form for errors'));
                    setProcessing(false);
                },
                onSuccess: () => {
                    toast.success(t('Redirecting to checkout...'));
                },
                onFinish: () => {
                    setProcessing(false);
                },
            });
        } else {
            // Standard registration (free plan)
            router.post(`/${locale}/register`, {
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
                locale: locale, // Pass current locale
            }, {
                onError: (errors) => {
                    setErrors(errors);
                    toast.error('Please check the form for errors');
                    setProcessing(false);
                },
                onSuccess: () => {
                    toast.success(t('Account created successfully!'));
                },
                onFinish: () => {
                    setProcessing(false);
                },
            });
        }
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength < 25) return 'bg-red-500';
        if (passwordStrength < 50) return 'bg-orange-500';
        if (passwordStrength < 75) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getPasswordStrengthText = () => {
        if (passwordStrength < 25) return 'Weak';
        if (passwordStrength < 50) return 'Fair';
        if (passwordStrength < 75) return 'Good';
        return 'Strong';
    };

    return (
        <>
            <Head title="Register - DOCSET" />
            
            <div className="min-h-screen flex bg-black text-white">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
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
                            transition={{ delay: 0.2 }}
                        >
                            <h2 className="text-5xl font-bold mb-6 leading-tight">
                                Start extracting data today
                            </h2>
                            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
                                No credit card required. Get full access to all features with our free plan.
                            </p>

                            <div className="space-y-4">
                                {[
                                    { icon: <Sparkles className="h-5 w-5" />, text: 'AI-powered extraction' },
                                    { icon: <Zap className="h-5 w-5" />, text: 'Process documents instantly' },
                                    { icon: <BarChart3 className="h-5 w-5" />, text: 'Analytics & reports' },
                                    { icon: <Shield className="h-5 w-5" />, text: 'Enterprise security' },
                                ].map((feature, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + i * 0.1 }}
                                        className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10"
                                    >
                                        <div className="bg-white/20 rounded-lg p-2">
                                            {feature.icon}
                                        </div>
                                        <span className="font-medium text-lg">{feature.text}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                <div className="flex-1 flex items-center justify-center p-6 lg:p-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-transparent to-blue-950/20" />
                    <div className="absolute inset-0">
                        <motion.div 
                          className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"
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
                          className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-700/20 rounded-full blur-3xl"
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
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="w-full max-w-md relative z-10"
                    >
                        <div className="mb-8">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="flex items-center gap-2 mb-8"
                                onClick={() => router.visit(`/${locale}`)}
                            >
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center cursor-pointer">
                                    <FileJson className="h-5 w-5 text-white" />
                                </div>
                                <span className="font-bold text-lg cursor-pointer">DOCSET</span>
                            </motion.div>

                            <h2 className="text-4xl font-bold mb-3">
                                {t('Create your account')}
                            </h2>
                            <p className="text-gray-400">
                                {t('Start extracting data from documents in minutes')}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium text-gray-300">
                                    {t('Full Name')}
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                                    <Input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="John Doe"
                                        className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500"
                                        required
                                        autoComplete="name"
                                    />
                                </div>
                                {errors.name && (
                                    <p className="text-sm text-red-400">{errors.name}</p>
                                )}
                            </div>

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
                                <Label htmlFor="password" className="text-sm font-medium text-gray-300">
                                    {t('Password')}
                                </Label>
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
                                        autoComplete="new-password"
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
                                {password && (
                                    <div className="space-y-1">
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${passwordStrength}%` }}
                                                className={`h-full ${getPasswordStrengthColor()} transition-all`}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400">
                                            Password strength: <span className={passwordStrength >= 75 ? 'text-green-400' : 'text-gray-300'}>{getPasswordStrengthText()}</span>
                                        </p>
                                    </div>
                                )}
                                {errors.password && (
                                    <p className="text-sm text-red-400">{errors.password}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation" className="text-sm font-medium text-gray-300">
                                    {t('Confirm Password')}
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                                    <Input
                                        id="password_confirmation"
                                        type={showPasswordConfirmation ? 'text' : 'password'}
                                        value={passwordConfirmation}
                                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                                        placeholder="••••••••"
                                        className="pl-10 pr-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500"
                                        required
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                                    >
                                        {showPasswordConfirmation ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
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
                                            {t('Create account')}
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </>
                                    )}
                                </Button>
                            </motion.div>

                            <p className="text-xs text-center text-gray-400">
                                By creating an account, you agree to our{' '}
                                <a href={`/${locale}/terms`} className="text-blue-400 hover:text-blue-300">
                                    Terms of Service
                                </a>{' '}
                                and{' '}
                                <a href={`/${locale}/privacy`} className="text-blue-400 hover:text-blue-300">
                                    Privacy Policy
                                </a>
                            </p>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-400">
                                {t('Already have an account?')} {' '}
                                <button
                                    onClick={() => router.visit(`/${locale}/login`)}
                                    className="text-blue-400 hover:text-blue-300 font-semibold"
                                >
                                    {t('Sign in')}
                                </button>
                            </p>
                        </div>

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
            </div>
        </>
    );
}
