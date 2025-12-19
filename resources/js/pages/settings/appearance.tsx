import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Appearance() {
    const { t } = useTranslation();
    const [locale, setLocale] = useState('pt');

    useEffect(() => {
        const savedLocale = localStorage.getItem('selected-locale') || 'pt';
        setLocale(savedLocale);
    }, []);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('Appearance settings'),
            href: `/${locale}/settings/appearance`,
        },
    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Appearance settings')} />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title={t('Appearance settings')}
                        description={t("Update your account's appearance settings")}
                    />
                    <AppearanceTabs />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
