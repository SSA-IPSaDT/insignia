import { z } from 'zod';

import { COMMON_ERROR_MESSAGES, createApiErrorResponseSchema } from './errors';

export const DEFAULT_VALIDATION_ERROR_MESSAGE =
    COMMON_ERROR_MESSAGES.VALIDATION_ERROR;

export const DEFAULT_INVALID_FIELD_MESSAGE = 'Некорректное значение поля';

/** Словарь ошибок валидации: имя_поля -> понятный текст ошибки */
export const validationFieldsSchema = z
    .record(z.string(), z.string())
    .describe(
        'Словарь ошибок валидации полей: имя_поля -> понятный текст ошибки',
    );
export type ValidationFields = z.infer<typeof validationFieldsSchema>;

export const validationErrorDetailsSchema = z
    .object({
        fields: validationFieldsSchema.describe(
            'Список полей, не прошедших валидацию входящих данных',
        ),
    })
    .describe('Детализированный контекст ошибки валидации');
export type ValidationErrorDetails = z.infer<
    typeof validationErrorDetailsSchema
>;

/** Схема ответа при ошибке валидации для API контроллеров */
export const validationErrorResponseSchema = createApiErrorResponseSchema(
    z
        .literal('VALIDATION_ERROR')
        .describe('Код ошибки валидации входящих данных'),
    validationErrorDetailsSchema,
).describe(
    'Ответ API с ошибкой валидации входящих данных (HTTP 422 Unprocessable Content)',
);

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
