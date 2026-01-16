import { useTranslation } from '@/hooks/useTranslation';
import { AlertCircle } from 'lucide-react';

interface ErrorAlertProps {
    error: string;
    onDismiss?: () => void;
    showReload?: boolean;
}

export function ErrorAlert({ error, onDismiss, showReload = true }: ErrorAlertProps) {
    const { t } = useTranslation();

    return (
        <div className="mx-auto w-full max-w-2xl animate-in fade-in-50">
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-left text-destructive">
                <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                            {error}
                        </div>
                        <div className="mt-3 flex gap-2">
                            {onDismiss && (
                                <button
                                    onClick={onDismiss}
                                    className="text-xs underline hover:no-underline"
                                >
                                    {t('common.close')}
                                </button>
                            )}
                            {showReload && (
                                <button
                                    onClick={() => window.location.reload()}
                                    className="text-xs underline hover:no-underline"
                                >
                                    {t('common.reload_page')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
