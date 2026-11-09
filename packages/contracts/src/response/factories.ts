import { z, type ZodType } from 'zod';

import {
    type ApiResponse,
    createApiResponseSchema,
    createSuccessResponse,
} from './envelopes';
import {
    createApiErrorResponseSchema,
    createErrorFactory,
    internalServerErrorResponseSchema,
    notImplementedResponseSchema,
    serviceUnavailableResponseSchema,
} from './errors';
import {
    createPaginatedResponse,
    createPaginatedResponseSchema,
    type PaginatedApiResponse,
} from './pagination';
import { validationErrorResponseSchema } from './validation';

/**
 * Конфигурация для фабрики доменных ошибок.
 */
export interface CreateDomainErrorsConfig<
    TMessages extends Record<string, string>,
    TNotFoundCode extends keyof TMessages & string = never,
> {
    /** Название домена в родительном падеже (например, 'пользователя' или 'организации') */
    domain: string;
    /** Словарь сообщений по умолчанию для каждого кода ошибки */
    messages: TMessages;
    /** Опциональный код ошибки для сценария «не найден» (HTTP 404) */
    notFoundCode?: TNotFoundCode;
    /** Опциональное описание для схемы ответа 404 */
    notFoundDescription?: string;
}

/**
 * Фабрика доменных ошибок.
 * Автоматически генерирует:
 * - z.enum схему кодов ошибок с человекопонятным описанием
 * - базовую схему ответа с ошибкой сущности (ApiErrorResponse)
 * - конструктор ошибок `createError(code, message?, details?)`
 * - метод генерации специфичных схем ошибок `createSpecificErrorSchema(code, description?)`
 * - специализированную схему и конструктор для 404 Not Found (если указан notFoundCode)
 */
export const createDomainErrors = <
    const TMessages extends Record<string, string>,
    const TNotFoundCode extends keyof TMessages & string = never,
>(
    config: CreateDomainErrorsConfig<TMessages, TNotFoundCode>,
) => {
    const errorKeys = Object.keys(config.messages) as [
        keyof TMessages & string,
        ...(keyof TMessages & string)[],
    ];

    const codeSchema = z
        .enum(errorKeys)
        .describe(`Код ошибки ${config.domain}`);

    const messageEntries = Object.entries(config.messages);
    const defaultExampleMessage =
        messageEntries[0]?.[1] ?? 'Непредвиденная ошибка';

    const messageDescription = [
        'Понятное человеку описание причины ошибки.',
        '',
        '**Стандартные сообщения по кодам:**',
        ...messageEntries.map(([code, msg]) => `- \`${code}\`: *«${msg}»*`),
    ].join('\n');

    const errorResponseSchema = createApiErrorResponseSchema({
        codeSchema,
        messageSchema: z
            .string()
            .default(defaultExampleMessage)
            .describe(messageDescription),
        description: `Ответ API с ошибкой ${config.domain}`,
    });

    const createError = createErrorFactory(config.messages);

    const createSpecificErrorSchema = <K extends keyof TMessages & string>(
        code: K,
        description?: string,
    ) => {
        const msg = config.messages[code] ?? `Ошибка: ${code}`;
        return createApiErrorResponseSchema({
            codeSchema: z.literal(code).describe(msg),
            messageSchema: z.string().default(msg).describe(msg),
            description: description ?? `Конверт ответа с ошибкой: ${code}`,
        });
    };

    const notFoundSchema = config.notFoundCode
        ? (() => {
              const notFoundMsg =
                  config.messages[config.notFoundCode] ??
                  'Запрашиваемый ресурс не найден.';
              return createApiErrorResponseSchema({
                  codeSchema: z
                      .literal(config.notFoundCode)
                      .describe(`Сущность (${config.domain}) не найдена`),
                  messageSchema: z
                      .string()
                      .default(notFoundMsg)
                      .describe(notFoundMsg),
                  description:
                      config.notFoundDescription ??
                      `Конверт ответа с ошибкой: ${config.domain} не найден`,
              });
          })()
        : undefined;

    const createNotFound = config.notFoundCode
        ? (message?: string, details?: unknown) =>
              createError(
                  config.notFoundCode as TNotFoundCode,
                  message,
                  details,
              )
        : undefined;

    return {
        codeSchema,
        errorResponseSchema,
        messages: config.messages,
        createError,
        createSpecificErrorSchema,
        notFoundSchema,
        createNotFound,
    };
};

/**
 * Фабрика успешного ответа доменной сущности (DTO).
 * Автоматически генерирует:
 * - схему успешного ответа `ApiResponse<TDto>` с корректным описанием
 * - безопасный конструктор ответа `create(rawDb)`, валидирующий входные данные DTO
 *   и оборачивающий результат в ApiResponse.
 */
