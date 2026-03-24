import axios from 'axios';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { router, usePage } from '@inertiajs/react';
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
  Loader2,
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
                await axios.get(`${window.location.origin}/sanctum/csrf-cookie`);
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
            <div className="min-h-screen flex bg-background text-foreground">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="hidden lg:flex flex-1 p-10 items-center justify-center relative overflow-hidden bg-muted/30 border-r border-border"
                >
                    {/* Fine grid background */}
                    <div className="absolute inset-0 opacity-[0.04]"
                        style={{ backgroundImage: "linear-gradient(to right,#60a5fa 1px,transparent 1px),linear-gradient(to bottom,#60a5fa 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
                    {/* Subtle background glow */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_70%_60%,rgba(37,99,235,0.18),transparent)]" />

                    <div className="relative z-10 max-w-md w-full">
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h2 className="text-3xl font-bold mb-3 text-foreground leading-tight">
                                {locale === 'pt'
                                    ? 'O seu primeiro PDF,\npronto em minutos.'
                                    : 'Your first PDF,\nprocessed in minutes.'}
                            </h2>
                            <p className="text-muted-foreground mb-8 leading-relaxed">
                                {locale === 'pt'
                                    ? 'Sem configurações complexas. Carregue, confirme os campos e exporte — tudo num só lugar.'
                                    : 'No complex setup. Upload, check the fields, and export — all in one place.'}
                            </p>

                            {/* Data transformation visual */}
                            <div className="relative mb-8 rounded-xl overflow-hidden border border-border bg-[#06090f]"
                                style={{ background: "linear-gradient(135deg,#06090f 0%,#080d18 100%)" }}>
                                {/* Fine grid */}
                                <div className="absolute inset-0 opacity-[0.07]"
                                    style={{ backgroundImage: "linear-gradient(to right,#60a5fa 1px,transparent 1px),linear-gradient(to bottom,#60a5fa 1px,transparent 1px)", backgroundSize: "24px 24px" }} />
                                {/* Radial glow */}
                                <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(59,130,246,0.12),transparent)]" />

                                <div className="relative z-10 flex items-center justify-between gap-3 px-6 py-6">
                                    {/* PDF node */}
                                    <motion.div
                                        animate={{ y: [0, -4, 0] }}
                                        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                                        className="flex flex-col items-center gap-2"
                                    >
                                        <div className="w-14 h-[4.5rem] rounded-md border border-blue-500/30 bg-[#0d1b33] flex flex-col items-center justify-center relative shadow-lg shadow-blue-900/20">
                                            {/* Corner fold */}
                                            <div className="absolute top-0 right-0 w-0 h-0" style={{ borderLeft: "10px solid transparent", borderBottom: "10px solid #1e3a5f", borderTop: "10px solid #0d1b33", borderRight: "10px solid #0d1b33" }} />
                                            <div className="w-7 space-y-[4px] mt-2">
                                                {[1,0.6,1,0.7,1].map((w,i) => (
                                                    <div key={i} className="h-[2.5px] rounded-full bg-blue-400/40" style={{ width: `${w * 100}%` }} />
                                                ))}
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-blue-600/60 font-mono tracking-wide">PDF</span>
                                    </motion.div>

                                    {/* Animated pipeline */}
                                    <div className="flex-1 flex flex-col items-center gap-1.5">
                                        <div className="flex items-center gap-1 w-full justify-center">
                                            {[0,1,2,3,4,5].map((i) => (
                                                <motion.div
                                                    key={i}
                                                    className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                                                    animate={{ opacity: [0.15, 0.9, 0.15], scale: [0.7, 1.1, 0.7] }}
                                                    transition={{ duration: 1.4, delay: i * 0.18, repeat: Infinity }}
                                                />
                                            ))}
                                        </div>
                                        <div className="w-full h-px bg-gradient-to-r from-blue-500/20 via-cyan-400/40 to-blue-500/20" />
                                        <span className="text-[9px] text-cyan-400/50 font-mono tracking-widest uppercase">parsing</span>
                                    </div>

                                    {/* Data table node */}
                                    <motion.div
                                        animate={{ y: [0, 4, 0] }}
                                        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                        className="flex flex-col items-center gap-2"
                                    >
                                        <div className="rounded-md border border-cyan-500/25 bg-[#051a1a] overflow-hidden shadow-lg shadow-cyan-900/20">
                                            {/* Header */}
                                            <div className="bg-blue-900/40 px-2 py-[3px] flex gap-1.5">
                                                {['A','B','C'].map(c => (
                                                    <div key={c} className="text-[7px] text-blue-700/60 font-mono w-6 text-center">{c}</div>
                                                ))}
                                            </div>
                                            {/* Rows */}
                                            {[0,1,2,3].map((row) => (
                                                <motion.div
                                                    key={row}
                                                    className="flex gap-1.5 px-2 py-[3px] border-t border-border"
                                                    animate={{ opacity: [0.4, 0.9, 0.4] }}
                                                    transition={{ duration: 2, delay: row * 0.3 + 0.8, repeat: Infinity }}
                                                >
                                                    {[0,1,2].map((col) => (
                                                        <div key={col} className="w-6 h-[5px] rounded-sm bg-cyan-400/25" />
                                                    ))}
                                                </motion.div>
                                            ))}
                                        </div>
                                        <span className="text-[10px] text-cyan-400/60 font-mono tracking-wide">DATA</span>
                                    </motion.div>
                                </div>
                            </div>

                            {/* Benefits */}
                            <div className="space-y-3">
                                {(locale === 'pt' ? [
                                    { text: 'Funciona com faturas, recibos e contratos', color: 'text-blue-600' },
                                    { text: 'Confirme antes de exportar — você controla', color: 'text-green-600' },
                                    { text: 'Exporta para Sheets, CSV, JSON e mais', color: 'text-emerald-400' },
                                    { text: 'Plano gratuito disponível, sem cartão', color: 'text-cyan-400' },
                                ] : [
                                    { text: 'Works with invoices, receipts & contracts', color: 'text-blue-600' },
                                    { text: 'Review before exporting — you stay in control', color: 'text-green-600' },
                                    { text: 'Export to Sheets, CSV, JSON and more', color: 'text-emerald-400' },
                                    { text: 'Free plan available, no credit card', color: 'text-cyan-400' },
                                ]).map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + i * 0.1 }}
                                        className="flex items-center gap-3 text-sm text-muted-foreground"
                                    >
                                        <CheckCircle className={`h-4 w-4 shrink-0 ${item.color}`} />
                                        <span>{item.text}</span>
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
                                    <FileJson className="h-5 w-5 text-foreground" />
                                </div>
                                <span className="font-bold text-lg cursor-pointer">DOCSET</span>
                            </motion.div>

                            <h2 className="text-4xl font-bold mb-3">
                                {t('Create your account')}
                            </h2>
                            <p className="text-muted-foreground">
                                {t('Start extracting data from documents in minutes')}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium text-muted-foreground">
                                    {t('Full Name')}
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="John Doe"
                                        className="pl-10 h-12 bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-blue-500"
                                        required
                                        autoComplete="name"
                                    />
                                </div>
                                {errors.name && (
                                    <p className="text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">
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
                                        className="pl-10 h-12 bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-blue-500"
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium text-muted-foreground">
                                    {t('Password')}
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="pl-10 pr-10 h-12 bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-blue-500"
                                        required
                                        autoComplete="new-password"
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
                                {password && (
                                    <div className="space-y-1">
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${passwordStrength}%` }}
                                                className={`h-full ${getPasswordStrengthColor()} transition-all`}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Password strength: <span className={passwordStrength >= 75 ? 'text-green-600' : 'text-muted-foreground'}>{getPasswordStrengthText()}</span>
                                        </p>
                                    </div>
                                )}
                                {errors.password && (
                                    <p className="text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation" className="text-sm font-medium text-muted-foreground">
                                    {t('Confirm Password')}
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="password_confirmation"
                                        type={showPasswordConfirmation ? 'text' : 'password'}
                                        value={passwordConfirmation}
                                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                                        placeholder="••••••••"
                                        className="pl-10 pr-10 h-12 bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-blue-500"
                                        required
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            {t('Create account')}
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </>
                                    )}
                                </Button>
                            </motion.div>

                            <p className="text-xs text-center text-muted-foreground">
                                By creating an account, you agree to our{' '}
                                <a href={`/${locale}/terms`} className="text-blue-600 hover:text-blue-700">
                                    Terms of Service
                                </a>{' '}
                                and{' '}
                                <a href={`/${locale}/privacy`} className="text-blue-600 hover:text-blue-700">
                                    Privacy Policy
                                </a>
                            </p>
                        </form>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    {t('Or continue with')}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                variant="outline"
                                className="bg-muted border-border hover:bg-muted hover:text-foreground"
                                onClick={() => window.location.href = `/${locale}/auth/github`}
                            >
                                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                </svg>
                                GitHub
                            </Button>
                            <Button
                                variant="outline"
                                className="bg-muted border-border hover:bg-muted hover:text-foreground"
                                onClick={() => window.location.href = `/${locale}/auth/google`}
                            >
                                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                                </svg>
                                Google
                            </Button>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-muted-foreground">
                                {t('Already have an account?')} {' '}
                                <button
                                    onClick={() => router.visit(`/${locale}/login`)}
                                    className="text-blue-600 hover:text-blue-700 font-semibold"
                                >
                                    {t('Sign in')}
                                </button>
                            </p>
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
            </div>
        </>
    );
}
