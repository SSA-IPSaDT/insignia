import { statSync } from 'node:fs';

const isProd =
    process.argv.includes('--prod') || process.env.NODE_ENV === 'production';

const startTime = performance.now();

console.log(
    `📦 Сборка @insignia/api [режим: ${isProd ? 'PRODUCTION' : 'DEVELOPMENT'}]...`,
);

const result = await Bun.build({
    entrypoints: ['./src/index.ts'],
    outdir: './dist',
    target: 'bun',
    format: 'esm',
    minify: isProd
        ? {
              whitespace: true,
              syntax: true,
              identifiers: true,
          }
        : false,
    treeShaking: true,
    sourcemap: isProd ? 'none' : 'inline',
    define: isProd
        ? {
              'process.env.NODE_ENV': JSON.stringify('production'),
          }
        : {},
    drop: isProd ? ['console.debug'] : [],
});

if (!result.success) {
    console.error('❌ Ошибка сборки Insignia API:');
    for (const log of result.logs) {
        console.error(log);
    }
    process.exit(1);
}

const duration = (performance.now() - startTime).toFixed(2);

console.log(`\n✨ Сборка успешно завершена за ${duration} ms!`);
console.log('📁 Сгенерированные артефакты:');

for (const output of result.outputs) {
    const size = (statSync(output.path).size / 1024).toFixed(2);
    const fileName = output.path.split('/').pop();
    console.log(`   • dist/${fileName} (${size} KB)`);
}

console.log(`\n🚀 Запуск сервиса: bun dist/index.js\n`);
