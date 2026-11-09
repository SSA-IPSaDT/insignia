import { describe, expect, test } from 'bun:test';

import {
    type ApiResponse,
    createHealthErrorResponse,
    createHealthResponse,
    type HealthDTO,
    healthEndpoint,
    healthErrorResponseSchema,
    healthResponseSchema,
} from '../src/index';

describe('Health Contracts Schema Validation', () => {
    test('healthResponseSchema parses valid health payload', () => {
        const payload: ApiResponse<HealthDTO> = {
            success: true,
            data: {
                status: 'ok',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                services: {
                    database: 'healthy',
                    redis: 'healthy',
                },
            },
        };

        const result = healthResponseSchema.safeParse(payload);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.data.status).toBe('ok');
            expect(result.data.data.services.database).toBe('healthy');
        }
    });

    test('healthResponseSchema rejects invalid service status', () => {
        const invalidPayload = {
            success: true,
            data: {
                status: 'ok',
                timestamp: new Date().toISOString(),
                uptime: 10,
                services: {
                    database: 'broken_status',
                },
            },
        };

        const result = healthResponseSchema.safeParse(invalidPayload);
        expect(result.success).toBe(false);
    });

    test('healthResponseSchema rejects missing timestamp', () => {
        const invalidPayload = {
            success: true,
            data: {
                status: 'ok',
                uptime: 10,
                services: {
                    database: 'healthy',
                },
            },
        };

        const result = healthResponseSchema.safeParse(invalidPayload);
        expect(result.success).toBe(false);
    });

    test('healthErrorResponseSchema validates correct health error payload', () => {
        const payload = {
            success: false,
            error: {
                code: 'DATABASE_UNAVAILABLE',
                message: 'База данных не отвечает',
                details: {
                    services: {
                        database: 'unhealthy',
                    },
                },
            },
        };

        const result = healthErrorResponseSchema.safeParse(payload);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.error.code).toBe('DATABASE_UNAVAILABLE');
        }
    });

    test('healthErrorResponseSchema rejects unknown health error codes', () => {
        const invalidPayload = {
            success: false,
            error: {
                code: 'SOME_RANDOM_CODE',
                message: 'Unknown error',
            },
        };

        const result = healthErrorResponseSchema.safeParse(invalidPayload);
        expect(result.success).toBe(false);
    });

    test('createHealthResponse formats valid payload with success: true', () => {
        const res = createHealthResponse({
            status: 'ok',
            timestamp: '2026-11-09T03:00:00.000Z',
            uptime: 120,
            services: { database: 'healthy' },
        });

        expect(res.success).toBe(true);
        expect(res.data.status).toBe('ok');
        expect(res.data.services.database).toBe('healthy');
    });

    test('createHealthErrorResponse formats valid error payload with default message', () => {
        const res = createHealthErrorResponse('DATABASE_UNAVAILABLE');

        expect(res.success).toBe(false);
        expect(res.error.code).toBe('DATABASE_UNAVAILABLE');
        expect(res.error.message).toBe('Недоступно подключение к базе данных.');
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
