import { env, populateProcessEnv } from '@insignia/env';
import adapter from '@sveltejs/adapter-bun';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { mdsvex } from 'mdsvex';
import { defineConfig } from 'vite';

// Экспортируем все вычисленные переменные монорепозитория (PUBLIC_API_URL и др.) в process.env для SvelteKit
populateProcessEnv(env);

export default defineConfig({
    plugins: [
        tailwindcss(),
        sveltekit({
            compilerOptions: {
                // Force runes mode for the project, except for libraries. Can be removed in svelte 6.
                runes: ({ filename }) =>
                    filename.split(/[/\\]/).includes('node_modules')
                        ? undefined
                        : true,
                experimental: { async: true },
            },
            adapter: adapter({
                out: 'build',
                precompress: true,
                envPrefix: 'ADMIN_',

                serverOptions: {
                    port: env.ADMIN_PORT,
                    hostname: env.ADMIN_HOST,
                    reusePort: true,
                    idleTimeout: 30,
                    maxRequestBodySize: env.BODY_SIZE,
                },
            }),
            preprocess: [mdsvex({ extensions: ['.svx', '.md'] })],
            extensions: ['.svelte', '.svx', '.md'],
            experimental: { remoteFunctions: true, forkPreloads: true },
        }),
    ],
    server: {
        port: env.ADMIN_PORT,
        strictPort: true,
        host: env.ADMIN_HOST,
        fs: {
            allow: ['../..'],
        },
        watch: {
            ignored: [
                '**/node_modules/**',
                '**/.git/**',
                '**/logs/**',
                '**/.moon/**',
                '**/.svelte-kit/output/**',
                '**/build/**',
                '**/dist/**',
            ],
        },
    },
    preview: {
        port: env.ADMIN_PORT,
        strictPort: true,
        host: env.ADMIN_HOST,
    },
    build: {
        target: 'esnext',
        minify: 'oxc',
        cssMinify: 'lightningcss',
        sourcemap: false,
        reportCompressedSize: false,
        chunkSizeWarningLimit: 1000,
        rolldownOptions: {
            treeshake: true,
            output: {
                comments: false,
                minify: {
                    compress: {
                        dropDebugger: true,
                        unused: true,
                        joinVars: true,
                        sequences: true,
                    },
                    mangle: true,
                },
            },
        },
    },
});
