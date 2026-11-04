import { z } from 'zod';

import { booleanEnv } from './utils.js';

export const webRawSchema = z.object({
    WEB_PORT: z.coerce.number().default(51001),
    WEB_HOST: z.string().default('localhost'),
    WEB_DOMAIN_SUB: z.string().default('app'),
    ENABLE_PWA: booleanEnv(true),
    TELEGRAM_MINI_APP_MODE: booleanEnv(false),
});

export type WebRawEnv = z.infer<typeof webRawSchema>;
