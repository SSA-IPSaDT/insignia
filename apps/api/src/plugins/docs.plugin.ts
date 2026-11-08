import { openapi } from '@elysia/openapi';
import {
    healthDTOSchema,
    healthErrorCodeSchema,
    healthErrorResponseSchema,
    healthResponseSchema,
    systemServicesSchema,
} from '@insignia/contracts/health';
import {
    apiErrorResponseSchema,
    commonErrorCodeSchema,
    validationErrorDetailsSchema,
    validationErrorResponseSchema,
    validationFieldsSchema,
} from '@insignia/contracts/response';
import {
    publicUserDtoSchema,
    telegramAccountBaseSchema,
    userBaseSchema,
    userProfileDtoSchema,
} from '@insignia/contracts/users';
import env from '@insignia/env';
import Elysia from 'elysia';

export const docsPlugin = new Elysia({ name: 'docs' })
    .model({
        CommonErrorCode: commonErrorCodeSchema,
        ApiErrorResponse: apiErrorResponseSchema,
        ValidationFields: validationFieldsSchema,
        ValidationErrorDetails: validationErrorDetailsSchema,
        ValidationErrorResponse: validationErrorResponseSchema,
        SystemServices: systemServicesSchema,
        HealthErrorCode: healthErrorCodeSchema,
        HealthDTO: healthDTOSchema,
        HealthResponse: healthResponseSchema,
        HealthErrorResponse: healthErrorResponseSchema,
        UserBase: userBaseSchema,
        PublicUserDTO: publicUserDtoSchema,
        UserProfileDTO: userProfileDtoSchema,
        TelegramAccountBase: telegramAccountBaseSchema,
    })

    .use(
        openapi({
            provider: 'scalar',
            path: '/docs',
            specPath: '/docs/json',

            documentation: {
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
                        description:
                            'Управление внешними привязанными учетными записями',
                    },
                    {
                        name: 'Users: Telegram',
                        description:
                            'Интеграция с Telegram и синхронизация аккаунта',
                    },
                    {
                        name: 'Auth',
                        description:
                            'Регистрация, авторизация и управление токенами/сессиями',
                    },
                ],
            },

            scalar: {
                theme: 'purple',
                darkMode: true,
                layout: 'modern',
                showSidebar: true,
                searchHotKey: 'k',

                metaData: {
                    title: 'Insignia API Reference',
                    description:
                        'Интерактивная спецификация эндпоинтов Insignia',
                },
                defaultHttpClient: {
                    targetKey: 'js',
                    clientKey: 'axios',
                },
            },
        }),
    )
    .as('global');
