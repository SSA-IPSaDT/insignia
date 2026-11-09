import type { ElysiaOpenAPIConfig } from '@elysia/openapi';

export type ScalarConfig = NonNullable<ElysiaOpenAPIConfig['scalar']>;

export const scalarConfig: ScalarConfig = {
    theme: 'purple',
    darkMode: true,
    layout: 'modern',
    showSidebar: true,
    searchHotKey: 'k',

    metaData: {
        title: 'Insignia API Reference',
        description: 'Интерактивная спецификация эндпоинтов Insignia',
    },
    defaultHttpClient: {
        targetKey: 'js',
        clientKey: 'axios',
    },
};
