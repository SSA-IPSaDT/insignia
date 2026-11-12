import { z, type ZodType } from 'zod';

import {
    createApiErrorResponseSchema,
    createErrorFactory,
    internalServerErrorResponseSchema,
    notImplementedResponseSchema,
    serviceUnavailableResponseSchema,
} from './errors';
import {
    calculatePaginationMeta,
    createPaginatedDataSchema,
    createPaginatedResponse,
    createPaginatedResponseSchema,
    type PaginatedApiResponse,
    type PaginatedData,
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
    /** Опциональная карта HTTP статус-кодов для специфичных ошибок */
    statuses?: Partial<Record<keyof TMessages & string, number>>;
}

/**
 * Фабрика доменных ошибок по спецификации RFC 9457 Problem Details.
 * Автоматически генерирует:
 * - z.enum схему кодов ошибок с человекопонятным описанием
 * - базовую RFC 9457 схему ответа с ошибкой сущности
 * - конструктор ошибок `createError(code, detail?, details?, options?)`
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
        status: 400,
        title: `Ошибка ${config.domain}`,
        slug: `${config.domain}-error`,
        messageSchema: z
            .string()
            .default(defaultExampleMessage)
            .describe(messageDescription),
        description: `Ответ API с ошибкой ${config.domain}`,
    });

    const createError = createErrorFactory<keyof TMessages & string>(
        config.messages,
        {
            statuses: config.statuses,
            notFoundCode: config.notFoundCode,
        },
    );

    const createSpecificErrorSchema = <K extends keyof TMessages & string>(
        code: K,
        description?: string,
        status?: number,
    ) => {
        const msg = config.messages[code] ?? `Ошибка: ${code}`;
        const slug = code.toLowerCase().replace(/_/g, '-');
        const resolvedStatus =
            status ??
            (config.statuses && code in config.statuses
                ? config.statuses[code]!
                : (code as string) === config.notFoundCode
                  ? 404
                  : 400);

        return createApiErrorResponseSchema({
            codeSchema: z.literal(code).describe(msg),
            status: resolvedStatus,
            slug,
            title: msg,
            messageSchema: z.string().default(msg).describe(msg),
            description: description ?? `Ответ API с ошибкой: ${code}`,
        });
    };

    const notFoundSchema = config.notFoundCode
        ? (() => {
              const notFoundCode = config.notFoundCode;
              const notFoundMsg =
                  config.messages[notFoundCode] ??
                  'Запрашиваемый ресурс не найден.';
              const notFoundSlug = notFoundCode
                  .toLowerCase()
                  .replace(/_/g, '-');
              return createApiErrorResponseSchema({
                  codeSchema: z
                      .literal(notFoundCode)
                      .describe(`Сущность (${config.domain}) не найдена`),
                  status: 404,
                  slug: notFoundSlug,
                  title: notFoundMsg,
                  messageSchema: z
                      .string()
                      .default(notFoundMsg)
                      .describe(notFoundMsg),
                  description:
                      config.notFoundDescription ??
                      `Ответ API: ${config.domain} не найден(а)`,
              });
          })()
        : undefined;

    const createNotFound = config.notFoundCode
        ? (
              detail?: string,
              details?: unknown,
              options?: { instance?: string },
          ) =>
              createError(
                  config.notFoundCode as TNotFoundCode,
                  detail,
                  details,
                  { status: 404, instance: options?.instance },
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
 * Возвращает чистую схему ресурса (без JSend-оболочки success: true).
 */
export const createDomainResponse = <TDto extends ZodType>(
    dtoSchema: TDto,
    description: string,
) => {
    const schema = dtoSchema.describe(
        description.startsWith('Ответ')
            ? description
            : `Ответ API с ${description}`,
    );

    const create = (raw: z.input<TDto>): z.output<TDto> => {
        return dtoSchema.parse(raw);
    };

    const wrap = (raw: z.input<TDto>): z.output<TDto> => {
        return raw as z.output<TDto>;
    };

    return {
        schema,
        create,
        wrap,
    };
};

/**
 * Фабрика успешного пагинированного ответа доменной сущности (DTO).
 * Возвращает чистую схему пагинации `{ items: T[], meta: PaginationMeta }` без поля success.
 */
export const createDomainPaginatedResponse = <TDto extends ZodType>(
    dtoSchema: TDto,
    description: string,
) => {
    const schema = createPaginatedResponseSchema(
        dtoSchema,
        description.startsWith('Пагинированный')
            ? description
            : `Пагинированный ответ со ${description}`,
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

    const wrap = ({
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
            items: items as unknown as z.output<TDto>[],
            total,
            page,
            limit,
        });
    };

    return {
        schema,
        create,
        wrap,
    };
};

/**
 * Стандартный набор инфраструктурных ответов с ошибками (RFC 9457),
 * автоматически подмешиваемый в каждый эндпоинт:
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
 * Создаёт унифицированный контракт маршрута (Domain Endpoint) для Elysia.
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
