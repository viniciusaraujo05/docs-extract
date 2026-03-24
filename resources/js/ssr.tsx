import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ReactDOMServer from 'react-dom/server';
import { ThemeProvider } from './components/theme-provider';
import i18n from './i18n/config';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        title: (title) => (title ? `${title} - ${appName}` : appName),
        resolve: (name) =>
            resolvePageComponent(
                `./pages/${name}.tsx`,
                import.meta.glob('./pages/**/*.tsx'),
            ),
        setup: ({ App, props }) => {
            const locale = (props.initialPage.props.locale as string) || 'en';
            i18n.changeLanguage(locale);

            return (
                <ThemeProvider defaultTheme="light" storageKey="docset-theme">
                    <App {...props} />
                </ThemeProvider>
            );
        },
    }),
);
