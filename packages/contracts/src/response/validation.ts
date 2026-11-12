import { z } from 'zod';

import { COMMON_ERROR_MESSAGES } from './errors';

export const DEFAULT_VALIDATION_ERROR_MESSAGE =
    COMMON_ERROR_MESSAGES.VALIDATION_ERROR;

export const DEFAULT_INVALID_FIELD_MESSAGE = 'Некорректное значение поля';

/** Словарь ошибок валидации: имя_поля -> понятный текст ошибки */
export const validationFieldsSchema = z
    .record(z.string(), z.string())
    .describe('Словарь ошибок валидации полей');
export type ValidationFields = z.infer<typeof validationFieldsSchema>;

export const validationErrorDetailsSchema = z
    .object({
        fields: validationFieldsSchema.describe(
            'Список полей с ошибками валидации',
        ),
    })
    .describe('Контекст ошибки валидации');
export type ValidationErrorDetails = z.infer<
    typeof validationErrorDetailsSchema
>;

/** Схема ответа при ошибке валидации по стандарту RFC 9457 Problem Details */
export const validationErrorResponseSchema = z
    .object({
        type: z
            .string()
            .default('/problems/validation-error')
            .describe('Каноничный URI документации ошибки валидации'),
        title: z
            .string()
            .default(DEFAULT_VALIDATION_ERROR_MESSAGE)
            .describe('Краткий заголовок проблемы'),
        status: z
            .literal(422)
            .default(422)
            .describe('HTTP статус 422 Unprocessable Content'),
        detail: z
            .string()
            .default(DEFAULT_VALIDATION_ERROR_MESSAGE)
            .describe('Подробности ошибки валидации'),
        instance: z.string().default('/').describe('URI маршрута запроса'),
        code: z
            .literal('VALIDATION_ERROR')
            .default('VALIDATION_ERROR')
            .describe('Машиночитаемый код ошибки валидации'),
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
            .describe('Список невалидных параметров запроса'),
        details: validationErrorDetailsSchema.optional(),
    })
    .describe('Ответ API с ошибкой валидации входящих данных');

export type ValidationErrorResponse = z.infer<
    typeof validationErrorResponseSchema
>;

export const createValidationErrorResponse = (
    fields: ValidationFields,
    detail: string = DEFAULT_VALIDATION_ERROR_MESSAGE,
    options?: { instance?: string },
): ValidationErrorResponse => {
    const invalidParams = Object.entries(fields).map(([name, reason]) => ({
        name,
        reason,
    }));

    return {
        type: '/problems/validation-error',
        title: DEFAULT_VALIDATION_ERROR_MESSAGE,
        status: 422,
        detail,
        instance: options?.instance ?? '/',
        code: 'VALIDATION_ERROR',
        invalidParams,
        details: { fields },
    };
};
