import { z } from 'zod';

import {
    createApiErrorResponseSchema,
    createApiResponseSchema,
} from './common/response';

export const healthErrorCodeSchema = z.enum([
    'SERVICES_UNAVAILABLE',
    'DATABASE_UNAVAILABLE',
    'CACHE_UNAVAILABLE',
]);
export type HealthErrorCode = z.infer<typeof healthErrorCodeSchema>;

export const servicesStatusSchema = z.enum(['healthy', 'unhealthy']);

export const systemServicesSchema = z.object({
    database: servicesStatusSchema,
    redis: servicesStatusSchema.optional(),
    storage: servicesStatusSchema.optional(),
});

export type SystemServices = z.infer<typeof systemServicesSchema>;

export const healthDTOSchema = z.object({
    status: z.literal('ok'),
    timestamp: z.string(),
    uptime: z.number(),
    services: systemServicesSchema,
});

export type HealthDTO = z.infer<typeof healthDTOSchema>;

export const healthResponseSchema = createApiResponseSchema(healthDTOSchema);

export const healthErrorResponseSchema = createApiErrorResponseSchema(
    healthErrorCodeSchema,
);
