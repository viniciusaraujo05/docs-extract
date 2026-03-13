import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { router, usePage } from '@inertiajs/react';
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
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface LoginProps {
    status?: string;
    error?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}


export default function Login({ status, error, canResetPassword, canRegister }: LoginProps) {

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
        // If there is a critical error (like OAuth failure), DO NOT redirect
        if (error) {
            toast.error(error);
            return;
        }

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
                            {error && (
                                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-center gap-3">
                                    <Shield className="h-5 w-5 text-red-400 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

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
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            {t('Sign in')}
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </>
                                    )}
                                </Button>
                            </motion.div>
                        </form>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-black px-2 text-gray-400">
                                    {t('Or continue with')}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                variant="outline"
                                className="bg-white/5 border-white/10 hover:bg-white/10 hover:text-white"
                                onClick={() => window.location.href = `/${locale}/auth/github`}
                            >
                                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                </svg>
                                GitHub
                            </Button>
                            <Button
                                variant="outline"
                                className="bg-white/5 border-white/10 hover:bg-white/10 hover:text-white"
                                onClick={() => window.location.href = `/${locale}/auth/google`}
                            >
                                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                                </svg>
                                Google
                            </Button>
                        </div>

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
                    className="hidden lg:flex flex-1 p-10 items-center justify-center relative overflow-hidden bg-zinc-950 border-l border-white/5"
                >
                    {/* Fine grid background */}
                    <div className="absolute inset-0 opacity-[0.04]"
                        style={{ backgroundImage: "linear-gradient(to right,#60a5fa 1px,transparent 1px),linear-gradient(to bottom,#60a5fa 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
                    {/* Subtle background glow */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_30%_60%,rgba(37,99,235,0.18),transparent)]" />

                    <div className="relative z-10 max-w-md w-full">
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h2 className="text-3xl font-bold mb-3 text-white leading-tight">
                                {locale === 'pt'
                                    ? 'Os seus documentos,\nprontos em minutos.'
                                    : 'Your documents,\ndone in minutes.'}
                            </h2>
                            <p className="text-gray-400 mb-8 leading-relaxed">
                                {locale === 'pt'
                                    ? 'Carregue um PDF. Confirme os campos. Exporte para a sua folha de cálculo. Sem digitar nada.'
                                    : 'Upload a PDF. Check the fields. Export to your spreadsheet. No typing needed.'}
                            </p>

                            {/* Data transformation visual */}
                            <div className="relative mb-8 rounded-xl overflow-hidden border border-white/8 bg-[#06090f]"
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
                                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
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
                                        <span className="text-[10px] text-blue-400/60 font-mono tracking-wide">PDF</span>
                                    </motion.div>

                                    {/* Animated pipeline */}
                                    <div className="flex-1 flex flex-col items-center gap-1.5">
                                        {/* Flow dots */}
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
                                        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                        className="flex flex-col items-center gap-2"
                                    >
                                        <div className="rounded-md border border-cyan-500/25 bg-[#051a1a] overflow-hidden shadow-lg shadow-cyan-900/20">
                                            {/* Header */}
                                            <div className="bg-blue-900/40 px-2 py-[3px] flex gap-1.5">
                                                {['A','B','C'].map(c => (
                                                    <div key={c} className="text-[7px] text-blue-300/60 font-mono w-6 text-center">{c}</div>
                                                ))}
                                            </div>
                                            {/* Rows */}
                                            {[0,1,2,3].map((row) => (
                                                <motion.div
                                                    key={row}
                                                    className="flex gap-1.5 px-2 py-[3px] border-t border-white/5"
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
                                    { text: 'Sem mais digitação manual de PDFs', color: 'text-blue-400' },
                                    { text: 'Confirme antes de exportar — você decide', color: 'text-green-400' },
                                    { text: 'Gratuito para começar, sem cartão', color: 'text-emerald-400' },
                                ] : [
                                    { text: 'No more typing from PDFs by hand', color: 'text-blue-400' },
                                    { text: 'Review before exporting — you stay in control', color: 'text-green-400' },
                                    { text: 'Free to start, no credit card needed', color: 'text-emerald-400' },
                                ]).map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + i * 0.1 }}
                                        className="flex items-center gap-3 text-sm text-gray-300"
                                    >
                                        <CheckCircle className={`h-4 w-4 shrink-0 ${item.color}`} />
                                        <span>{item.text}</span>
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
