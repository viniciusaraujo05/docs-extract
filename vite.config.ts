import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            /**
             * Evita que o wayfinder gere tipos em produção (onde o build pode não ter Redis).
             * Define SKIP_WAYFINDER_REDIS=true para desativar manualmente.
             */
            generate:
                process.env.NODE_ENV !== 'production' ||
                process.env.SKIP_WAYFINDER_REDIS === 'true',
            config: {
                // Durante o build, usa o cache array para não depender do Redis real.
                cache_driver: process.env.WAYFINDER_CACHE_DRIVER || 'array',
            },
        }),
    ],
    esbuild: {
        jsx: 'automatic',
    },
});
