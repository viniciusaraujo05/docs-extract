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
import { setPortugueseVariant } from '@/i18n/config';

export function LanguageSelector() {
    const { i18n, t } = useTranslation();
    const [currentLocale, setCurrentLocale] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('selected-locale');
            return saved || i18n.language || 'pt';
        }
        return i18n.language || 'pt';
    });
    
    const [ptVariant, setPtVariant] = useState<'pt-PT' | 'pt-BR'>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('pt-variant') as 'pt-PT' | 'pt-BR' | null;
            return saved || 'pt-PT';
        }
        return 'pt-PT';
    });

    useEffect(() => {
        if (i18n.language && !localStorage.getItem('selected-locale')) {
            setCurrentLocale(i18n.language);
            localStorage.setItem('selected-locale', i18n.language);
        }
    }, [i18n.language]);

    const changeLanguage = async (locale: string, variant?: 'pt-PT' | 'pt-BR') => {
        // Se mudando variante de português
        if (locale === 'pt' && variant && variant !== ptVariant) {
            setPortugueseVariant(variant);
            setPtVariant(variant);
            toast.success(t('Language changed successfully'));
            return;
        }
        
        if (locale === currentLocale) return;
        
        try {
            localStorage.setItem('selected-locale', locale);
            setCurrentLocale(locale);
            
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
                        <Flag code={ptVariant === 'pt-BR' ? 'br' : 'pt'} className="w-6 h-4" />
                    ) : (
                        <Flag code="gb" className="w-6 h-4" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={() => changeLanguage('pt', 'pt-PT')}
                    className={currentLocale === 'pt' && ptVariant === 'pt-PT' ? 'bg-accent' : ''}
                >
                    <span className="flex items-center gap-2">
                        <Flag code="pt" className="w-5 h-3" />
                        <span>Português (Portugal)</span>
                    </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => changeLanguage('pt', 'pt-BR')}
                    className={currentLocale === 'pt' && ptVariant === 'pt-BR' ? 'bg-accent' : ''}
                >
                    <span className="flex items-center gap-2">
                        <Flag code="br" className="w-5 h-3" />
                        <span>Português (Brasil)</span>
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
