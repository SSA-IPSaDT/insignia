import type { z } from 'zod';

import { createDomainErrors } from '../response';

export const userErrors = createDomainErrors({
    domain: 'пользователя',
    notFoundCode: 'USER_NOT_FOUND',
    notFoundDescription: 'Конверт ответа с ошибкой: пользователь не найден',
    messages: {
        USER_NOT_FOUND: 'Пользователь не найден.',
        USER_ALREADY_EXISTS: 'Пользователь с такими данными уже существует.',
        USER_CREATE_FAILED: 'Не удалось создать профиль пользователя.',
        USER_UPDATE_FAILED: 'Не удалось обновить данные пользователя.',
        USER_DELETE_FAILED: 'Не удалось удалить пользователя.',
        USER_BLOCKED: 'Профиль пользователя заблокирован.',
    } as const,
});

export type UserErrorCode = z.infer<typeof userErrors.codeSchema>;
export type UserErrorResponse = z.infer<typeof userErrorResponseSchema>;
export type UserNotFoundErrorResponse = z.infer<
    typeof userNotFoundErrorResponseSchema
>;

export const userErrorCodeSchema = userErrors.codeSchema;
export const USER_ERROR_MESSAGES = userErrors.messages;
export const userErrorResponseSchema = userErrors.errorResponseSchema;
export const userNotFoundErrorResponseSchema = userErrors.notFoundSchema!;
export const createUserErrorResponse = userErrors.createError;
export const createUserNotFoundErrorResponse = userErrors.createNotFound!;
