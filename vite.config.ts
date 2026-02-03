import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

// Recursively get all .tsx files from pages directory
function getPageFiles(dir: string): string[] {
    const files: string[] = [];
    const items = readdirSync(dir);
    for (const item of items) {
        const fullPath = join(dir, item);
        if (statSync(fullPath).isDirectory()) {
            files.push(...getPageFiles(fullPath));
        } else if (item.endsWith('.tsx')) {
            files.push(fullPath);
        }
    }
    return files;
}

const pageFiles = getPageFiles('resources/js/pages');

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
        wayfinder({
            /**
             * Wayfinder configurado para usar file cache em vez de Redis.
             * Isso permite builds sem depender de Redis rodando.
             */
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