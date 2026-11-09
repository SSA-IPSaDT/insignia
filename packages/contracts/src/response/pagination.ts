import { z, type ZodType } from 'zod';

import { type ApiResponse, createApiResponseSchema } from './envelopes';

/**
 * Базовая Zod-схема query-параметров пагинации и поиска.
 */
export const paginationQuerySchema = z.object({
    page: z.coerce
        .number()
        .int()
        .min(1)
        .default(1)
        .describe('Номер запрашиваемой страницы (начиная с 1)'),
    limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(20)
        .describe(
            'Количество элементов на странице (от 1 до 100, по умолчанию 20)',
        ),
    search: z
        .string()
        .trim()
        .max(100)
        .optional()
        .describe('Строка поискового запроса'),
    sortOrder: z
        .enum(['asc', 'desc'])
        .default('desc')
        .describe(
            'Порядок сортировки (asc - по возрастанию, desc - по убыванию)',
        ),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

/**
 * Zod-схема метаданных пагинации.
 */
export const paginationMetaSchema = z
    .object({
        page: z.number().int().describe('Текущая страница'),
        limit: z.number().int().describe('Количество элементов на странице'),
        total: z
            .number()
            .int()
            .describe(
                'Общее количество элементов, удовлетворяющих критериям выборки',
            ),
        totalPages: z.number().int().describe('Всего страниц'),
        hasNextPage: z.boolean().describe('Признак наличия следующей страницы'),
        hasPrevPage: z
            .boolean()
            .describe('Признак наличия предыдущей страницы'),
    })
    .describe('Метаданные пагинации');

export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

/**
 * Полезная нагрузка пагинированного ответа: элементы + метаданные.
 */
export type PaginatedData<T> = {
    items: T[];
    meta: PaginationMeta;
};

/**
 * Создаёт Zod-схему данных для пагинированного ответа.
 */
export const createPaginatedDataSchema = <T extends ZodType>(
    itemSchema: T,
    itemsDescription: string = 'Список элементов на текущей странице',
) =>
    z.object({
        items: z.array(itemSchema).describe(itemsDescription),
        meta: paginationMetaSchema,
    });

/**
 * Тип полного успешного пагинированного ответа API.
 */
export type PaginatedApiResponse<T> = ApiResponse<PaginatedData<T>>;

/**
 * Создаёт схему успешного пагинированного ответа API с метаданными.
 */
export const createPaginatedResponseSchema = <T extends ZodType>(
    itemSchema: T,
    description: string = 'Стандартный конверт успешного пагинированного ответа API',
) => {
    return createApiResponseSchema(
        createPaginatedDataSchema(itemSchema),
        description,
    );
};

/**
 * Вычисляет объект метаданных пагинации на основе общего количества записей, страницы и лимита.
 */
export const calculatePaginationMeta = ({
    total,
    page,
    limit,
}: {
    total: number;
    page: number;
    limit: number;
}): PaginationMeta => {
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1 && totalPages > 0;

    return {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
    };
};

/**
 * Формирует типизированный пагинированный ответ API.
 */
export const createPaginatedResponse = <T>({
    items,
    total,
    page,
    limit,
}: {
    items: T[];
    total: number;
    page: number;
    limit: number;
}): PaginatedApiResponse<T> => {
    const meta = calculatePaginationMeta({ total, page, limit });

    return {
        success: true,
        data: {
            items,
            meta,
        },
    };
};
