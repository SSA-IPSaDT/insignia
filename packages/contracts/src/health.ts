import { z } from 'zod';

import {
    createApiErrorResponseSchema,
    createApiResponseSchema,
} from './response';

export const healthErrorCodeSchema = z
    .enum(['SERVICES_UNAVAILABLE', 'DATABASE_UNAVAILABLE', 'CACHE_UNAVAILABLE'])
    .describe('Код системной ошибки недоступности инфраструктурных сервисов');

export type HealthErrorCode = z.infer<typeof healthErrorCodeSchema>;

export const servicesStatusSchema = z
    .enum(['healthy', 'unhealthy'])
    .describe('Статус работоспособности инфраструктурного сервиса');

export const systemServicesSchema = z
    .object({
        database: servicesStatusSchema.describe(
            'Статус подключения к основной базе данных PostgreSQL',
        ),
        redis: servicesStatusSchema
            .optional()
            .describe(
                'Статус подключения к кэшу и брокеру очередей Redis/Dragonfly',
            ),
        storage: servicesStatusSchema
            .optional()
            .describe('Статус подключения к объектному хранилищу S3/MinIO'),
    })
    .describe('Сводное состояние ключевых зависимостей инфраструктуры');

export type SystemServices = z.infer<typeof systemServicesSchema>;

export const healthDTOSchema = z
    .object({
        status: z
            .literal('ok')
            .describe('Общий статус работоспособности ядра сервиса'),
        timestamp: z
            .string()
            .describe(
                'Временная метка генерации отчёта в формате ISO-8601 (UTC)',
            ),
        uptime: z
            .number()
            .describe('Время непрерывной работы процесса API в секундах'),
        services: systemServicesSchema.describe(
            'Диагностика доступности критических системных сервисов',
        ),
    })
    .describe('Диагностический отчёт о здоровье и доступности сервиса API');

export type HealthDTO = z.infer<typeof healthDTOSchema>;

export const healthResponseSchema = createApiResponseSchema(
    healthDTOSchema,
).describe('Успешный ответ проверки доступности сервиса (HTTP 200 OK)');

export const healthErrorResponseSchema = createApiErrorResponseSchema(
    healthErrorCodeSchema,
).describe(
    'Ответ об ошибке при деградации системных сервисов (HTTP 503 Service Unavailable)',
);
