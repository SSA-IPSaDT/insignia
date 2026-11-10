import { env, populateProcessEnv } from '@insignia/env';
import adapter from '@sveltejs/adapter-bun';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { mdsvex } from 'mdsvex';
import { defineConfig } from 'vite';

populateProcessEnv(env);

export default defineConfig({
    plugins: [
        tailwindcss(),
        sveltekit({
            compilerOptions: {
                runes: ({ filename }) =>
                    filename.split(/[/\\]/).includes('node_modules')
                        ? undefined
                        : true,
                experimental: { async: true },
            },

            adapter: adapter({
                out: 'build',
                precompress: true,
                envPrefix: 'APP_',

                serverOptions: {
                    port: env.APP_PORT,
                    hostname: env.APP_HOST,
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
        port: env.APP_PORT,
        strictPort: true,
        host: env.APP_HOST,
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
        port: env.APP_PORT,
        strictPort: true,
        host: env.APP_HOST,
    },
    build: {
        target: 'esnext',
        cssMinify: 'lightningcss',
        reportCompressedSize: false,
        chunkSizeWarningLimit: 1000,
    },
});
