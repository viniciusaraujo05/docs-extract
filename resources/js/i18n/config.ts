import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ptPTTranslations from './locales/pt-PT.json';
import ptBRTranslations from './locales/pt-BR.json';
import enTranslations from './locales/en.json';

// Detecta variante de português baseado no navegador
const detectPortugueseVariant = (): 'pt-PT' | 'pt-BR' => {
    if (typeof window === 'undefined') {
        return 'pt-PT';
    }

    const browserLang = navigator.language || navigator.languages?.[0] || 'pt-PT';
    
    // Se navegador especifica pt-BR explicitamente
    if (browserLang.toLowerCase().includes('br')) {
        return 'pt-BR';
    }
    
    // Default para Portugal
    return 'pt-PT';
};

if (typeof window !== 'undefined') {
    i18n.use(LanguageDetector);
}

i18n
    .use(initReactI18next)
    .init({
        resources: {
            pt: {
                translation: detectPortugueseVariant() === 'pt-BR' ? ptBRTranslations : ptPTTranslations,
            },
            en: {
                translation: enTranslations,
            },
        },
        fallbackLng: 'en',
        supportedLngs: ['pt', 'en'],
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'selected-locale',
        },
    });

// Expor função para trocar variante de português dinamicamente
export const setPortugueseVariant = (variant: 'pt-PT' | 'pt-BR') => {
    const translations = variant === 'pt-BR' ? ptBRTranslations : ptPTTranslations;
    i18n.addResourceBundle('pt', 'translation', translations, true, true);
    if (typeof window !== 'undefined') {
        localStorage.setItem('pt-variant', variant);
    }
};

// Restaurar variante salva se existir
if (typeof window !== 'undefined') {
    const savedVariant = localStorage.getItem('pt-variant') as 'pt-PT' | 'pt-BR' | null;
    if (savedVariant) {
        setPortugueseVariant(savedVariant);
    }
}

export default i18n;
