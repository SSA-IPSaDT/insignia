import { z } from 'zod';

import { booleanEnv } from './utils.js';

const telegramBotTokenSchema = z
    .string()
    .regex(
        /^\d+:[A-Za-z0-9_-]+$/,
        'TELEGRAM_BOT_TOKEN должен быть в формате 123456:ABC-DEF_ghi',
    );

export const botRawSchema = z.object({
    TELEGRAM_BOT_TOKEN: telegramBotTokenSchema.or(z.literal('')).default(''),
    TELEGRAM_BOT_USERNAME: z.string().default(''),

    // Вебхуки для Telegram (Prod / Staging)
    BOT_WEBHOOK_ENABLED: booleanEnv(false),
    BOT_WEBHOOK_PORT: z.coerce.number().default(51004),
    BOT_WEBHOOK_HOST: z.string().default('localhost'),
    TELEGRAM_WEBHOOK_SECRET: z.string().default(''),
});

export type BotRawEnv = z.infer<typeof botRawSchema>;
