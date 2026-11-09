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

export const defaultDetailsSchema = z
    .unknown()
    .describe('Дополнительные контекстные данные или детализация ошибки')
    .optional();

export type DefaultDetailsSchema = typeof defaultDetailsSchema;

export interface CreateApiErrorResponseSchemaOptions<
    TCode extends ZodType = typeof commonErrorCodeSchema,
    TDetails extends ZodType = DefaultDetailsSchema,
    TMessage extends ZodType = z.ZodString,
> {
    codeSchema?: TCode;
    detailsSchema?: TDetails;
    messageSchema?: TMessage;
    description?: string;
}

export function createApiErrorResponseSchema<
    TCode extends ZodType = typeof commonErrorCodeSchema,
    TDetails extends ZodType = DefaultDetailsSchema,
    TMessage extends ZodType = z.ZodString,
>(
    options: CreateApiErrorResponseSchemaOptions<TCode, TDetails, TMessage>,
): z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodObject<{
        code: TCode;
        message: TMessage;
        details: TDetails;
    }>;
}>;
export function createApiErrorResponseSchema<
    TCode extends ZodType = typeof commonErrorCodeSchema,
>(
    codeSchema: TCode,
    description: string,
): z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodObject<{
        code: TCode;
        message: z.ZodString;
        details: DefaultDetailsSchema;
    }>;
}>;
export function createApiErrorResponseSchema<
    TCode extends ZodType = typeof commonErrorCodeSchema,
    TDetails extends ZodType = DefaultDetailsSchema,
>(
    codeSchema?: TCode,
    detailsSchema?: TDetails,
    description?: string,
): z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodObject<{
        code: TCode;
        message: z.ZodString;
        details: TDetails;
    }>;
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
    success: z.ZodLiteral<false>;
    error: z.ZodObject<{
        code: TCode;
        message: TMessage;
        details: TDetails;
    }>;
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
        description ?? 'Стандартный конверт ответа API с ошибкой';

    return z
        .object({
            success: z.literal(false).describe('Флаг успешности ответа'),
            error: z
                .object({
                    code: resolvedCode,
                    message: resolvedMessage,
                    details: resolvedDetails,
                })
                .describe('Объект с подробностями возникшей ошибки'),
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
    messageSchema: z
        .string()
        .default(COMMON_ERROR_MESSAGES.BAD_REQUEST)
        .describe(commonErrorMessageDescription),
    description: 'Стандартный конверт ответа API с ошибкой',
});

/**
 * Zod-схема ответа при внутренней непредвиденной ошибке сервера (HTTP 500).
 */
export const internalServerErrorResponseSchema = createApiErrorResponseSchema({
    codeSchema: z
        .literal('INTERNAL_SERVER_ERROR')
        .describe('Внутренняя непредвиденная ошибка сервера'),
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
    messageSchema: z
        .string()
        .default(COMMON_ERROR_MESSAGES.NOT_IMPLEMENTED)
        .describe(COMMON_ERROR_MESSAGES.NOT_IMPLEMENTED),
    description: 'Ответ API при обращении к нереализованному функционалу',
});

export type NotImplementedResponse = ApiErrorResponse<'NOT_IMPLEMENTED'>;

export type ApiErrorResponse<TCode extends string = CommonErrorCode> = {
    success: false;
    error: {
        code: TCode;
        message: string;
        details?: unknown;
    };
};

export const createErrorResponse = <TCode extends string = CommonErrorCode>(
    code: TCode,
    message?: string,
    details?: unknown,
): ApiErrorResponse<TCode> => {
    const resolveMessage =
        message ??
        (code in COMMON_ERROR_MESSAGES
            ? COMMON_ERROR_MESSAGES[code as CommonErrorCode]
            : `Ошибка: ${code}`);

    return {
        success: false,
        error: {
            code,
            message: resolveMessage,
            ...(details !== undefined ? { details } : {}),
        },
    };
};

export const createErrorFactory = <TCode extends string>(
    messages: Record<TCode, string>,
) => {
    return <T extends TCode | CommonErrorCode>(
        code: T,
        message?: string,
        details?: unknown,
    ): ApiErrorResponse<T> => {
        const resolveMessage =
            message ??
            (code in messages
                ? messages[code as TCode]
                : code in COMMON_ERROR_MESSAGES
                  ? COMMON_ERROR_MESSAGES[code as CommonErrorCode]
                  : `Ошибка: ${code}`);

        return {
            success: false,
            error: {
                code,
                message: resolveMessage,
                ...(details !== undefined ? { details } : {}),
            },
        };
    };
};
