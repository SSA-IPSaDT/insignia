import { $ } from 'bun';

const isProd =
    process.argv.includes('--prod') || process.env.NODE_ENV === 'production';

console.log(
    `📦 Сборка @insignia/sdk [режим: ${isProd ? 'PRODUCTION' : 'DEVELOPMENT'}]...`,
);

const result = await Bun.build({
    entrypoints: ['./src/index.ts'],
    outdir: './dist',
    target: 'browser',
    format: 'esm',
    minify: isProd,
    sourcemap: isProd ? 'none' : 'inline',
    external: [
        'ky',
        '@insignia/contracts',
        '@insignia/contracts/common',
        '@insignia/contracts/health',
        '@insignia/contracts/users',
        '@insignia/contracts/organizations',
        '@insignia/contracts/response',
    ],
});

if (!result.success) {
    console.error('❌ Ошибка сборки бандла SDK:');
    for (const log of result.logs) {
        console.error(log);
    }
    process.exit(1);
}

// Генерация деклараций типов (.d.ts)
const tscResult = await $`bun x tsc -p tsconfig.build.json`.quiet();
if (tscResult.exitCode !== 0) {
    console.error('❌ Ошибка генерации типов (.d.ts)');
    process.exit(1);
}

console.log('✅ Сборка @insignia/sdk завершена успешно!');
