import { z } from 'zod';
import type { ZodType } from 'zod';

export const commonErrorCodeSchema = z
    .enum([
        'BAD_REQUEST',
        'VALIDATION_ERROR',
        'UNAUTHORIZED',
        'FORBIDDEN',
        'NOT_FOUND',
        'CONFLICT',
        'INTERNAL_SERVER_ERROR',
        'NOT_IMPLEMENTED',
        'SERVICE_UNAVAILABLE',
        'DATABASE_ERROR',
    ])
    .describe('Код ошибки API');

export type CommonErrorCode = z.infer<typeof commonErrorCodeSchema>;

export const COMMON_ERROR_MESSAGES: Record<CommonErrorCode, string> = {
    BAD_REQUEST: 'Некорректный запрос.',
    VALIDATION_ERROR: 'Ошибка валидации входящих данных.',
    UNAUTHORIZED: 'Требуется аутентификация.',
    FORBIDDEN: 'Доступ к запрашиваемому ресурсу запрещён.',
    NOT_FOUND: 'Запрашиваемый ресурс не найден.',
    CONFLICT: 'Конфликт состояния данных.',
    INTERNAL_SERVER_ERROR: 'Внутренняя непредвиденная ошибка сервера.',
    NOT_IMPLEMENTED: 'Запрашиваемый функционал ещё не реализован.',
    SERVICE_UNAVAILABLE: 'Сервис временно недоступен. Попробуйте позже.',
    DATABASE_ERROR: 'Ошибка при взаимодействии с базой данных.',
} as const;

export const COMMON_ERROR_STATUSES: Record<CommonErrorCode, number> = {
    BAD_REQUEST: 400,
    VALIDATION_ERROR: 422,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    SERVICE_UNAVAILABLE: 503,
    DATABASE_ERROR: 503,
} as const;

export const COMMON_ERROR_SLUGS: Record<CommonErrorCode, string> = {
    BAD_REQUEST: 'bad-request',
    VALIDATION_ERROR: 'validation-error',
    UNAUTHORIZED: 'unauthorized',
    FORBIDDEN: 'forbidden',
    NOT_FOUND: 'not-found',
    CONFLICT: 'conflict',
    INTERNAL_SERVER_ERROR: 'internal-server-error',
    NOT_IMPLEMENTED: 'not-implemented',
    SERVICE_UNAVAILABLE: 'service-unavailable',
    DATABASE_ERROR: 'database-error',
} as const;

export const defaultDetailsSchema = z
    .unknown()
    .describe('Дополнительные контекстные данные или детализация ошибки')
    .optional();

export type DefaultDetailsSchema = typeof defaultDetailsSchema;

/**
 * Интерфейс документа ошибки по спецификации RFC 9457 Problem Details.
 */
export interface ProblemDetails<TCode extends string = CommonErrorCode> {
    /** Каноничный URI спецификации типа проблемы */
    type: string;
    /** Краткое человекочитаемое название типа проблемы */
    title: string;
    /** HTTP статус-код ответа origin-сервера */
    status: number;
    /** Подробное объяснение конкретного случая возникновения проблемы */
    detail: string;
    /** URI ресурса или запроса, где возникла ошибка */
    instance: string;
    /** Машиночитаемый код ошибки платформы Insignia */
    code: TCode;
    /** Список нарушенных параметров запроса (для валидационных ошибок) */
    invalidParams?: Array<{ name: string; reason: string }>;
    /** Дополнительный контекст ошибки */
    details?: unknown;
}

/** Алиас для совместимости с кодовой базой и SDK */
export type ApiErrorResponse<TCode extends string = CommonErrorCode> =
    ProblemDetails<TCode>;

export type InvalidParamsSchema = z.ZodOptional<
    z.ZodArray<
        z.ZodObject<{
            name: z.ZodString;
            reason: z.ZodString;
        }>
    >
>;

export interface CreateApiErrorResponseSchemaOptions<
    TCode extends ZodType = typeof commonErrorCodeSchema,
    TDetails extends ZodType = DefaultDetailsSchema,
    TMessage extends ZodType = z.ZodString,
> {
    codeSchema?: TCode;
    detailsSchema?: TDetails;
    messageSchema?: TMessage;
    status?: number;
    title?: string;
    slug?: string;
    description?: string;
}

