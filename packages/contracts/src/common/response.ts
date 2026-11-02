import { z } from 'zod';
import type { ZodType } from 'zod';

export const commonErrorCodeSchema = z.enum([
    'BAD_REQUEST',
    'VALIDATION_ERROR',
    'UNAUTHORIZED',
    'FORBIDDEN',
    'NOT_FOUND',
    'CONFLICT',
    'INTERNAL_SERVER_ERROR',
    'SERVICE_UNAVAILABLE',
    'DATABASE_ERROR',
]);

export type CommonErrorCode = z.infer<typeof commonErrorCodeSchema>;

export const COMMON_ERROR_MESSAGES: Record<CommonErrorCode, string> = {
    BAD_REQUEST: 'Некорректный запрос.',
    VALIDATION_ERROR: 'Ошибка валидации входящих данных.',
    UNAUTHORIZED: 'Требуется аутентификация.',
    FORBIDDEN: 'Доступ к запрашиваемому ресурсу запрещён.',
    NOT_FOUND: 'Запрашиваемый ресурс не найден.',
    CONFLICT: 'Конфликт состояния данных.',
    INTERNAL_SERVER_ERROR: 'Внутренняя непредвиденная ошибка сервера.',
    SERVICE_UNAVAILABLE: 'Сервис временно недоступен. Попробуйте позже.',
    DATABASE_ERROR: 'Ошибка при взаимодействии с базой данных.',
} as const;

export const createApiResponseSchema = <T extends ZodType>(dataSchema: T) =>
    z.object({
        success: z.literal(true),
        data: dataSchema,
    });

export type ApiResponse<TData> = {
    success: true;
    data: TData;
};

export const createApiErrorResponseSchema = <
    TCode extends ZodType = typeof commonErrorCodeSchema,
>(
    codeSchema?: TCode,
) =>
    z.object({
        success: z.literal(false),
        error: z.object({
            code: codeSchema ?? commonErrorCodeSchema,
            message: z.string(),
            details: z.unknown().optional(),
        }),
    });

export const apiErrorResponseSchema = createApiErrorResponseSchema();

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

export const createSuccessResponse = <T>(data: T): ApiResponse<T> => ({
    success: true,
    data,
});
