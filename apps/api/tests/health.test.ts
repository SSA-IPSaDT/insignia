import { describe, expect, it, spyOn } from 'bun:test';

import {
    type HealthDTO,
    healthErrorResponseSchema,
    healthResponseSchema,
    type SystemServices,
} from '@insignia/contracts';
import env from '@insignia/env';

import { app } from '#/app';
import * as healthService from '#modules/health/health.service';

describe('System Health API', () => {
    it('GET /health returns 200 with healthy services status', async () => {
        const response = await app.handle(
            new Request('http://localhost/health'),
        );

        expect(response.status).toBe(200);

        const raw = await response.json();
        const body: HealthDTO = healthResponseSchema.parse(raw);

        expect(body.status).toBe('ok');
        expect(body.uptime).toBeGreaterThanOrEqual(0);
        expect(typeof body.timestamp).toBe('string');
        expect(body.services).toEqual({
            database: 'healthy',
            redis: 'healthy',
            storage: 'healthy',
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

        expect(body.code).toBe('DATABASE_UNAVAILABLE');
        expect(body.status).toBe(503);
        expect(body.type).toBe(
            `${env.PUBLIC_API_URL.replace(/\/+$/, '')}/problems/database-unavailable`,
        );
        expect(body.instance).toBe('/health');

        const details = body.details as { services: SystemServices };
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

        expect(body.code).toBe('SERVICES_UNAVAILABLE');
        expect(body.status).toBe(503);
        expect(body.type).toBe(
            `${env.PUBLIC_API_URL.replace(/\/+$/, '')}/problems/services-unavailable`,
        );

        const details = body.details as { services: SystemServices };
        expect(details.services.database).toBe('unhealthy');
        expect(details.services.redis).toBe('unhealthy');

        dbSpy.mockRestore();
        redisSpy.mockRestore();
    });

    it('GET /docs/json includes /health with 200, 422, 500, and 503 response schemas', async () => {
        const response = await app.handle(
            new Request('http://localhost/docs/json'),
        );

        expect(response.status).toBe(200);

        const schema = (await response.json()) as {
            paths: Record<
                string,
                { get: { responses: Record<string, unknown> } }
            >;
        };

        const healthEndpointDoc = schema.paths['/health'];
        expect(healthEndpointDoc).toBeDefined();
        expect(healthEndpointDoc?.get).toBeDefined();
        expect(healthEndpointDoc?.get?.responses['200']).toBeDefined();
        expect(healthEndpointDoc?.get?.responses['422']).toBeDefined();
        expect(healthEndpointDoc?.get?.responses['500']).toBeDefined();
        expect(healthEndpointDoc?.get?.responses['503']).toBeDefined();
    });
});
