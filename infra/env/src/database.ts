import { z } from 'zod';

import { baseEnvSchema } from './base';
import { createLazyEnv } from './common';

export const databaseEnvSchema = baseEnvSchema
    .extend({
        DATABASE_HOST: z.string().default('localhost'),
        DATABASE_PORT: z.coerce.number().default(52000),
        DATABASE_USER: z.string().default('insignia'),
        DATABASE_PASSWORD: z.string().default('insignia_password'),
        DATABASE_NAME: z.string().default('insignia'),
        DATABASE_URL: z.url().optional(),
    })
    .transform((data) => ({
        ...data,
        DATABASE_URL:
            data.DATABASE_URL ??
            `postgresql://${data.DATABASE_USER}:${data.DATABASE_PASSWORD}@${data.DATABASE_HOST}:${data.DATABASE_PORT}/${data.DATABASE_NAME}`,
    }));

export type DatabaseEnv = z.infer<typeof databaseEnvSchema>;

export const databaseEnv: DatabaseEnv = createLazyEnv(databaseEnvSchema);
