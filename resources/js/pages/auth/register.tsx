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
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

interface RegisterProps {
    canRegister: boolean;
}

export default function Register({ canRegister }: RegisterProps) {
    const { t } = useTranslation();
    const { props } = usePage();
    const locale = (props as any).locale || 'pt';
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<any>({});
    const [passwordStrength, setPasswordStrength] = useState(0);

    useEffect(() => {
        // Calculate password strength
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 25;
        if (password.match(/[0-9]/)) strength += 25;
        if (password.match(/[^a-zA-Z0-9]/)) strength += 25;
        setPasswordStrength(strength);
    }, [password]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        router.post(`/${locale}/register`, {
            name,
            email,
            password,
            password_confirmation: passwordConfirmation,
        }, {
            onError: (errors) => {
                setErrors(errors);
                toast.error(t('Please check the form for errors'));
                setProcessing(false);
            },
            onSuccess: () => {
                toast.success(t('Account created successfully!'));
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    const features = [
        { icon: <Sparkles className="h-5 w-5" />, text: t('AI-powered data extraction') },
        { icon: <Zap className="h-5 w-5" />, text: t('Process 100+ documents/month') },
        { icon: <BarChart3 className="h-5 w-5" />, text: t('Advanced analytics & reports') },
        { icon: <Shield className="h-5 w-5" />, text: t('Enterprise-grade security') },
    ];

    const getPasswordStrengthColor = () => {
        if (passwordStrength < 25) return 'bg-red-500';
        if (passwordStrength < 50) return 'bg-orange-500';
        if (passwordStrength < 75) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getPasswordStrengthText = () => {
        if (passwordStrength < 25) return t('Weak');
        if (passwordStrength < 50) return t('Fair');
        if (passwordStrength < 75) return t('Good');
        return t('Strong');
    };

    return (
        <>
            <Head title={t('Register')} />
            
            <div className="min-h-screen flex">
                {/* Left Side - Benefits */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 p-12 items-center justify-center relative overflow-hidden"
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
                            transition={{ delay: 0.2 }}
                        >
                            <h2 className="text-4xl font-bold mb-6">
                                {t('Start your 14-day free trial')}
                            </h2>
                            <p className="text-xl text-blue-100 mb-8">
                                {t('No credit card required. Get full access to all features.')}
                            </p>

                            <div className="space-y-4">
                                {features.map((feature, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + i * 0.1 }}
                                        className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4"
                                    >
                                        <div className="bg-white/20 rounded-full p-2">
                                            {feature.icon}
                                        </div>
                                        <span className="font-medium">{feature.text}</span>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="mt-8 p-6 bg-white/10 backdrop-blur-sm rounded-lg"
                            >
                                <p className="text-sm text-blue-100 mb-2">{t('Trusted by')}</p>
                                <p className="text-3xl font-bold">2,500+ {t('companies')}</p>
                                <p className="text-sm text-blue-100 mt-2">
                                    {t('Processing millions of documents monthly')}
                                </p>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Right Side - Form */}
                <div className="flex-1 flex items-center justify-center p-8 bg-background">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="w-full max-w-md"
                    >
                        {/* Logo */}
                        <div className="mb-8">
                            <motion.h1
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"
                            >
                                GetData
                            </motion.h1>
                        </div>

                        {/* Header */}
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-foreground mb-2">
                                {t('Create your account')}
                            </h2>
                            <p className="text-muted-foreground">
                                {t('Start extracting data from documents in minutes')}
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium">
                                    {t('Full Name')}
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                                    <Input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder={t('John Doe')}
                                        className="pl-10 h-12"
                                        required
                                        autoComplete="name"
                                    />
                                </div>
                                {errors.name && (
                                    <p className="text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium">
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
                                        className="pl-10 h-12"
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium">
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
                                        className="pl-10 pr-10 h-12 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
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
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">{t('Password strength')}</span>
                                            <span className={`font-medium ${
                                                passwordStrength < 50 ? 'text-red-600' : 
                                                passwordStrength < 75 ? 'text-yellow-600' : 
                                                'text-green-600'
                                            }`}>
                                                {getPasswordStrengthText()}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${passwordStrength}%` }}
                                                className={`h-full ${getPasswordStrengthColor()}`}
                                            />
                                        </div>
                                    </div>
                                )}
                                {errors.password && (
                                    <p className="text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation" className="text-sm font-medium">
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
                                        className="pl-10 pr-10 h-12 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
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
                                {passwordConfirmation && password !== passwordConfirmation && (
                                    <p className="text-sm text-red-600">{t('Passwords do not match')}</p>
                                )}
                            </div>

                            {/* Terms */}
                            <div className="text-xs text-muted-foreground">
                                {t('By creating an account, you agree to our')}{' '}
                                <a href="#" className="text-primary hover:text-primary/80">
                                    {t('Terms of Service')}
                                </a>{' '}
                                {t('and')}{' '}
                                <a href="#" className="text-primary hover:text-primary/80">
                                    {t('Privacy Policy')}
                                </a>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={processing || password !== passwordConfirmation}
                                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold"
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
                        </form>

                        {/* Login Link */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-muted-foreground">
                                {t('Already have an account?')}{' '}
                                <button
                                    onClick={() => router.visit(`/${locale}/login`)}
                                    className="text-primary hover:text-primary/80 font-semibold"
                                >
                                    {t('Sign in')}
                                </button>
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="mt-8 mb-6 flex items-center">
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
            </div>
        </>
    );
}
