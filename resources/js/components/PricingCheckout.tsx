import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PricingCheckoutProps {
    priceId: string;
    planName: string;
    ctaText: string;
    locale: string;
    isAuthenticated: boolean;
    variant?: 'default' | 'outline';
    className?: string;
}

export function PricingCheckout({
    priceId,
    planName,
    ctaText,
    locale,
    isAuthenticated,
    variant = 'outline',
    className = 'w-full',
}: PricingCheckoutProps) {
    const [loading, setLoading] = useState(false);

    const handleCheckout = () => {
        if (!isAuthenticated) {
            router.visit(`/${locale}/register`);
            return;
        }

        if (!priceId) {
            toast.error('Price ID not configured for this plan');
            return;
        }

        router.visit(`/${locale}/subscription/checkout`, {
            data: {
                price_id: priceId,
                plan_name: planName
            }
        });
    };

    return (
        <Button onClick={handleCheckout} variant={variant} className={className} disabled={loading}>
            {loading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                </>
            ) : (
                ctaText
            )}
        </Button>
    );
}
