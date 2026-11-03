import { z } from 'zod';

import { baseEnvSchema } from './base';
import { createLazyEnv } from './common';

export const apiEnvSchema = baseEnvSchema.extend({
    API_PORT: z.coerce.number().default(51000),
    API_HOST: z.string().default('0.0.0.0'),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;

export const apiEnv: ApiEnv = createLazyEnv(apiEnvSchema);
