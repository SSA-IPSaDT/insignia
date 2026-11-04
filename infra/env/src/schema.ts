import { z } from 'zod';

import { adminRawSchema } from './admin.js';
import { apiRawSchema } from './api.js';
import { baseRawSchema } from './base.js';
import { botRawSchema } from './bot.js';
import { databaseRawSchema } from './database.js';
import { webRawSchema } from './web.js';

export const envRawSchema = z.object({
    ...baseRawSchema.shape,
    ...apiRawSchema.shape,
    ...adminRawSchema.shape,
    ...webRawSchema.shape,
    ...botRawSchema.shape,
    ...databaseRawSchema.shape,
});

export type EnvRaw = z.infer<typeof envRawSchema>;

export const envSchema = envRawSchema.transform((raw) => {
    const isProd = raw.NODE_ENV === 'production' || raw.NODE_ENV === 'staging';
    const protocol = isProd ? 'https' : 'http';

    const rootDomain = raw.ROOT_DOMAIN;
    const apiDomain = raw.API_DOMAIN_SUB
        ? `${raw.API_DOMAIN_SUB}.${rootDomain}`
        : rootDomain;
    const adminDomain = raw.ADMIN_DOMAIN_SUB
        ? `${raw.ADMIN_DOMAIN_SUB}.${rootDomain}`
        : rootDomain;
    const webDomain = raw.WEB_DOMAIN_SUB
        ? `${raw.WEB_DOMAIN_SUB}.${rootDomain}`
        : rootDomain;

    const publicApiUrl = isProd
        ? `${protocol}://${apiDomain}`
        : `${protocol}://${raw.API_HOST}:${raw.API_PORT}`;

    const publicAdminUrl = isProd
        ? `${protocol}://${adminDomain}`
        : `${protocol}://${raw.ADMIN_HOST}:${raw.ADMIN_PORT}`;

    const publicWebUrl = isProd
        ? `${protocol}://${webDomain}`
        : `${protocol}://${raw.WEB_HOST}:${raw.WEB_PORT}`;

    const corsAllowedOrigins = raw.API_CORS_ALLOW_ALL
        ? ['*']
        : [
              publicWebUrl,
              publicAdminUrl,
              `http://localhost:${raw.WEB_PORT}`,
              `http://localhost:${raw.ADMIN_PORT}`,
              `http://127.0.0.1:${raw.WEB_PORT}`,
              `http://127.0.0.1:${raw.ADMIN_PORT}`,
          ];

    const databaseUrl =
        raw.DATABASE_URL ||
        `postgresql://${raw.DATABASE_USER}:${raw.DATABASE_PASSWORD}@${raw.DATABASE_HOST}:${raw.DATABASE_PORT}/${raw.DATABASE_NAME}`;

    const telegramWebhookUrl = isProd
        ? `${publicApiUrl}/webhooks/telegram`
        : `http://${raw.BOT_WEBHOOK_HOST}:${raw.BOT_WEBHOOK_PORT}/webhooks/telegram`;

    return {
        ...raw,
        API_DOMAIN: apiDomain,
        ADMIN_DOMAIN: adminDomain,
        WEB_DOMAIN: webDomain,
        PUBLIC_API_URL: publicApiUrl,
        PUBLIC_ADMIN_URL: publicAdminUrl,
        PUBLIC_WEB_URL: publicWebUrl,
        CORS_ALLOWED_ORIGINS: corsAllowedOrigins,
        DATABASE_URL: databaseUrl,
        TELEGRAM_WEBHOOK_URL: telegramWebhookUrl,
        ADMIN_ORIGIN: publicAdminUrl,
        WEB_ORIGIN: publicWebUrl,
        TELEGRAM_MINI_APP_URL: publicWebUrl,
    };
});

export type Env = z.infer<typeof envSchema>;
