import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { router } from '@inertiajs/react';
import { AlertTriangle, X, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface EmailVerificationBannerProps {
    email: string;
    locale?: string;
}

export function EmailVerificationBanner({ email, locale = 'en' }: EmailVerificationBannerProps) {
    const { t } = useTranslation();
    const [dismissed, setDismissed] = useState(false);
    const [sending, setSending] = useState(false);

    if (dismissed) return null;

    const handleResend = async () => {
        setSending(true);
        
        router.post(
            `/${locale}/email/verification-notification`,
            {},
            {
                onSuccess: () => {
                    toast.success(t('A new verification link has been sent to your email address.'));
                    setSending(false);
                },
                onError: () => {
                    toast.error(t('Error sending verification email'));
                    setSending(false);
                },
            }
        );
    };

    return (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                        {t('onboarding.email_verify_banner')}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                            <Mail className="inline h-3 w-3 mr-1" />
                            {email}
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResend}
                            disabled={sending}
                            className="text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                        >
                            {sending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : null}
                            {t('onboarding.resend_verification')}
                        </Button>
                    </div>
                </div>
                <button
                    onClick={() => setDismissed(true)}
                    className="text-amber-500 hover:text-amber-700 dark:hover:text-amber-300"
                    aria-label="Dismiss"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}
