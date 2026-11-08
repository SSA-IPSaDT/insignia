import {
    type HealthDTO,
    type HealthErrorCode,
    healthErrorResponseSchema,
    healthResponseSchema,
    type SystemServices,
} from '@insignia/contracts/health';
import {
    createErrorResponse,
    createSuccessResponse,
} from '@insignia/contracts/response';
import Elysia from 'elysia';

import { checkDatabase, checkRedis } from './health.service';

export const healthController = new Elysia({
    name: 'health',
    prefix: '/health',
    detail: {
        tags: ['System'],
        description:
            'Системный мониторинг и проверка доступности инфраструктуры',
    },
}).get(
    '',
    async ({ set }) => {
        const [dbResult, redisResult] = await Promise.allSettled([
            checkDatabase(),
            checkRedis(),
        ]);

        const services: SystemServices = {
            database:
                dbResult.status === 'fulfilled' && dbResult.value
                    ? 'healthy'
                    : 'unhealthy',
            redis:
                redisResult.status === 'fulfilled' && redisResult.value
                    ? 'healthy'
                    : 'unhealthy',
        };

        const failedServices = Object.entries(services)
            .filter(([_, status]) => status === 'unhealthy')
            .map(([name]) => name);

        if (failedServices.length === 0) {
            return createSuccessResponse<HealthDTO>({
                status: 'ok',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                services: services,
            });
        }

        set.status = 503;

        let errorCode: HealthErrorCode = 'SERVICES_UNAVAILABLE';

        if (failedServices.length === 1) {
            errorCode =
                failedServices[0] === 'database'
                    ? 'DATABASE_UNAVAILABLE'
                    : 'CACHE_UNAVAILABLE';
        }

        return createErrorResponse(
            errorCode,
            `Недоступны системные сервисы: ${failedServices.join(', ')}`,
            { services },
        );
    },
    {
        response: {
            200: healthResponseSchema,
            503: healthErrorResponseSchema,
        },
        detail: {
            tags: ['System'],
            summary: 'Комплексная проверка состояния сервиса и зависимостей',
        },
    },
);
