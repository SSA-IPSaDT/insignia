import type { ElysiaOpenAPIConfig } from '@elysia/openapi';
import env from '@insignia/env';

export type OpenApiDocumentation = NonNullable<
    ElysiaOpenAPIConfig['documentation']
>;

export const documentation: OpenApiDocumentation = {
    info: {
        title: 'Insignia API',
        version: '0.1.0',
        description:
            'Интерактивная спецификация и контракты серверного API платформы Insignia',
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
            url: env.PUBLIC_API_URL,
            description: `${env.NODE_ENV} environment (${env.API_DOMAIN})`,
        },
    ],
    tags: [
        {
            name: 'System',
            description:
                'Системные проверки, healthcheck и мониторинг доступности зависимостей',
        },
        {
            name: 'Users',
            description: 'Операции с профилями пользователей',
        },
        {
            name: 'Users: Accounts',
            description: 'Управление внешними привязанными учетными записями',
        },
        {
            name: 'Users: Telegram',
            description: 'Интеграция с Telegram и синхронизация аккаунта',
        },
        {
            name: 'Organizations',
            description:
                'Управление организациями, поиск, создание и администрирование',
        },
        {
            name: 'Auth',
            description:
                'Регистрация, авторизация и управление токенами/сессиями',
        },
    ],
};
