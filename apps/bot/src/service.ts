import env from '@insignia/env';
import { type AnyElysia, Elysia } from 'elysia';
import type { Bot as TelegramBot } from 'grammy';

import {
    createTelegramBot,
    createTelegramWebhookHandler,
    startTelegramBot,
    stopTelegramBot,
} from '#telegram/bot';
import type { BotContext as TelegramBotContext } from '#telegram/context';
import { logger } from '#utils/logger';

export class BotService {
    public readonly telegramBot: TelegramBot<TelegramBotContext>;
    public readonly server: AnyElysia;

    constructor() {
        this.telegramBot = createTelegramBot();
        this.server = this.initServer();
    }

    private initServer(): AnyElysia {
        const app = new Elysia().get('/health', () => ({
            status: 'ok',
            service: 'bot',
            mode: env.BOT_WEBHOOK_ENABLED ? 'webhook' : 'polling',
            telegramEnvironment: env.TELEGRAM_TEST_ENVIRONMENT
                ? 'test'
                : 'prod',
        }));

        if (env.BOT_WEBHOOK_ENABLED) {
            app.use(createTelegramWebhookHandler(this.telegramBot));
        }

        return app;
    }

    public async start(): Promise<void> {
        this.server.listen({
            hostname: env.BOT_HOST,
            port: env.BOT_PORT,
        });

        const dcLabel = env.TELEGRAM_TEST_ENVIRONMENT
            ? 'Test DC (Тестовая среда)'
            : 'Production DC (Боевая среда)';

        logger.info(
            `Bot HTTP server started on http://${env.BOT_HOST}:${env.BOT_PORT} (Telegram: ${dcLabel})`,
        );

        await startTelegramBot(this.telegramBot);
    }

    public async stop(): Promise<void> {
        await stopTelegramBot(this.telegramBot);
        await this.server.stop();
        logger.info('Bot service stopped');
    }
}
