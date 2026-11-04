import cors from '@elysia/cors';
import env from '@insignia/env';

export const corsPlugin = cors({
    origin: env.CORS_ALLOWED_ORIGINS,
    credentials: true,
});
