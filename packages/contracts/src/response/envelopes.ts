import { z } from 'zod';
import type { ZodType } from 'zod';

export const createApiResponseSchema = <T extends ZodType>(
    dataSchema: T,
    description: string = 'Стандартный конверт успешного ответа API',
) => {
    const dataProperty = dataSchema.description
        ? dataSchema
        : dataSchema.describe('Полезная нагрузка ответа API');

    return z
        .object({
            success: z
                .literal(true)
                .describe('Флаг успешности выполнения запроса'),
            data: dataProperty,
        })
        .describe(description);
};

export const apiResponseSchema = createApiResponseSchema(
    z.unknown().describe('Полезная нагрузка ответа API'),
);

export type ApiResponse<TData = unknown> = {
    success: true;
    data: TData;
};

export const createSuccessResponse = <T>(data: T): ApiResponse<T> => ({
    success: true,
    data,
});
