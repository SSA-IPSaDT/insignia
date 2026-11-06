import { z } from 'zod';

import { booleanEnv } from './utils.js';

const telegramBotTokenSchema = z
    .string()
    .regex(
        /^\d{8,12}:[A-Za-z0-9_-]{35}$/,
        'TELEGRAM_BOT_TOKEN должен соответствовать официальному формату Telegram Bot API (<8-12 цифр>:<35 символов>)',
    );

export const botRawSchema = z.object({
    TELEGRAM_BOT_TOKEN: telegramBotTokenSchema.default(
        '0000000000:AAFakeTestTokenForDevAndTestingOnly',
    ),

    // Переключение на тестовую среду Telegram (Test DC)
    TELEGRAM_TEST_ENVIRONMENT: booleanEnv(false),

    // Сетевые настройки сервиса bot
    BOT_PORT: z.coerce.number().default(51004),
    BOT_HOST: z.string().default('localhost'),
    BOT_DOMAIN_SUB: z.string().default('bot'),

    // Вебхуки для Telegram (Prod / Staging)
    BOT_WEBHOOK_ENABLED: booleanEnv(false),
    TELEGRAM_WEBHOOK_SECRET: z.string().default(''),
});

export type BotRawEnv = z.infer<typeof botRawSchema>;
