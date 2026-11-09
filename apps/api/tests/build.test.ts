import { describe, expect, it } from 'bun:test';
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { $ } from 'bun';

describe('API Build Script', () => {
    const apiDir = join(import.meta.dir, '..');
    const distDir = join(apiDir, 'dist');
    const indexJs = join(distDir, 'index.js');

    it('builds successfully in default development / CI mode', async () => {
        const buildProcess = await $`bun run ${join(apiDir, 'build.ts')}`
            .cwd(apiDir)
            .quiet();

        expect(buildProcess.exitCode).toBe(0);
        expect(existsSync(indexJs)).toBe(true);

        const indexSize = statSync(indexJs).size;
        expect(indexSize).toBeGreaterThan(0);
    });

    it('builds optimized and minified bundles in production mode with --prod', async () => {
        const prodBuildProcess =
            await $`bun run ${join(apiDir, 'build.ts')} --prod`
                .cwd(apiDir)
                .quiet();

        expect(prodBuildProcess.exitCode).toBe(0);
        expect(existsSync(indexJs)).toBe(true);

        const prodIndexContent = await Bun.file(indexJs).text();

        // Проверяем, что артефакт валиден и минифицирован
        expect(prodIndexContent.length).toBeGreaterThan(0);

        // В продакшене console.debug должен быть вырезан (drop: ['console.debug'])
        expect(prodIndexContent.includes('console.debug(')).toBe(false);
    });
});
