import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Flag from 'react-world-flags';
import { toast } from 'sonner';
import { router } from '@inertiajs/react';
import { setPortugueseVariant } from '@/i18n/config';

export default function Language() {
    const { t, i18n } = useTranslation();
    const [locale, setLocale] = useState('pt');
    const [currentLocale, setCurrentLocale] = useState(() => {
        const saved = localStorage.getItem('selected-locale');
        return saved || 'pt';
    });
    
    const [ptVariant, setPtVariant] = useState<'pt-PT' | 'pt-BR'>(() => {
        const saved = localStorage.getItem('pt-variant') as 'pt-PT' | 'pt-BR' | null;
        return saved || 'pt-PT';
    });

    useEffect(() => {
        const savedLocale = localStorage.getItem('selected-locale') || 'pt';
        setLocale(savedLocale);
        setCurrentLocale(savedLocale);
    }, []);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('Language settings'),
            href: `/${locale}/settings/language`,
        },
    ];

    const changeLanguage = async (newLocale: string, variant?: 'pt-PT' | 'pt-BR') => {
        // Se mudando variante de português
        if (newLocale === 'pt' && variant && variant !== ptVariant) {
            setPortugueseVariant(variant);
            setPtVariant(variant);
            localStorage.setItem('pt-variant', variant);
            toast.success(t('Language variant changed successfully'));
            return;
        }
        
        if (newLocale === currentLocale && (!variant || variant === ptVariant)) return;
        
        try {
            localStorage.setItem('selected-locale', newLocale);
            setCurrentLocale(newLocale);
            setLocale(newLocale);
            
            await i18n.changeLanguage(newLocale);
            
            // Update backend
            const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
            
            const response = await fetch('/api/locale/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({ locale: newLocale }),
            });

            if (!response.ok) {
                throw new Error('Failed to update language');
            }

            const result = await response.json();
            toast.success(result.message || t('Language changed successfully'));
            
            // Update URL with new locale and reload
            const currentPath = window.location.pathname;
            const pathParts = currentPath.split('/').filter(p => p);
            
            // Replace old locale with new locale in URL
            if (pathParts.length > 0 && ['pt', 'en'].includes(pathParts[0])) {
                pathParts[0] = newLocale;
            } else {
                pathParts.unshift(newLocale);
            }
            
            const newPath = '/' + pathParts.join('/');
            router.visit(newPath, { preserveState: false });
        } catch (error) {
            console.error('Error changing language:', error);
            toast.error(t('Error changing language'));
        }
    };

    const getSelectedValue = () => {
        if (currentLocale === 'en') return 'en';
        if (currentLocale === 'pt') {
            return ptVariant === 'pt-BR' ? 'pt-BR' : 'pt-PT';
        }
        return 'pt-PT';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Language settings')} />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title={t('Language settings')}
                        description={t('Choose your preferred language and regional variant')}
                    />
                    
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{t('Interface Language')}</CardTitle>
                            <CardDescription>
                                {t('Select the language you want to use throughout the application')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup
                                value={getSelectedValue()}
                                onValueChange={(value) => {
                                    if (value === 'en') {
                                        changeLanguage('en');
                                    } else if (value === 'pt-PT') {
                                        changeLanguage('pt', 'pt-PT');
                                    } else if (value === 'pt-BR') {
                                        changeLanguage('pt', 'pt-BR');
                                    }
                                }}
                                className="space-y-3"
                            >
                                <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                                    <RadioGroupItem value="pt-PT" id="pt-PT" />
                                    <Label htmlFor="pt-PT" className="flex items-center gap-3 cursor-pointer flex-1">
                                        <Flag code="pt" className="w-8 h-5 rounded shadow-sm" />
                                        <div>
                                            <div className="font-medium">Português (Portugal)</div>
                                            <div className="text-sm text-muted-foreground">Portuguese - Portugal</div>
                                        </div>
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                                    <RadioGroupItem value="pt-BR" id="pt-BR" />
                                    <Label htmlFor="pt-BR" className="flex items-center gap-3 cursor-pointer flex-1">
                                        <Flag code="br" className="w-8 h-5 rounded shadow-sm" />
                                        <div>
                                            <div className="font-medium">Português (Brasil)</div>
                                            <div className="text-sm text-muted-foreground">Portuguese - Brazil</div>
                                        </div>
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                                    <RadioGroupItem value="en" id="en" />
                                    <Label htmlFor="en" className="flex items-center gap-3 cursor-pointer flex-1">
                                        <Flag code="gb" className="w-8 h-5 rounded shadow-sm" />
                                        <div>
                                            <div className="font-medium">English</div>
                                            <div className="text-sm text-muted-foreground">English - International</div>
                                        </div>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </CardContent>
                    </Card>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
