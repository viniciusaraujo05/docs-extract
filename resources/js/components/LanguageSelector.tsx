import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import Flag from 'react-world-flags';
import { router } from '@inertiajs/react';

export function LanguageSelector() {
    const { i18n, t } = useTranslation();
    const [currentLocale, setCurrentLocale] = useState(() => {
        // Get from localStorage first, then from i18n
        const saved = localStorage.getItem('selected-locale');
        return saved || i18n.language || 'pt';
    });

    // Sync with i18n on mount
    useEffect(() => {
        if (i18n.language && !localStorage.getItem('selected-locale')) {
            setCurrentLocale(i18n.language);
            localStorage.setItem('selected-locale', i18n.language);
        }
    }, [i18n.language]);

    const changeLanguage = async (locale: string) => {
        if (locale === currentLocale) return; // Don't change if already selected
        
        try {
            // Save to localStorage immediately
            localStorage.setItem('selected-locale', locale);
            setCurrentLocale(locale);
            
            // Update i18n
            await i18n.changeLanguage(locale);
            
            // Update backend
            const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
            
            const response = await fetch('/api/locale/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({ locale }),
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
                pathParts[0] = locale;
            } else {
                // If no locale in URL, add it
                pathParts.unshift(locale);
            }
            
            const newPath = '/' + pathParts.join('/');
            router.visit(newPath, { preserveState: false });
        } catch (error) {
            console.error('Error changing language:', error);
            toast.error(t('Error'));
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" title={t('Change Language')}>
                    {currentLocale === 'pt' ? (
                        <Flag code="br" className="w-6 h-4" />
                    ) : (
                        <Flag code="gb" className="w-6 h-4" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={() => changeLanguage('pt')}
                    className={currentLocale === 'pt' ? 'bg-accent' : ''}
                >
                    <span className="flex items-center gap-2">
                        <Flag code="br" className="w-5 h-3" />
                        <span>Português</span>
                    </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => changeLanguage('en')}
                    className={currentLocale === 'en' ? 'bg-accent' : ''}
                >
                    <span className="flex items-center gap-2">
                        <Flag code="gb" className="w-5 h-3" />
                        <span>English</span>
                    </span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
