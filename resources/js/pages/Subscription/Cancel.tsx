import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

export default function SubscriptionCancel() {
    const locale = document.documentElement.lang || 'en';
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
            <Head title="Subscription Cancelled" />

            <Card className="max-w-md w-full mx-4">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                        <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                    </div>
                    <CardTitle className="text-2xl">Subscription Cancelled</CardTitle>
                    <CardDescription>
                        Your subscription process was cancelled. No charges have been made to your account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <Button onClick={() => router.visit(`/${locale}`)} className="w-full">
                            View Plans Again
                        </Button>
                        <Button onClick={() => router.visit(`/${locale}/dashboard`)} variant="outline" className="w-full">
                            Go to Dashboard
                        </Button>
                    </div>

                    <p className="text-sm text-center text-muted-foreground">
                        If you have any questions, please contact our support team.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
