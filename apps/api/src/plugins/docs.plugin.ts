import { openapi } from '@elysia/openapi';
import { apiEnv } from '@insignia/env';

export const docsPlugin = openapi({
    provider: 'scalar',
    path: '/docs',
    specPath: '/docs/json',

    documentation: {
        info: {
            title: 'Insignia API',
            version: '0.1.0',
            description: 'Документация серверного API платформы Insignia',
            contact: {
                name: 'Insignia Core Team',
                email: 'naylour@tuta.io',
                url: 'https://github.com/SSA-IPSaDT/insignia',
            },
            license: {
                name: 'UNLICENSED',
            },
        },
        servers: [
            {
                url: `http://${apiEnv.API_HOST}:${apiEnv.API_PORT}`,
                description: 'Локальное окружение разработки (Development)',
            },
            // {
            //     url: 'https://api.insignia.local',
            //     description: 'Боевой сервер (Production)',
            // },
        ],

        tags: [
            {
                name: 'System',
                description: 'Системные проверки, healthcheck и мониторинг',
            },
            {
                name: 'Auth',
                description: 'Регистрация, авторизация и управление токенами',
            },
            {
                name: 'Users',
                description: 'Операции с учетными записями пользователей',
            },
        ],

        components: {
            // securitySchemes: {
            //     bearerAuth: {
            //         type: 'http',
            //         scheme: 'bearer',
            //         bearerFormat: 'JWT',
            //         description:
            //             'Введите JWT access-токен в формате: Bearer <token>',
            //     },
            // },
        },
    },

    scalar: {
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
    },
});
