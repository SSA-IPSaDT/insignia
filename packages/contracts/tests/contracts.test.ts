import { describe, expect, test } from 'bun:test';

import {
    type ApiResponse,
    type HealthDTO,
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
});