export function createApiErrorResponseSchema<
    TCode extends ZodType = typeof commonErrorCodeSchema,
    TDetails extends ZodType = DefaultDetailsSchema,
    TMessage extends ZodType = z.ZodString,
>(
    options: CreateApiErrorResponseSchemaOptions<TCode, TDetails, TMessage>,
): z.ZodObject<{
    type: z.ZodString;
    title: z.ZodString;
    status: z.ZodNumber;
    detail: TMessage;
    instance: z.ZodString;
    code: TCode;
    invalidParams: InvalidParamsSchema;
    details: TDetails;
}>;
export function createApiErrorResponseSchema<
    TCode extends ZodType = typeof commonErrorCodeSchema,
>(
    codeSchema: TCode,
    description: string,
): z.ZodObject<{
    type: z.ZodString;
    title: z.ZodString;
    status: z.ZodNumber;
    detail: z.ZodString;
    instance: z.ZodString;
    code: TCode;
    invalidParams: InvalidParamsSchema;
    details: DefaultDetailsSchema;
}>;
export function createApiErrorResponseSchema<
    TCode extends ZodType = typeof commonErrorCodeSchema,
    TDetails extends ZodType = DefaultDetailsSchema,
>(
    codeSchema?: TCode,
    detailsSchema?: TDetails,
    description?: string,
): z.ZodObject<{
    type: z.ZodString;
    title: z.ZodString;
    status: z.ZodNumber;
    detail: z.ZodString;
    instance: z.ZodString;
    code: TCode;
    invalidParams: InvalidParamsSchema;
    details: TDetails;
}>;
export function createApiErrorResponseSchema<
    TCode extends ZodType = typeof commonErrorCodeSchema,
    TDetails extends ZodType = DefaultDetailsSchema,
    TMessage extends ZodType = z.ZodString,
>(
    codeSchema?: TCode,
    detailsSchema?: TDetails,
    messageSchema?: TMessage,
    description?: string,
): z.ZodObject<{
    type: z.ZodString;
    title: z.ZodString;
    status: z.ZodNumber;
    detail: TMessage;
    instance: z.ZodString;
    code: TCode;
    invalidParams: InvalidParamsSchema;
    details: TDetails;
}>;
export function createApiErrorResponseSchema(
    first?: unknown,
    second?: unknown,
    third?: unknown,
    fourth?: unknown,
): z.ZodObject<z.ZodRawShape> {
    let codeSchema: ZodType | undefined;
    let detailsSchema: ZodType | undefined;
    let messageSchema: ZodType | undefined;
    let status = 500;
    let title = 'Ошибка API';
    let slug = 'error';
    let description: string | undefined;

    if (
        first !== undefined &&
        first !== null &&
        typeof first === 'object' &&
        !('_def' in first) &&
        !('safeParse' in first)
    ) {
        const opts = first as CreateApiErrorResponseSchemaOptions;
        codeSchema = opts.codeSchema;
        detailsSchema = opts.detailsSchema;
        messageSchema = opts.messageSchema;
        status = opts.status ?? 500;
        title = opts.title ?? 'Ошибка API';
        slug = opts.slug ?? 'error';
        description = opts.description;
    } else {
        codeSchema = first as ZodType | undefined;
        if (typeof second === 'string') {
            description = second;
        } else {
            detailsSchema = second as ZodType | undefined;
            if (typeof third === 'string') {
                description = third;
            } else {
                messageSchema = third as ZodType | undefined;
                description = fourth as string | undefined;
            }
        }
    }

    const hasDescription = (schema: ZodType): boolean => {
        if (schema.description) return true;
        const inner = (schema as unknown as { _def?: { innerType?: ZodType } })
            ._def?.innerType;
        return inner ? hasDescription(inner) : false;
    };

    const resolvedCode = codeSchema
        ? hasDescription(codeSchema)
            ? codeSchema
            : codeSchema.describe('Машиночитаемый код категории ошибки')
        : commonErrorCodeSchema;

    const resolvedDetails = detailsSchema
        ? hasDescription(detailsSchema)
            ? detailsSchema
            : detailsSchema.describe(
                  'Дополнительные контекстные данные или детализация ошибки',
              )
        : defaultDetailsSchema;

    const resolvedMessage = messageSchema
        ? hasDescription(messageSchema)
            ? messageSchema
            : messageSchema.describe(
                  'Понятное человеку описание причины ошибки',
              )
        : z.string().describe('Понятное человеку описание причины ошибки');

    const resolvedDescription =
        description ?? 'Стандартный ответ API с ошибкой';

    return z
        .object({
            type: z
                .string()
                .default(`/problems/${slug}`)
                .describe('Каноничный URI документации типа проблемы'),
            title: z
                .string()
                .default(title)
                .describe('Краткое человекопонятное резюме типа проблемы'),
            status: z
                .number()
                .int()
                .default(status)
                .describe('HTTP статус-код ответа сервера'),
            detail: hasDescription(resolvedMessage)
                ? resolvedMessage
                : resolvedMessage.describe(
                      'Подробное объяснение конкретного случая возникновения проблемы',
                  ),
            instance: z
                .string()
                .default('/')
                .describe('URI ресурса или эндпоинта, где возникла ошибка'),
            code: resolvedCode,
            invalidParams: z
                .array(
                    z.object({
                        name: z
                            .string()
                            .describe('Имя некорректного поля или параметра'),
                        reason: z
                            .string()
                            .describe('Причина отклонения валидатором'),
                    }),
                )
                .optional()
                .describe('Список нарушенных параметров запроса'),
            details: resolvedDetails,
        })
        .describe(resolvedDescription);
}

