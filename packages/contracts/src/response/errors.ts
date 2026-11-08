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
        'SERVICE_UNAVAILABLE',
        'DATABASE_ERROR',
    ])
    .describe('Стандартизированный код ошибки API платформы Insignia');

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

export const createApiErrorResponseSchema = <
    TCode extends ZodType = typeof commonErrorCodeSchema,
    TDetails extends ZodType = z.ZodOptional<z.ZodUnknown>,
>(
    codeSchema?: TCode,
    detailsSchema?: TDetails,
) =>
    z
        .object({
            success: z
                .literal(false)
                .describe('Флаг успешности ответа (всегда false при ошибке)'),
            error: z
                .object({
                    code: (
                        (codeSchema ?? commonErrorCodeSchema) as TCode
                    ).describe('Машиночитаемый код категории ошибки'),
                    message: z
                        .string()
                        .describe('Понятное человеку описание причины ошибки'),
                    details: (
                        (detailsSchema ?? z.unknown().optional()) as TDetails
                    ).describe(
                        'Дополнительные контекстные данные или детализация ошибки',
                    ),
                })
                .describe('Объект с подробностями возникшей ошибки'),
        })
        .describe('Стандартный конверт ответа API с ошибкой');

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
