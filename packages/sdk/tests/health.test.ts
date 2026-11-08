import { describe, expect, test } from 'bun:test';

import type { ApiErrorResponse, ApiResponse } from '@insignia/contracts/common';
import type { HealthDTO } from '@insignia/contracts/health';

import { createInsigniaClient } from '#';

describe('SDK HealthModule (Result Pattern)', () => {
    test('successfully fetches and returns ApiResponse<HealthDTO>', async () => {
        const mockHealthData: HealthDTO = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: 42.5,
            services: {
                database: 'healthy',
                redis: 'healthy',
            },
        };

        const mockResponse: ApiResponse<HealthDTO> = {
            success: true,
            data: mockHealthData,
        };

        let requestedUrl = '';
        const mockFetch = (async (input: RequestInfo | URL) => {
            requestedUrl = input instanceof Request ? input.url : String(input);
            return new Response(JSON.stringify(mockResponse), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }) as unknown as typeof fetch;

        const client = createInsigniaClient({
            baseUrl: 'http://test-api.local',
            fetch: mockFetch,
        });

        const res = await client.health.check();

        expect(requestedUrl).toContain('health');
        expect(res.success).toBe(true);

        if (res.success) {
            expect(res.data.status).toBe('ok');
            expect(res.data.uptime).toBe(42.5);
            expect(res.data.services.database).toBe('healthy');
        }
    });

    test('returns ApiErrorResponse with type: "api" on 503 from backend', async () => {
        const mockErrorPayload: ApiErrorResponse<'SERVICES_UNAVAILABLE'> = {
            success: false,
            error: {
                code: 'SERVICES_UNAVAILABLE',
                message: 'Недоступны системные сервисы: database',
                details: { services: { database: 'unhealthy' } },
            },
        };

        const mockFetch = (async () => {
            return new Response(JSON.stringify(mockErrorPayload), {
                status: 503,
                headers: { 'Content-Type': 'application/json' },
            });
        }) as unknown as typeof fetch;

        const client = createInsigniaClient({
            baseUrl: 'http://test-api.local',
            fetch: mockFetch,
        });

        const res = await client.health.check();

        expect(res.success).toBe(false);

        if (!res.success) {
            expect(res.error.type).toBe('api');
            expect(res.error.status).toBe(503);
            expect(res.error.code).toBe('SERVICES_UNAVAILABLE');
            expect(res.error.message).toContain('Недоступны системные сервисы');
        }
    });

    test('returns SdkNetworkError with type: "network" on network failure', async () => {
        const mockFetch = (async () => {
            throw new TypeError('Failed to fetch (network offline)');
        }) as unknown as typeof fetch;

        const client = createInsigniaClient({
            baseUrl: 'http://test-api.local',
            fetch: mockFetch,
        });

        const res = await client.health.check();

        expect(res.success).toBe(false);

        if (!res.success) {
            expect(res.error.type).toBe('network');
            expect(res.error.status).toBe(0);
            expect(res.error.code).toBe('OFFLINE');
            expect(res.error.message).toContain('network error');
        }
    });

    test('returns SdkHttpError with type: "http" on 502 Bad Gateway from Nginx', async () => {
        const mockFetch = (async () => {
            return new Response('<html>502 Bad Gateway</html>', {
                status: 502,
                statusText: 'Bad Gateway',
                headers: { 'Content-Type': 'text/html' },
            });
        }) as unknown as typeof fetch;

        const client = createInsigniaClient({
            baseUrl: 'http://test-api.local',
            fetch: mockFetch,
        });

        const res = await client.health.check();

        expect(res.success).toBe(false);

        if (!res.success) {
            expect(res.error.type).toBe('http');
            expect(res.error.status).toBe(502);
            expect(res.error.code).toBe('BAD_GATEWAY');
            expect(res.error.message).toContain('HTTP 502');
        }
    });
});
