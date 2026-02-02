import { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface CancelSubscriptionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CancelSubscriptionModal({ open, onOpenChange }: CancelSubscriptionModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleCancel = async () => {
        setIsLoading(true);
        try {
            const locale = document.documentElement.lang || 'en';
            const response = await fetch(`/api/subscription/cancel-subscription`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                onOpenChange(false);
                router.reload();
            } else {
                alert('Error cancelling subscription. Please try again.');
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            alert('Error cancelling subscription. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="mx-auto mb-4 w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                        <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <DialogTitle className="text-center">Cancel Subscription?</DialogTitle>
                    <DialogDescription className="text-center">
                        Are you sure you want to cancel your subscription? You will lose access to all premium features at the end of your billing period.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Keep Subscription
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleCancel}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Cancelling...
                            </>
                        ) : (
                            'Yes, Cancel'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
