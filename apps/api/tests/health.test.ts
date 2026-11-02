import { describe, expect, it, spyOn } from 'bun:test';

import {
    type ApiResponse,
    type HealthDTO,
    healthErrorResponseSchema,
    healthResponseSchema,
    type SystemServices,
} from '@insignia/contracts';

import { app } from '#/app';
import * as healthService from '#modules/health/health.service';

describe('System Health API', () => {
    it('GET /health returns 200 with healthy services status', async () => {
        const response = await app.handle(
            new Request('http://localhost/health'),
        );

        expect(response.status).toBe(200);

        const raw = await response.json();
        const body: ApiResponse<HealthDTO> = healthResponseSchema.parse(raw);

        expect(body.success).toBe(true);
        expect(body.data.status).toBe('ok');
        expect(body.data.uptime).toBeGreaterThanOrEqual(0);
        expect(typeof body.data.timestamp).toBe('string');
        expect(body.data.services).toEqual({
            database: 'healthy',
            redis: 'healthy',
        });
    });

    it('GET /health returns 503 with DATABASE_UNAVAILABLE when database is down', async () => {
        const dbSpy = spyOn(healthService, 'checkDatabase').mockResolvedValue(
            false,
        );

        const response = await app.handle(
            new Request('http://localhost/health'),
        );

        expect(response.status).toBe(503);

        const raw = await response.json();
        const body = healthErrorResponseSchema.parse(raw);

        expect(body.success).toBe(false);
        expect(body.error.code).toBe('DATABASE_UNAVAILABLE');

        const details = body.error.details as { services: SystemServices };
        expect(details.services.database).toBe('unhealthy');
        expect(details.services.redis).toBe('healthy');

        dbSpy.mockRestore();
    });

    it('GET /health returns 503 with SERVICES_UNAVAILABLE when multiple services fail', async () => {
        const dbSpy = spyOn(healthService, 'checkDatabase').mockResolvedValue(
            false,
        );
        const redisSpy = spyOn(healthService, 'checkRedis').mockResolvedValue(
            false,
        );

        const response = await app.handle(
            new Request('http://localhost/health'),
        );

        expect(response.status).toBe(503);

        const raw = await response.json();
        const body = healthErrorResponseSchema.parse(raw);

        expect(body.success).toBe(false);
        expect(body.error.code).toBe('SERVICES_UNAVAILABLE');

        const details = body.error.details as { services: SystemServices };
        expect(details.services.database).toBe('unhealthy');
        expect(details.services.redis).toBe('unhealthy');

        dbSpy.mockRestore();
        redisSpy.mockRestore();
    });
});
