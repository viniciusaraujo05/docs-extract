import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
} from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import { FileText, BarChart3, Code2 } from 'lucide-react';
import AppLogo from './app-logo';
import { resolveUrl } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

export function AppSidebar() {
    const { t } = useTranslation();
    const page = usePage();
    const [locale, setLocale] = useState('pt');

    useEffect(() => {
        const savedLocale = localStorage.getItem('selected-locale') || 'pt';
        setLocale(savedLocale);
    }, []);
    
    const navItems = [
        {
            title: t('Reports'),
            href: `/${locale}/dashboard`,
            icon: BarChart3,
        },
        {
            title: t('Documents'),
            href: `/${locale}/documents`,
            icon: FileText,
        },
        {
            title: t('API'),
            href: `/${locale}/api`,
            icon: Code2,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={`/${locale}/dashboard`} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup className="px-2 py-4">
                    <SidebarMenu className="gap-2">
                        {navItems.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={page.url.startsWith(resolveUrl(item.href))}
                                    tooltip={{ children: item.title }}
                                    className="h-10 px-3"
                                >
                                    <Link href={item.href} prefetch>
                                        <item.icon className="h-5 w-5" />
                                        <span className="font-medium">{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
