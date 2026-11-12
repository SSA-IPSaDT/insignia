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
        allowedHosts: true,
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
        port: env.APP_PORT,
        strictPort: true,
        host: env.APP_HOST,
        allowedHosts: true,
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
