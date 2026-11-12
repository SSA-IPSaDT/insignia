import type { ElysiaOpenAPIConfig } from '@elysia/openapi';
import env from '@insignia/env';

export type OpenApiDocumentation = NonNullable<
    ElysiaOpenAPIConfig['documentation']
>;

const devUrl =
    env.NODE_ENV === 'production'
        ? `http://localhost:${env.API_PORT}`
        : env.PUBLIC_API_URL;
const prodUrl = `https://${env.API_DOMAIN}`;

const devServer = {
    url: devUrl,
    description: `Development Environment (${devUrl})`,
};

const prodServer = {
    url: prodUrl,
    description: `Production Environment (${env.API_DOMAIN})`,
};

export const documentation: OpenApiDocumentation = {
    info: {
        title: 'Insignia API',
        version: '0.1.0',
        description: [
            'Интерактивная спецификация контракта серверного API платформы Insignia.',
            '',
            '### Формат ответов',
            '',
            '- **Успешные ответы (HTTP 2xx)**: возвращают целевые DTO ресурсов. Для пагинированных списков возвращается объект с коллекцией `items` и метаданными пагинации `meta`.',
            '- **Ошибки (HTTP 4xx / 5xx)**: стандартизированы по [RFC 9457 Problem Details](https://www.rfc-editor.org/rfc/rfc9457) (`Content-Type: application/problem+json`). Ответ содержит поля `status`, машиночитаемый `code`, ссылку на спецификацию `type`, описание `detail` и маршрут `instance`. Каталог типов ошибок доступен по адресу [/problems](/problems).',
            '- **Клиентский SDK (`@insignia/sdk`)**: инкапсулирует вызовы API в Result pattern (`{ success: true, data }` при успехе или `{ success: false, error }` при ошибке).',
        ].join('\n'),
        contact: {
            name: 'Insignia Core Team',
            email: 'naylour@tuta.io',
            url: 'https://github.com/SSA-IPSaDT/insignia',
        },
        license: {
            name: 'UNLICENSED',
        },
    },
    servers:
        env.NODE_ENV === 'production'
            ? [prodServer, devServer]
            : [devServer, prodServer],
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
