import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
    const isDev = mode === 'development';
    // Só gerar tipos se a variável GENERATE_TYPES estiver definida ou em build
    const shouldGenerateTypes = process.env.GENERATE_TYPES === 'true' || !isDev;

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
            // Wayfinder: gera tipos apenas em build ou quando GENERATE_TYPES=true
            ...(process.env.GENERATE_TYPES === 'true' || mode === 'build' ? [wayfinder()] : []),
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
            chunkSizeWarningLimit: 1000, // Aumentar limite para 1MB
            rollupOptions: {
                output: {
                    manualChunks(id) {
                        // Separar i18n em chunk próprio
                        if (id.includes('i18next') || id.includes('react-i18next')) {
                            return 'i18n';
                        }
                        // Separar bibliotecas de PDF em chunk próprio
                        if (id.includes('pdfjs-dist') || id.includes('react-pdf')) {
                            return 'pdf';
                        }
                        // Separar Recharts (gráficos) em chunk próprio
                        if (id.includes('recharts')) {
                            return 'charts';
                        }
                        // Separar node_modules grandes em vendor
                        if (id.includes('node_modules')) {
                            return 'vendor';
                        }
                    },
                },
            },
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
