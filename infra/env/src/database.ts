import { z } from 'zod';

export const databaseRawSchema = z.object({
    DATABASE_HOST: z.string().default('localhost'),
    DATABASE_PORT: z.coerce.number().default(52000),
    DATABASE_USER: z.string().default('insignia'),
    DATABASE_PASSWORD: z.string().default('insignia_password'),
    DATABASE_NAME: z.string().default('insignia'),
    DATABASE_URL: z.string().optional(),
});

export type DatabaseRawEnv = z.infer<typeof databaseRawSchema>;
