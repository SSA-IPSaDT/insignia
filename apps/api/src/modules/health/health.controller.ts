import {
    createHealthErrorResponse,
    createHealthResponse,
    healthEndpoint,
    type HealthErrorCode,
    type SystemServices,
} from '@insignia/contracts/health';
import Elysia from 'elysia';

import { checkDatabase, checkRedis, checkStorage } from './health.service';

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
    async ({ status }) => {
        const [dbResult, redisResult, storageResult] = await Promise.allSettled(
            [checkDatabase(), checkRedis(), checkStorage()],
        );

        const services: SystemServices = {
            database:
                dbResult.status === 'fulfilled' && dbResult.value
                    ? 'healthy'
                    : 'unhealthy',
            redis:
                redisResult.status === 'fulfilled' && redisResult.value
                    ? 'healthy'
                    : 'unhealthy',
            storage:
                storageResult.status === 'fulfilled' && storageResult.value
                    ? 'healthy'
                    : 'unhealthy',
        };

        const failedServices = Object.entries(services)
            .filter(([_, statusService]) => statusService === 'unhealthy')
            .map(([name]) => name);

        if (failedServices.length === 0) {
            return createHealthResponse({
                status: 'ok',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                services,
            });
        }

        let errorCode: HealthErrorCode = 'SERVICES_UNAVAILABLE';

        if (failedServices.length === 1) {
            switch (failedServices[0]) {
                case 'database': {
                    errorCode = 'DATABASE_UNAVAILABLE';
                    break;
                }
                case 'redis': {
                    errorCode = 'CACHE_UNAVAILABLE';
                    break;
                }
                case 'storage': {
                    errorCode = 'STORAGE_UNAVAILABLE';
                    break;
                }
            }
        }

        return status(
            503,
            createHealthErrorResponse(
                errorCode,
                `Недоступны системные сервисы: ${failedServices.join(', ')}`,
                { services },
            ),
        );
    },
    healthEndpoint,
);
