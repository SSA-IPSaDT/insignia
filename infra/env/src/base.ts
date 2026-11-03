import { z } from 'zod';

import { createLazyEnv } from './common';

export const baseEnvSchema = z.object({
    NODE_ENV: z
        .enum(['development', 'staging', 'production', 'test'])
        .default('development'),
    MODE: z.enum(['development', 'production', 'test']).default('development'),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type BaseEnv = z.infer<typeof baseEnvSchema>;

export const env: BaseEnv = createLazyEnv(baseEnvSchema);
