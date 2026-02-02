import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
    const isDev = mode === 'development';

    return {
        plugins: [
            laravel({
                input: [
                    'resources/css/app.css',
                    'resources/js/app.tsx',
                ],
                ssr: 'resources/js/ssr.tsx',
                refresh: true,
            }),
            react({
                babel: {
                    plugins: isDev ? [] : ['babel-plugin-react-compiler'],
                },
            }),
            tailwindcss(),
            // Wayfinder desabilitado em dev para melhor performance
            // Os tipos já foram gerados, não precisa regenerar a cada mudança
            ...(isDev ? [] : [wayfinder({
                php: 'php -d variables_order=EGPCS',
                config: {
                    cache_driver: 'file',
                },
            })]),
        ],
        esbuild: {
            jsx: 'automatic',
        },
        server: {
            host: '0.0.0.0',
            port: 5173,
            strictPort: false,
            hmr: {
                overlay: true,
                host: 'localhost',
            },
            watch: {
                usePolling: false,
                ignored: ['**/vendor/**', '**/node_modules/**', '**/storage/**', '**/public/**'],
            },
        },
        build: {
            sourcemap: isDev,
        },
        optimizeDeps: {
            include: [
                'react',
                'react-dom',
                'react/jsx-runtime',
                '@inertiajs/react',
                'lucide-react',
                'clsx',
                'tailwind-merge',
            ],
            exclude: ['@laravel/vite-plugin-wayfinder'],
        },
        resolve: {
            alias: {
                '@': '/resources/js',
            },
        },
    };
});
