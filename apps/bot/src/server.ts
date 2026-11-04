import { createLogger } from '@insignia/logger';
import { type Bot, webhookCallback } from 'grammy';

const logger = createLogger('bot');

export type WebhookServerOptions = {
    bot: Bot;
    host: string;
    port: number;
    secretToken: string;
};

export const startWebhookServer = ({
    bot,
    host,
    port,
    secretToken,
}: WebhookServerOptions) => {
    const handleUpdate = webhookCallback(bot, 'bun', { secretToken });

    const server = Bun.serve({
        hostname: host,
        port,
        async fetch(request) {
            const url = new URL(request.url);

            if (url.pathname !== '/webhooks/telegram') {
                return new Response('Not Found', { status: 404 });
            }

            if (request.method !== 'POST') {
                return new Response('Method Not Allowed', { status: 405 });
            }

            return handleUpdate(request);
        },
    });

    logger.info(
        `Webhook server started on http://${host}:${server.port}/webhooks/telegram`,
    );

    return server;
};
