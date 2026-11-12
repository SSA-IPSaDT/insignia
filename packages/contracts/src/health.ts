import { z } from 'zod';

import {
    createDomainEndpoint,
    createDomainErrors,
    createDomainResponse,
} from './response';

export const servicesStatusSchema = z
    .enum(['healthy', 'unhealthy'])
    .describe('Статус работоспособности сервиса');

export const systemServicesSchema = z
    .object({
        database: servicesStatusSchema.describe(
            'Статус подключения к PostgreSQL',
        ),
        redis: servicesStatusSchema
            .optional()
            .describe('Статус подключения к Redis'),
        storage: servicesStatusSchema
            .optional()
            .describe('Статус подключения к S3'),
    })
    .describe('Состояние инфраструктурных сервисов');

export type SystemServices = z.infer<typeof systemServicesSchema>;

export const healthDTOSchema = z
    .object({
        status: z.literal('ok').describe('Общий статус ядра сервиса'),
        timestamp: z.string().describe('Временная метка отчёта'),
        uptime: z.number().describe('Время работы сервиса в секундах'),
        services: systemServicesSchema.describe(
            'Диагностика системных сервисов',
        ),
    })
    .describe('Диагностический отчёт о здоровье сервиса');

export type HealthDTO = z.infer<typeof healthDTOSchema>;

/**
 * Фабрика ошибок системных сервисов и инфраструктуры по стандарту RFC 9457.
 */
export const healthErrors = createDomainErrors({
    domain: 'системных сервисов',
    messages: {
        SERVICES_UNAVAILABLE: 'Недоступны системные сервисы.',
        DATABASE_UNAVAILABLE: 'Недоступно подключение к базе данных.',
        CACHE_UNAVAILABLE:
            'Недоступно подключение к сервису кэширования (Redis).',
        STORAGE_UNAVAILABLE:
            'Недоступно подключение к объектному хранилищу (S3).',
    } as const,
    statuses: {
        SERVICES_UNAVAILABLE: 503,
        DATABASE_UNAVAILABLE: 503,
        CACHE_UNAVAILABLE: 503,
        STORAGE_UNAVAILABLE: 503,
    },
});

export const healthErrorCodeSchema = healthErrors.codeSchema;
export type HealthErrorCode = z.infer<typeof healthErrorCodeSchema>;
export const HEALTH_ERROR_MESSAGES = healthErrors.messages;
export const healthErrorResponseSchema = healthErrors.errorResponseSchema;
export type HealthErrorResponse = z.infer<typeof healthErrorResponseSchema>;
export const createHealthErrorResponse = healthErrors.createError;

/**
 * Конструктор успешного ответа проверки состояния сервиса (чистый HealthDTO).
 */
export const healthResponse = createDomainResponse(
    healthDTOSchema,
    'отчётом о доступности и состоянии сервиса',
);

export const healthResponseSchema = healthResponse.schema;
export type HealthResponse = HealthDTO;
export const createHealthResponse = healthResponse.create;
export const wrapHealthResponse = healthResponse.wrap;

/**
 * Контракт маршрута GET /health (системный мониторинг и проверка доступности).
 * Автоматически наследует стандартные серверные ошибки (500, 422).
 */
export const healthEndpoint = createDomainEndpoint({
    response: {
        200: healthResponseSchema,
        503: healthErrorResponseSchema,
    },
    detail: {
        tags: ['System'],
        summary: 'Комплексная проверка состояния сервиса и зависимостей',
        description:
            'Возвращает диагностический отчёт о здоровье системы и статусе подключений инфраструктурных сервисов',
    },
});

export const healthResponseSchemas = healthEndpoint.response;