const commonErrorMessageDescription = [
    'Понятное человеку описание причины ошибки.',
    '',
    '**Стандартные сообщения по кодам:**',
    ...Object.entries(COMMON_ERROR_MESSAGES).map(
        ([code, msg]) => `- \`${code}\`: *«${msg}»*`,
    ),
].join('\n');

export const apiErrorResponseSchema = createApiErrorResponseSchema({
    codeSchema: commonErrorCodeSchema,
    status: 400,
    title: COMMON_ERROR_MESSAGES.BAD_REQUEST,
    slug: 'bad-request',
    messageSchema: z
        .string()
        .default(COMMON_ERROR_MESSAGES.BAD_REQUEST)
        .describe(commonErrorMessageDescription),
    description: 'Стандартный ответ API с ошибкой',
});

/**
 * Zod-схема ответа при внутренней непредвиденной ошибке сервера (HTTP 500).
 */
export const internalServerErrorResponseSchema = createApiErrorResponseSchema({
    codeSchema: z
        .literal('INTERNAL_SERVER_ERROR')
        .describe('Внутренняя непредвиденная ошибка сервера'),
    status: 500,
    title: COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    slug: 'internal-server-error',
    messageSchema: z
        .string()
        .default(COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
        .describe(COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR),
    description: 'Ответ API с внутренней ошибкой сервера',
});

export type InternalServerErrorResponse =
    ApiErrorResponse<'INTERNAL_SERVER_ERROR'>;

/**
 * Zod-схема ответа при временной недоступности сервиса или базы данных (HTTP 503).
 */
export const serviceUnavailableResponseSchema = createApiErrorResponseSchema({
    codeSchema: z
        .enum(['SERVICE_UNAVAILABLE', 'DATABASE_ERROR'])
        .describe('Код ошибки недоступности сервиса или базы данных'),
    status: 503,
    title: COMMON_ERROR_MESSAGES.SERVICE_UNAVAILABLE,
    slug: 'service-unavailable',
    messageSchema: z
        .string()
        .default(COMMON_ERROR_MESSAGES.SERVICE_UNAVAILABLE)
        .describe(
            [
                'Понятное человеку описание причины ошибки.',
                '',
                '**Стандартные сообщения по кодам:**',
                `- \`SERVICE_UNAVAILABLE\`: *«${COMMON_ERROR_MESSAGES.SERVICE_UNAVAILABLE}»*`,
                `- \`DATABASE_ERROR\`: *«${COMMON_ERROR_MESSAGES.DATABASE_ERROR}»*`,
            ].join('\n'),
        ),
    description:
        'Ответ API при временной недоступности сервиса или базы данных',
});

export type ServiceUnavailableResponse = ApiErrorResponse<
    'SERVICE_UNAVAILABLE' | 'DATABASE_ERROR'
>;

/**
 * Zod-схема ответа при обращении к нереализованному функционалу (HTTP 501).
 */
export const notImplementedResponseSchema = createApiErrorResponseSchema({
    codeSchema: z
        .literal('NOT_IMPLEMENTED')
        .describe('Запрашиваемый функционал ещё не реализован'),
    status: 501,
    title: COMMON_ERROR_MESSAGES.NOT_IMPLEMENTED,
    slug: 'not-implemented',
    messageSchema: z
        .string()
        .default(COMMON_ERROR_MESSAGES.NOT_IMPLEMENTED)
        .describe(COMMON_ERROR_MESSAGES.NOT_IMPLEMENTED),
    description: 'Ответ API при обращении к нереализованному функционалу',
});

export type NotImplementedResponse = ApiErrorResponse<'NOT_IMPLEMENTED'>;

/**
 * Создаёт ответ с ошибкой по стандарту RFC 9457 Problem Details.
 */
export const createErrorResponse = <TCode extends string = CommonErrorCode>(
    code: TCode,
    detail?: string,
    details?: unknown,
    options?: {
        status?: number;
        instance?: string;
        title?: string;
        slug?: string;
        type?: string;
        invalidParams?: Array<{ name: string; reason: string }>;
    },
): ApiErrorResponse<TCode> => {
    const resolvedStatus =
        options?.status ??
        (code in COMMON_ERROR_STATUSES
            ? COMMON_ERROR_STATUSES[code as CommonErrorCode]
            : 500);

    const resolvedSlug =
        options?.slug ??
        (code in COMMON_ERROR_SLUGS
            ? COMMON_ERROR_SLUGS[code as CommonErrorCode]
            : code.toLowerCase().replace(/_/g, '-'));

    const resolvedTitle =
        options?.title ??
        (code in COMMON_ERROR_MESSAGES
            ? COMMON_ERROR_MESSAGES[code as CommonErrorCode]
            : code);

    const resolvedDetail = detail ?? resolvedTitle;
    const resolvedType = options?.type ?? `/problems/${resolvedSlug}`;
    const resolvedInstance = options?.instance ?? '/';

    return {
        type: resolvedType,
        title: resolvedTitle,
        status: resolvedStatus,
        detail: resolvedDetail,
        instance: resolvedInstance,
        code,
        ...(options?.invalidParams
            ? { invalidParams: options.invalidParams }
            : {}),
        ...(details !== undefined ? { details } : {}),
    };
};

export const createProblemResponse = createErrorResponse;

export const createErrorFactory = <TCode extends string>(
    messages: Readonly<Record<TCode, string>> | Record<TCode, string>,
    defaults?: {
        statuses?: Partial<Record<TCode, number>>;
        notFoundCode?: TCode;
    },
) => {
    return <T extends TCode>(
        code: T,
        detail?: string,
        details?: unknown,
        options?: {
            instance?: string;
            status?: number;
            title?: string;
            slug?: string;
            type?: string;
            invalidParams?: Array<{ name: string; reason: string }>;
        },
    ): ApiErrorResponse<T> => {
        const resolvedTitle =
            options?.title ??
            (code in messages
                ? messages[code as TCode]
                : code in COMMON_ERROR_MESSAGES
                  ? COMMON_ERROR_MESSAGES[code as CommonErrorCode]
                  : `Ошибка: ${code}`);

        const resolvedStatus =
            options?.status ??
            (defaults?.statuses && (code as TCode) in defaults.statuses
                ? defaults.statuses[code as TCode]!
                : undefined) ??
            (code === defaults?.notFoundCode ? 404 : undefined) ??
            (code in COMMON_ERROR_STATUSES
                ? COMMON_ERROR_STATUSES[code as CommonErrorCode]
                : 500);

        const resolvedSlug =
            code in COMMON_ERROR_SLUGS
                ? COMMON_ERROR_SLUGS[code as CommonErrorCode]
                : code.toLowerCase().replace(/_/g, '-');

        const resolvedDetail = detail ?? resolvedTitle;

        return {
            type: options?.type ?? `/problems/${resolvedSlug}`,
            title: resolvedTitle,
            status: resolvedStatus,
            detail: resolvedDetail,
            instance: options?.instance ?? '/',
            code,
            ...(options?.invalidParams
                ? { invalidParams: options.invalidParams }
                : {}),
            ...(details !== undefined ? { details } : {}),
        };
    };
};
