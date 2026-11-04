import { createLogger } from '@insignia/logger';

import { createBot } from './bot.js';
import { readBotConfig } from './config.js';
import { startWebhookServer } from './server.js';

const logger = createLogger('bot');

const run = async (): Promise<void> => {
    const config = readBotConfig();
    const bot = createBot(config.token);

    if (config.webhookEnabled) {
        const server = startWebhookServer({
            bot,
            host: config.webhookHost,
            port: config.webhookPort,
            secretToken: config.webhookSecret,
        });

        await bot.api.setWebhook(config.webhookUrl, {
            secret_token: config.webhookSecret,
        });

        logger.info(`Bot started in webhook mode: ${config.webhookUrl}`);

        const stop = (): void => {
            server.stop();
            process.exit(0);
        };

        process.once('SIGINT', stop);
        process.once('SIGTERM', stop);

        return;
    }

    const stop = (): void => {
        void bot.stop();
    };

    process.once('SIGINT', stop);
    process.once('SIGTERM', stop);

    await bot.api.deleteWebhook();
    logger.info('Bot started in polling mode.');
    await bot.start();
};

run().catch((error: unknown) => {
    logger.error('Bot failed to start', error);
    process.exit(1);
});
