import { z } from 'zod';

import { adminRawSchema } from './admin.js';
import { apiRawSchema } from './api.js';
import { appRawSchema } from './app.js';
import { baseRawSchema } from './base.js';
import { botRawSchema } from './bot.js';
import { databaseRawSchema } from './database.js';
import { getLocalIp } from './utils.js';

export const envRawSchema = z.object({
    ...baseRawSchema.shape,
    ...apiRawSchema.shape,
    ...adminRawSchema.shape,
    ...appRawSchema.shape,
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
    const appDomain = raw.APP_DOMAIN_SUB
        ? `${raw.APP_DOMAIN_SUB}.${rootDomain}`
        : rootDomain;
    const botDomain = raw.BOT_DOMAIN_SUB
        ? `${raw.BOT_DOMAIN_SUB}.${rootDomain}`
        : rootDomain;

    const localIp = getLocalIp();

    const resolveDevHost = (host: string): string => {
        if (host === 'localhost' || host === '0.0.0.0') {
            return localIp;
        }
        return host;
    };

    const bindHost = (host: string): string => {
        if (!isProd && host === 'localhost') {
            return '0.0.0.0';
        }
        return host;
    };

    const publicApiUrl = isProd
        ? `${protocol}://${apiDomain}`
        : `${protocol}://${resolveDevHost(raw.API_HOST)}:${raw.API_PORT}`;

    const publicAdminUrl = isProd
        ? `${protocol}://${adminDomain}`
        : `${protocol}://${resolveDevHost(raw.ADMIN_HOST)}:${raw.ADMIN_PORT}`;

    const publicAppUrl = isProd
        ? `${protocol}://${appDomain}`
        : `${protocol}://${resolveDevHost(raw.APP_HOST)}:${raw.APP_PORT}`;

    const publicBotUrl = isProd
        ? `${protocol}://${botDomain}`
        : `${protocol}://${resolveDevHost(raw.BOT_HOST)}:${raw.BOT_PORT}`;

    const corsAllowedOrigins = raw.API_CORS_ALLOW_ALL
        ? ['*']
        : [
              publicAppUrl,
              publicAdminUrl,
              publicBotUrl,
              `http://${localIp}:${raw.APP_PORT}`,
              `http://${localIp}:${raw.ADMIN_PORT}`,
              `http://${localIp}:${raw.BOT_PORT}`,
              `http://localhost:${raw.APP_PORT}`,
              `http://localhost:${raw.ADMIN_PORT}`,
              `http://localhost:${raw.BOT_PORT}`,
              `http://127.0.0.1:${raw.APP_PORT}`,
              `http://127.0.0.1:${raw.ADMIN_PORT}`,
              `http://127.0.0.1:${raw.BOT_PORT}`,
          ];

    const databaseUrl =
        raw.DATABASE_URL ||
        `postgresql://${raw.DATABASE_USER}:${raw.DATABASE_PASSWORD}@${raw.DATABASE_HOST}:${raw.DATABASE_PORT}/${raw.DATABASE_NAME}`;

    return {
        ...raw,
        API_HOST: bindHost(raw.API_HOST),
        ADMIN_HOST: bindHost(raw.ADMIN_HOST),
        APP_HOST: bindHost(raw.APP_HOST),
        BOT_HOST: bindHost(raw.BOT_HOST),
        LOCAL_IP: localIp,
        API_DOMAIN: apiDomain,
        ADMIN_DOMAIN: adminDomain,
        APP_DOMAIN: appDomain,
        BOT_DOMAIN: botDomain,
        PUBLIC_API_URL: publicApiUrl,
        PUBLIC_ADMIN_URL: publicAdminUrl,
        PUBLIC_APP_URL: publicAppUrl,
        PUBLIC_BOT_URL: publicBotUrl,
        CORS_ALLOWED_ORIGINS: corsAllowedOrigins,
        DATABASE_URL: databaseUrl,
        ADMIN_ORIGIN: publicAdminUrl,
        APP_ORIGIN: publicAppUrl,
        PUBLIC_WEB_URL: publicAppUrl,
        WEB_ORIGIN: publicAppUrl,
    };
});

export type Env = z.infer<typeof envSchema>;
