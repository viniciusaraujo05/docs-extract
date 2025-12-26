import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { useEffect } from 'react';

export default function SubscriptionSuccess({ session_id }: { session_id: string }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            router.visit('/subscription');
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
            <Head title="Subscription Success" />

            <Card className="max-w-md w-full mx-4">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-2xl">Subscription Successful!</CardTitle>
                    <CardDescription>
                        Your subscription has been activated successfully. You now have access to all premium features.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Session ID</p>
                        <p className="font-mono text-xs break-all">{session_id}</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Button onClick={() => router.visit(`/${locale}/subscription`)} className="w-full">
                            View Subscription Details
                        </Button>
                        <Button onClick={() => router.visit(`/${locale}/dashboard`)} variant="outline" className="w-full">
                            Go to Dashboard
                        </Button>
                    </div>

                    <p className="text-xs text-center text-muted-foreground">
                        Redirecting to subscription page in 5 seconds...
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
