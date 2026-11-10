import { describe, expect, test } from 'bun:test';

import { Bot } from 'grammy';

import { createTelegramWebhookHandler } from '#telegram/bot';

import { BotService } from '../src/service';

describe('Bot HTTP Server', () => {
    test('handles /health monitoring endpoint', async () => {
        const service = new BotService();

        const response = await service.server.handle(
            new Request('http://localhost/health'),
        );

        expect(response.status).toBe(200);
        const data = (await response.json()) as {
            status: string;
            service: string;
            mode: string;
            telegramEnvironment: string;
        };
        expect(data.status).toBe('ok');
        expect(data.service).toBe('bot');
        expect(data.mode).toBeDefined();
        expect(data.telegramEnvironment).toBeDefined();
    });

    test('createTelegramWebhookHandler defines /webhooks/telegram endpoint', () => {
        const fakeBot = new Bot(
            '1234567890:AAFakeTestTokenForDevAndTestingOnly',
        );
        const handler = createTelegramWebhookHandler(fakeBot as never);

        expect(handler).toBeDefined();
    });
});
