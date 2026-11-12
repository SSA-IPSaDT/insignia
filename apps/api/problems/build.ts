import { mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PROBLEM_DOCUMENTS } from '@insignia/contracts/problems';
import { createRawSnippet } from 'svelte';
import { compile } from 'svelte/compiler';
import { render } from 'svelte/server';

const currentDir = dirname(fileURLToPath(import.meta.url));
const generatedDir = join(currentDir, 'generated');
mkdirSync(generatedDir, { recursive: true });

const compileSvelte = async (filePath: string) => {
    const fileBase = basename(filePath, '.svelte');
    const source = readFileSync(filePath, 'utf-8');
    const compiled = compile(source, {
        generate: 'server',
        filename: filePath,
    });

    const tempJsPath = join(generatedDir, `_${fileBase}.server.js`);
    writeFileSync(tempJsPath, compiled.js.code, 'utf-8');

    const mod = await import(tempJsPath);

    return {
        Component: mod.default,
        tempPath: tempJsPath,
    };
};

const buildProblems = async () => {
    const startTime = performance.now();

    const [layoutMod, problemMod, catalogMod] = await Promise.all([
        compileSvelte(join(currentDir, 'Layout.svelte')),
        compileSvelte(join(currentDir, 'Problem.svelte')),
        compileSvelte(join(currentDir, 'Catalog.svelte')),
    ]);

    const appHtml = readFileSync(join(currentDir, 'app.html'), 'utf-8');
    const appCss = readFileSync(join(currentDir, 'app.css'), 'utf-8');

    // Рендерим Layout.svelte с плейсхолдером для контента
    const layoutSnippet = createRawSnippet(() => ({
        render: () => '<!-- INSIGNIA_CONTENT -->',
    }));

    const layoutRender = render(layoutMod.Component, {
        props: {
            children: layoutSnippet,
        },
    });

    // Собираем базовый HTML-шаблон: app.html + app.css + Layout.svelte
    const baseTemplate = appHtml
        .replace('%insignia.styles%', appCss)
        .replace(/\s*%insignia\.head%/, '')
        .replace('%insignia.body%', layoutRender.body)
        .replace(/[ \t]+$/gm, '');

    writeFileSync(join(generatedDir, 'template.html'), baseTemplate, 'utf-8');

    // 1. Рендеринг тела каталога
    const catalogRenderResult = render(catalogMod.Component, {
        props: {
            problems: PROBLEM_DOCUMENTS.map((doc) => ({
                code: doc.code,
                slug: doc.slug,
                title: doc.title,
                status: doc.status,
                summary: doc.summary,
                categoryLabel: doc.categoryLabel,
            })),
        },
    });

    const catalogBody = catalogRenderResult.body;

    // 2. Рендеринг тел спецификаций каждой проблемы
    const problemEntries: Record<string, { title: string; body: string }> = {};

    for (const doc of PROBLEM_DOCUMENTS) {
        const renderResult = render(problemMod.Component, {
            props: {
                title: doc.title,
                code: doc.code,
                status: doc.status,
                slug: doc.slug,
                summary: doc.summary,
                description: doc.description,
                categoryLabel: doc.categoryLabel,
                causes: doc.causes || [],
                remediation: doc.remediation || [],
                architectureNotes: doc.architectureNotes || [],
                relatedEndpoints: doc.relatedEndpoints || [],
                examplePayload: doc.examplePayload,
                canonicalUrl: `/problems/${doc.slug}`,
            },
        });

        problemEntries[doc.slug] = {
            title: `${doc.title} (${doc.code}) • Insignia RFC 9457`,
            body: renderResult.body,
        };
    }

    // 3. Рендеринг тела 404
    const notFoundRenderResult = render(problemMod.Component, {
        props: {
            title: 'Тип проблемы не найден в спецификации',
            code: 'PROBLEM_NOT_FOUND',
            status: 404,
            slug: 'not-found',
            summary:
                'Запрошенный каноничный идентификатор типа проблемы отсутствует в официальном реестре API Insignia.',
            description:
                'Эта ошибка возникает, если переданный тип проблемы не зарегистрирован в текущей схеме API или был удален в новой версии.',
            causes: [
                'Возможно, была допущена опечатка в URL идентификатора проблемы.',
                'Спецификация этого типа ошибки была переименована или устарела в новой версии API.',
            ],
            remediation: [
                {
                    actor: 'client',
                    title: 'Проверить актуальный реестр ошибок',
                    description:
                        'Перейдите в каталог проблем API для поиска актуального типа ошибки.',
                },
                {
                    actor: 'developer',
                    title: 'Свериться с OpenAPI документацией',
                    description:
                        'Сверьтесь со спецификацией OpenAPI в Scalar по адресу /docs.',
                },
            ],
            architectureNotes: [
                'Согласно RFC 9457, если документация проблемы недоступна по URI, клиентам рекомендуется ориентироваться на стандартный HTTP статус-код.',
            ],
            canonicalUrl: '/problems/problem-not-found',
        },
    });

    const notFoundBody = notFoundRenderResult.body;

    // Очищаем временные серверные JS файлы
    try {
        unlinkSync(layoutMod.tempPath);
        unlinkSync(problemMod.tempPath);
        unlinkSync(catalogMod.tempPath);
    } catch {
        // Игнорируем
    }

    // 4. Генерация компактного TypeScript-файла (шаблон + словарь тел без дублирования CSS)
    const tsContent = `// Auto-generated by apps/api/problems/build.ts — DO NOT EDIT DIRECTLY

export const baseTemplate: string = ${JSON.stringify(baseTemplate)};

export const catalogBody: string = ${JSON.stringify(catalogBody)};

export const notFoundBody: string = ${JSON.stringify(notFoundBody)};

export const problemEntries: Record<string, { title: string; body: string }> = ${JSON.stringify(problemEntries, null, 4)};

export const renderProblemPage = (title: string, body: string): string => {
    return baseTemplate
        .replace('%insignia.title%', title)
        .replace('<!-- INSIGNIA_CONTENT -->', body);
};

export const catalogHtml: string = renderProblemPage(
    'Insignia API • Каталог проблем и ошибок (RFC 9457)',
    catalogBody,
);

export const notFoundHtml: string = renderProblemPage(
    'Тип проблемы не найден • Insignia RFC 9457',
    notFoundBody,
);

export const problemPages: Record<string, string> = Object.fromEntries(
    Object.entries(problemEntries).map(([slug, entry]) => [
        slug,
        renderProblemPage(entry.title, entry.body),
    ]),
);
`;

    writeFileSync(join(generatedDir, 'pages.ts'), tsContent, 'utf-8');

    Bun.spawnSync([
        'bun',
        'fmt',
        join(generatedDir, 'pages.ts'),
        join(generatedDir, 'template.html'),
    ]);

    const duration = (performance.now() - startTime).toFixed(2);
    console.log(
        `✨ [Problems] Сгенерировано ${PROBLEM_DOCUMENTS.length} страниц спецификаций и шаблон за ${duration} ms в apps/api/problems/generated/`,
    );
};

await buildProblems();