export const createDomainResponse = <TDto extends ZodType>(
    dtoSchema: TDto,
    description: string,
) => {
    const responseSchema = createApiResponseSchema(
        dtoSchema,
        description.startsWith('Конверт')
            ? description
            : `Конверт успешного ответа с ${description}`,
    );

    const create = (raw: z.input<TDto>): ApiResponse<z.output<TDto>> => {
        return createSuccessResponse(dtoSchema.parse(raw));
    };

    return {
        schema: responseSchema,
        create,
    };
};

/**
 * Фабрика успешного пагинированного ответа доменной сущности (DTO).
 * Автоматически генерирует:
 * - схему пагинированного ответа `PaginatedApiResponse<TDto>` с корректным описанием
 * - безопасный конструктор `create({ items, total, page, limit })`, валидирующий каждый элемент через DTO
 *   и формирующий стандартные метаданные пагинации.
 */
export const createDomainPaginatedResponse = <TDto extends ZodType>(
    dtoSchema: TDto,
    description: string,
) => {
    const schema = createPaginatedResponseSchema(
        dtoSchema,
        description.startsWith('Конверт')
            ? description
            : `Конверт успешного ответа со ${description}`,
    );

    const create = ({
        items,
        total,
        page,
        limit,
    }: {
        items: z.input<TDto>[];
        total: number;
        page: number;
        limit: number;
    }): PaginatedApiResponse<z.output<TDto>> => {
        return createPaginatedResponse({
            items: items.map((item) => dtoSchema.parse(item)),
            total,
            page,
            limit,
        });
    };

    return {
        schema,
        create,
    };
};

/**
 * Стандартный набор инфраструктурных ответов с ошибками, автоматически подмешиваемый в каждый эндпоинт:
 * - 422: Ошибка валидации входящих данных (тело, query, params, headers)
 * - 500: Внутренняя непредвиденная ошибка сервера
 * - 501: Запрашиваемый функционал ещё не реализован
 * - 503: Сервис или база данных временно недоступны
 */
export const standardEndpointResponses = {
    422: validationErrorResponseSchema,
    500: internalServerErrorResponseSchema,
    501: notImplementedResponseSchema,
    503: serviceUnavailableResponseSchema,
} as const;

export type StandardEndpointResponses = typeof standardEndpointResponses;

export type DomainEndpointResult<
    TResponses extends Record<number, ZodType>,
    TParams extends ZodType | undefined = undefined,
    TQuery extends ZodType | undefined = undefined,
    THeaders extends ZodType | undefined = undefined,
    TBody extends ZodType | undefined = undefined,
> = (TParams extends ZodType ? { params: TParams } : {}) &
    (TQuery extends ZodType ? { query: TQuery } : {}) &
    (THeaders extends ZodType ? { headers: THeaders } : {}) &
    (TBody extends ZodType ? { body: TBody } : {}) & {
        response: Omit<StandardEndpointResponses, keyof TResponses> &
            TResponses;
        detail?: {
            tags?: string[];
            summary?: string;
            description?: string;
        };
    };

/**
 * Фабрика контракта эндпоинта маршрута.
 * Автоматически подмешивает стандартные статусы ошибок (422, 500, 503) в карту ответов
 * и собирает строгий объект параметров и ответов для Elysia.
 */
export const createDomainEndpoint = <
    TResponses extends Record<number, ZodType>,
    TParams extends ZodType | undefined = undefined,
    TQuery extends ZodType | undefined = undefined,
    THeaders extends ZodType | undefined = undefined,
    TBody extends ZodType | undefined = undefined,
>(config: {
    params?: TParams;
    query?: TQuery;
    headers?: THeaders;
    body?: TBody;
    response: TResponses;
    detail?: {
        tags?: string[];
        summary?: string;
        description?: string;
    };
}): DomainEndpointResult<TResponses, TParams, TQuery, THeaders, TBody> => {
    const response = {
        ...standardEndpointResponses,
        ...config.response,
    } as Omit<StandardEndpointResponses, keyof TResponses> & TResponses;

    const result = {
        ...(config.params ? { params: config.params } : {}),
        ...(config.query ? { query: config.query } : {}),
        ...(config.headers ? { headers: config.headers } : {}),
        ...(config.body ? { body: config.body } : {}),
        response,
        ...(config.detail ? { detail: config.detail } : {}),
    };

    return result as DomainEndpointResult<
        TResponses,
        TParams,
        TQuery,
        THeaders,
        TBody
    >;
};
