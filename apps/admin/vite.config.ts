import { adminEnv } from '@insignia/env';
import adapter from '@sveltejs/adapter-bun';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { mdsvex } from 'mdsvex';
import { defineConfig } from 'vite';

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
                    port: adminEnv.ADMIN_PORT,
                    hostname: adminEnv.ADMIN_HOST,
                    reusePort: true,
                    idleTimeout: 30,
                    maxRequestBodySize: 1024 * 1024 * 25,
                },
            }),
            preprocess: [mdsvex({ extensions: ['.svx', '.md'] })],
            extensions: ['.svelte', '.svx', '.md'],
            experimental: { remoteFunctions: true, forkPreloads: true },
        }),
    ],
    server: {
        port: adminEnv.ADMIN_PORT,
        strictPort: true,
        host: adminEnv.ADMIN_HOST,
        fs: {
            allow: ['../..'],
        },
        watch: {
            ignored: [
                '**/node_modules/**',
                '**/.git/**',
                '**/logs/**',
                '**/.moon/**',
            ],
        },
    },
    preview: {
        port: adminEnv.ADMIN_PORT,
        strictPort: true,
        host: adminEnv.ADMIN_HOST,
    },
    build: {
        target: 'esnext',
        cssMinify: 'lightningcss',
        reportCompressedSize: false,
        chunkSizeWarningLimit: 1000,
    },
});
