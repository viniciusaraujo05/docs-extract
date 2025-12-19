import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { cn, resolveUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BarChart3, FileText, Menu, Plus } from 'lucide-react';
import AppLogo from './app-logo';
import AppLogoIcon from './app-logo-icon';

const mainNavItems: NavItem[] = [
    {
        title: 'Relatórios',
        href: dashboard(),
        icon: BarChart3,
    },
    {
        title: 'Documentos',
        href: '/documents',
        icon: FileText,
    },
];

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();

    const isActive = (href: string | { url: string; method: string } | undefined) => {
        if (!href) return false;
        const hrefString = typeof href === 'string' ? href : href.url;
        const resolvedHref = resolveUrl(hrefString);
        return page.url === resolvedHref || page.url.startsWith(resolvedHref + '/');
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="border-b">
                <div className="mx-auto flex h-14 items-center px-4 lg:px-6">
                    {/* Mobile Menu */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="mr-2">
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-72 p-0">
                                <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
                                <SheetHeader className="border-b p-4">
                                    <Link href={dashboard()} className="flex items-center gap-2">
                                        <AppLogoIcon className="h-6 w-6" />
                                        <span className="font-semibold">DocExtract</span>
                                    </Link>
                                </SheetHeader>
                                <nav className="flex flex-col p-4 gap-1">
                                    {mainNavItems.map((item) => (
                                        <Link
                                            key={item.title}
                                            href={item.href}
                                            className={cn(
                                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                                isActive(item.href)
                                                    ? "bg-primary text-primary-foreground"
                                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            )}
                                        >
                                            {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                            {item.title}
                                        </Link>
                                    ))}
                                </nav>
                                <div className="absolute bottom-0 left-0 right-0 border-t p-4">
                                    <Link href="/documents/create">
                                        <Button className="w-full gap-2">
                                            <Plus className="h-4 w-4" />
                                            Novo Documento
                                        </Button>
                                    </Link>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Logo */}
                    <Link href={dashboard()} prefetch className="flex items-center gap-2 mr-6">
                        <AppLogo />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {mainNavItems.map((item) => (
                            <Link
                                key={item.title}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                                    isActive(item.href)
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                {item.icon && <Icon iconNode={item.icon} className="h-4 w-4" />}
                                {item.title}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Side */}
                    <div className="ml-auto flex items-center gap-2">
                        {/* New Document Button - Desktop */}
                        <Link href="/documents/create" className="hidden sm:block">
                            <Button size="sm" className="gap-2">
                                <Plus className="h-4 w-4" />
                                <span className="hidden md:inline">Novo Documento</span>
                            </Button>
                        </Link>

                        {/* User Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                            {getInitials(auth.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <UserMenuContent user={auth.user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Breadcrumbs */}
            {breadcrumbs.length > 1 && (
                <div className="border-b bg-muted/30">
                    <div className="mx-auto flex h-10 items-center px-4 lg:px-6">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </header>
    );
}
