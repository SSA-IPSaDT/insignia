import { z } from 'zod';

export const adminRawSchema = z.object({
    ADMIN_PORT: z.coerce.number().default(51002),
    ADMIN_HOST: z.string().default('localhost'),
    ADMIN_DOMAIN_SUB: z.string().default('admin'),
});

export type AdminRawEnv = z.infer<typeof adminRawSchema>;
