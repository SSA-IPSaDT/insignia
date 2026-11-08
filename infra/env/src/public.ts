import { z } from 'zod';

import { createLazyEnv } from './common.js';
import { booleanEnv } from './utils.js';

export const publicApiUrlSchema = z
    .url()
    .describe('URL бэкенд API платформы Insignia');

export const publicWebUrlSchema = z
    .url()
    .describe('URL веб-приложения Insignia');

export const publicAdminUrlSchema = z
    .url()
    .describe('URL панели администратора Insignia');

export const enablePwaSchema = booleanEnv(true).describe(
    'Флаг включения поддержки Progressive Web App (PWA)',
);

export const telegramMiniAppModeSchema = booleanEnv(false).describe(
    'Режим работы в качестве Telegram Mini App',
);

export const publicEnvSchema = z.object({
    NODE_ENV: z
        .enum(['development', 'staging', 'production', 'test'])
        .default('development'),
    ROOT_DOMAIN: z.string().default('insignia.tech'),

    PUBLIC_API_URL: publicApiUrlSchema,
    PUBLIC_WEB_URL: publicWebUrlSchema,
    PUBLIC_ADMIN_URL: publicAdminUrlSchema,

    ENABLE_PWA: enablePwaSchema,
    TELEGRAM_MINI_APP_MODE: telegramMiniAppModeSchema,
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

export const publicEnv: PublicEnv = createLazyEnv(publicEnvSchema);
export default publicEnv;
