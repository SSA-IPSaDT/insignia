import { describe, expect, spyOn, test } from 'bun:test';

import type { BotContext } from '#telegram/context';
import healthHandle, { apiClient } from '#telegram/handlers/health.handle';

describe('healthHandle', () => {
    test('calls api.health.check and replies with formatted JSON', async () => {
        let sentText = '';
        let sentOptions: Record<string, unknown> | undefined;

        spyOn(apiClient.health, 'check').mockResolvedValueOnce({
            success: true,
            data: {
                status: 'ok',
                timestamp: '2026-11-08T00:00:00.000Z',
                uptime: 123.45,
                services: {
                    database: 'healthy',
                },
            },
        });

        const ctx = {
            reply: async (text: string, options?: Record<string, unknown>) => {
                sentText = text;
                sentOptions = options;
            },
        } as unknown as BotContext;

        await healthHandle(ctx);

        expect(sentText).toContain('Insignia API Health Status:');
        expect(sentText).toContain('"status": "ok"');
        expect(sentText).toContain('"database": "healthy"');
        expect(sentOptions?.parse_mode).toBe('HTML');
    });
});
