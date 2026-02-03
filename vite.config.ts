import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';
import fg from 'fast-glob';

const pageFiles = fg.sync('resources/js/pages/**/*.tsx');

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.tsx',
                ...pageFiles,
            ],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        // @ts-ignore
        wayfinder({
            generate: true,
            php: 'php -d variables_order=EGPCS',
            config: {
                cache_driver: 'file',
            },
        }),
    ],
    esbuild: {
        jsx: 'automatic',
    },
});