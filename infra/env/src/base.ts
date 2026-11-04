import { z } from 'zod';

import { booleanEnv } from './utils.js';

export const baseRawSchema = z.object({
    NODE_ENV: z
        .enum(['development', 'staging', 'production', 'test'])
        .default('development'),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    ROOT_DOMAIN: z.string().default('insignia.tech'),
    TRUST_PROXY: booleanEnv(false),
    BODY_SIZE: z.coerce.number().default(1024 * 1024 * 25),
});

export type BaseRawEnv = z.infer<typeof baseRawSchema>;
