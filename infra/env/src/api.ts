import { z } from 'zod';

import { booleanEnv } from './utils.js';

export const apiRawSchema = z.object({
    API_PORT: z.coerce.number().default(51000),
    API_HOST: z.string().default('localhost'),
    API_DOMAIN_SUB: z.string().default('api'),
    API_CORS_ALLOW_ALL: booleanEnv(false),

    // Безопасность и криптография
    AUTH_PASSWORD_PEPPER: z
        .string()
        .min(16)
        .default('dev_insecure_password_pepper_secret_min16chars'),
    JWT_ACCESS_SECRET: z
        .string()
        .min(16)
        .default('dev_insecure_jwt_access_secret_min16chars'),
    JWT_REFRESH_SECRET: z
        .string()
        .min(16)
        .default('dev_insecure_jwt_refresh_secret_min16chars'),
    JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
});

export type ApiRawEnv = z.infer<typeof apiRawSchema>;
