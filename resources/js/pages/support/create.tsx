import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { LifeBuoy, Loader2, Send } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Help & Support',
        href: '/support',
    },
];

export default function SupportCreate() {
    const { t, i18n } = useTranslation();
    const { flash } = usePage().props as any;
    
    const { data, setData, post, processing, errors, reset } = useForm({
        subject: '',
        message: '',
        attachments: [] as File[],
    });

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
            reset();
        }
    }, [flash]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/api/support', {
            onSuccess: () => {
                reset();
                // Toast handled by useEffect watching flash
            },
        });
    };

    const subjectOptions = [
        'General Inquiry',
        'Technical Issue',
        'Billing',
        'Feature Request',
        'Other',
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Help & Support')} />

            <div className="flex h-full flex-col p-4 md:p-6 space-y-6 max-w-2xl mx-auto w-full">
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight">{t('Contact Support')}</h2>
                    <p className="text-muted-foreground">{t('Fill out the form below and we will get back to you as soon as possible.')}</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <LifeBuoy className="h-5 w-5 text-primary" />
                            {t('How can we help?')}
                        </CardTitle>
                        <CardDescription>
                            {t('Get in touch with our team')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="subject">{t('Subject')}</Label>
                                <Select 
                                    value={data.subject} 
                                    onValueChange={(value) => setData('subject', value)}
                                >
                                    <SelectTrigger id="subject" className={errors.subject ? 'border-destructive' : ''}>
                                        <SelectValue placeholder={t('Select a subject')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjectOptions.map((option) => (
                                            <SelectItem key={option} value={option}>
                                                {t(option)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.subject && (
                                    <p className="text-sm text-destructive">{errors.subject}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">{t('Message')}</Label>
                                <Textarea
                                    id="message"
                                    placeholder={t('Describe your issue or question...')}
                                    className={`min-h-[150px] ${errors.message ? 'border-destructive' : ''}`}
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                />
                                {errors.message && (
                                    <p className="text-sm text-destructive">{errors.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="attachments">{t('Attachments')} <span className="text-xs text-muted-foreground ml-1">({t('Images (max 5MB)')})</span></Label>
                                <Input 
                                    id="attachments" 
                                    type="file" 
                                    multiple 
                                    accept="image/*"
                                    className="cursor-pointer"
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            setData('attachments', Array.from(e.target.files));
                                        }
                                    }}
                                />
                                {errors.attachments && (
                                    <p className="text-sm text-destructive">{errors.attachments}</p>
                                )}
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing} className="w-full md:w-auto">
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {t('Sending...')}
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-4 w-4" />
                                            {t('Send Message')}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-center text-sm text-muted-foreground mt-8">
                    {t('Or email us directly at')} <a href="mailto:help@docset.app" className="font-medium text-primary hover:underline">help@docset.app</a>
                </p>
            </div>
        </AppLayout>
    );
}
