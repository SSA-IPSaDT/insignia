import { z } from 'zod';

import { COMMON_ERROR_MESSAGES, createApiErrorResponseSchema } from './errors';

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

/** Схема ответа при ошибке валидации для API контроллеров */
export const validationErrorResponseSchema = createApiErrorResponseSchema({
    codeSchema: z.literal('VALIDATION_ERROR').describe('Код ошибки валидации'),
    detailsSchema: validationErrorDetailsSchema,
    messageSchema: z
        .string()
        .describe(DEFAULT_VALIDATION_ERROR_MESSAGE)
        .default(DEFAULT_VALIDATION_ERROR_MESSAGE),
    description: 'Ответ API с ошибкой валидации',
});

export type ValidationErrorResponse = z.infer<
    typeof validationErrorResponseSchema
>;

export const createValidationErrorResponse = (
    fields: ValidationFields,
    message: string = DEFAULT_VALIDATION_ERROR_MESSAGE,
): ValidationErrorResponse => ({
    success: false,
    error: {
        code: 'VALIDATION_ERROR',
        message,
        details: { fields },
    },
});
