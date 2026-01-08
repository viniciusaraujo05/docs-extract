import '../css/app.css';
import './i18n/config';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from './components/theme-provider';
import CookieConsent from './components/CookieConsent';

const appName = import.meta.env.VITE_APP_NAME || 'DOCSET';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        const locale = (props.initialPage.props.locale as string) || 'en';

        root.render(
            <StrictMode>
                <ThemeProvider defaultTheme="dark" storageKey="docset-theme">
                    <App {...props} />
                    <Toaster position="top-right" richColors closeButton />
                    <CookieConsent locale={locale} />
                </ThemeProvider>
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
