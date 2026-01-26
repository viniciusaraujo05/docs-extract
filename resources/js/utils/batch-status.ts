import { CheckCircle, Clock, Loader2, XCircle } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

export type BatchStatus = 'pending' | 'processing' | 'completed' | 'failed';

interface StatusConfig {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon: LucideIcon;
    color: string;
}

export function getStatusConfig(status: string, t: (key: string) => string): StatusConfig {
    const configs: Record<string, StatusConfig> = {
        pending: {
            label: t('Pending'),
            variant: 'secondary',
            icon: Clock,
            color: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400'
        },
        processing: {
            label: t('Processing'),
            variant: 'default',
            icon: Loader2,
            color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
        },
        completed: {
            label: t('Completed'),
            variant: 'default',
            icon: CheckCircle,
            color: 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
        },
        failed: {
            label: t('Failed'),
            variant: 'destructive',
            icon: XCircle,
            color: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
        },
    };

    return configs[status] || configs.pending;
}
