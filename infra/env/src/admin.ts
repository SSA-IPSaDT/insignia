import { z } from 'zod';

import { baseEnvSchema } from './base';
import { createLazyEnv } from './common';

export const adminEnvSchema = baseEnvSchema.extend({
    ADMIN_PORT: z.coerce.number().default(51002),
    ADMIN_HOST: z.string().default('localhost'),
});

export type AdminEnv = z.infer<typeof adminEnvSchema>;

export const adminEnv: AdminEnv = createLazyEnv(adminEnvSchema);
