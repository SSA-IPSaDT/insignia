import { z } from 'zod';

import { booleanEnv } from './utils.js';

export const botRawSchema = z.object({
    TELEGRAM_BOT_TOKEN: z.string().default(''),
    TELEGRAM_BOT_USERNAME: z.string().default(''),

    // Вебхуки для Telegram (Prod / Staging)
    BOT_WEBHOOK_ENABLED: booleanEnv(false),
    BOT_WEBHOOK_PORT: z.coerce.number().default(51004),
    BOT_WEBHOOK_HOST: z.string().default('localhost'),
    TELEGRAM_WEBHOOK_SECRET: z.string().default(''),
});

export type BotRawEnv = z.infer<typeof botRawSchema>;
