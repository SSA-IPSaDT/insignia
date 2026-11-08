import { z } from 'zod';
import type { ZodType } from 'zod';

export const createApiResponseSchema = <T extends ZodType>(dataSchema: T) =>
    z
        .object({
            success: z
                .literal(true)
                .describe('Флаг успешности выполнения запроса (всегда true)'),
            data: dataSchema.describe('Полезная нагрузка ответа API'),
        })
        .describe('Стандартный конверт успешного ответа API');

export type ApiResponse<TData> = {
    success: true;
    data: TData;
};

export const createSuccessResponse = <T>(data: T): ApiResponse<T> => ({
    success: true,
    data,
});
