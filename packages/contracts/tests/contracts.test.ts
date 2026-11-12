import { describe, expect, test } from 'bun:test';

import {
    createHealthErrorResponse,
    createHealthResponse,
    type HealthDTO,
    healthEndpoint,
    healthErrorResponseSchema,
    healthResponseSchema,
} from '../src/index';

describe('Health Contracts Schema Validation', () => {
    test('healthResponseSchema parses valid health payload', () => {
        const payload: HealthDTO = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            services: {
                database: 'healthy',
                redis: 'healthy',
            },
        };

        const result = healthResponseSchema.safeParse(payload);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.status).toBe('ok');
            expect(result.data.services.database).toBe('healthy');
        }
    });

    test('healthResponseSchema rejects invalid service status', () => {
        const invalidPayload = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: 10,
            services: {
                database: 'broken_status',
            },
        };

        const result = healthResponseSchema.safeParse(invalidPayload);
        expect(result.success).toBe(false);
    });

    test('healthResponseSchema rejects missing timestamp', () => {
        const invalidPayload = {
            status: 'ok',
            uptime: 10,
            services: {
                database: 'healthy',
            },
        };

        const result = healthResponseSchema.safeParse(invalidPayload);
        expect(result.success).toBe(false);
    });

    test('healthErrorResponseSchema validates correct health error payload', () => {
        const payload = {
            type: '/problems/database-unavailable',
            title: 'Недоступно подключение к базе данных.',
            status: 503,
            detail: 'База данных не отвечает',
            instance: '/health',
            code: 'DATABASE_UNAVAILABLE',
            details: {
                services: {
                    database: 'unhealthy',
                },
            },
        };

        const result = healthErrorResponseSchema.safeParse(payload);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.code).toBe('DATABASE_UNAVAILABLE');
            expect(result.data.status).toBe(503);
        }
    });

    test('healthErrorResponseSchema rejects unknown health error codes', () => {
        const invalidPayload = {
            type: '/problems/unknown',
            title: 'Unknown error',
            status: 503,
            detail: 'Unknown error',
            instance: '/health',
            code: 'SOME_RANDOM_CODE',
        };

        const result = healthErrorResponseSchema.safeParse(invalidPayload);
        expect(result.success).toBe(false);
    });

    test('createHealthResponse formats valid payload with pure HealthDTO', () => {
        const res = createHealthResponse({
            status: 'ok',
            timestamp: '2026-11-09T03:00:00.000Z',
            uptime: 120,
            services: { database: 'healthy' },
        });

        expect(res.status).toBe('ok');
        expect(res.services.database).toBe('healthy');
    });

    test('createHealthErrorResponse formats valid RFC 9457 error payload with default message', () => {
        const res = createHealthErrorResponse('DATABASE_UNAVAILABLE');

        expect(res.code).toBe('DATABASE_UNAVAILABLE');
        expect(res.status).toBe(503);
        expect(res.detail).toBe('Недоступно подключение к базе данных.');
        expect(res.title).toBe('Недоступно подключение к базе данных.');
        expect(res.type).toBe('/problems/database-unavailable');
    });

    test('healthEndpoint defines 200, 422, 500, 501, 503 response schemas and detail tags', () => {
        expect(healthEndpoint.response[200]).toBe(healthResponseSchema);
        expect(healthEndpoint.response[422]).toBeDefined();
        expect(healthEndpoint.response[500]).toBeDefined();
        expect(healthEndpoint.response[501]).toBeDefined();
        expect(healthEndpoint.response[503]).toBe(healthErrorResponseSchema);
        expect(healthEndpoint.detail?.tags).toEqual(['System']);
    });
});
