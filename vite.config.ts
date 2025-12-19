import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

const shouldGenerateWayfinder = process.env.WAYFINDER_GENERATE === 'true';

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
        ...(shouldGenerateWayfinder
            ? [
                  wayfinder({
                      /**
                       * Só gera arquivos do Wayfinder quando explicitamente habilitado
                       * (WAYFINDER_GENERATE=true). Isso evita dependência de Redis no build.
                       */
                      generate: true,
                      config: {
                          // Durante o build, usa o cache array para não depender do Redis real.
                          cache_driver:
                              process.env.WAYFINDER_CACHE_DRIVER || 'array',
                      },
                  }),
              ]
            : []),
    ],
    esbuild: {
        jsx: 'automatic',
    },
});
