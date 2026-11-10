import { z } from 'zod';

import { booleanEnv } from './utils.js';

export const appRawSchema = z.object({
    APP_PORT: z.coerce.number().default(51001),
    APP_HOST: z.string().default('localhost'),
    APP_DOMAIN_SUB: z.string().default('app'),
    ENABLE_PWA: booleanEnv(true),
    TELEGRAM_MINI_APP_MODE: booleanEnv(false),
});

export type AppRawEnv = z.infer<typeof appRawSchema>;

// Backward-compatible aliases
export const webRawSchema = appRawSchema;
export type WebRawEnv = AppRawEnv;
