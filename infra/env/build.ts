import { $ } from 'bun';

const isProd =
    process.argv.includes('--prod') || process.env.NODE_ENV === 'production';

console.log(
    `📦 Сборка @insignia/env [режим: ${isProd ? 'PRODUCTION' : 'DEVELOPMENT'}]...`,
);

const result = await Bun.build({
    entrypoints: ['./src/index.ts', './src/public.ts'],
    outdir: './dist',
    target: 'node',
    format: 'esm',
    minify: isProd,
    sourcemap: isProd ? 'none' : 'inline',
    external: ['zod'],
});

if (!result.success) {
    console.error('❌ Ошибка сборки бандла:');
    for (const log of result.logs) {
        console.error(log);
    }
    process.exit(1);
}

const tscResult = await $`bun x tsc -p tsconfig.build.json`.quiet();
if (tscResult.exitCode !== 0) {
    console.error('❌ Ошибка генерации типов (.d.ts)');
    process.exit(1);
}

console.log('✅ Сборка @insignia/env завершена успешно!');
