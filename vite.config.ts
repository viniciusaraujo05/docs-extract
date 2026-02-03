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
             * Wayfinder configurado para usar file cache em vez de Redis.
             * Isso permite builds sem depender de Redis rodando.
             */
            generate: true,
            php: 'php -d variables_order=EGPCS',
            config: {
                // Força uso de file cache para evitar dependência de Redis
                cache_driver: 'file',
            },
        }),
    ],
    esbuild: {
        jsx: 'automatic',
    },
});