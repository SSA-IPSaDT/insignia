import type { z } from 'zod';

import { createDomainErrors } from '../../../response';

export const telegramAccountErrors = createDomainErrors({
    domain: 'аккаунта Telegram',
    notFoundCode: 'TELEGRAM_ACCOUNT_NOT_FOUND',
    notFoundDescription: 'Конверт ответа с ошибкой: аккаунт Telegram не найден',
    messages: {
        TELEGRAM_ACCOUNT_NOT_FOUND: 'Аккаунт Telegram не найден.',
        TELEGRAM_ACCOUNT_ALREADY_EXISTS:
            'Аккаунт Telegram с таким идентификатором уже привязан к пользователю.',
        TELEGRAM_SYNC_FAILED:
            'Не удалось синхронизировать данные аккаунта Telegram.',
        TELEGRAM_AUTH_INVALID:
            'Недействительные данные авторизации Telegram (initData).',
        TELEGRAM_ACCOUNT_DETACH_FAILED: 'Не удалось отвязать аккаунт Telegram.',
    } as const,
});

export type TelegramAccountErrorCode = z.infer<
    typeof telegramAccountErrors.codeSchema
>;
export type TelegramAccountErrorResponse = z.infer<
    typeof telegramAccountErrors.errorResponseSchema
>;
export type TelegramAccountNotFoundErrorResponse = z.infer<
    typeof telegramAccountErrors.notFoundSchema
>;

export const telegramAccountErrorCodeSchema = telegramAccountErrors.codeSchema;
export const TELEGRAM_ACCOUNT_ERROR_MESSAGES = telegramAccountErrors.messages;
export const telegramAccountErrorResponseSchema =
    telegramAccountErrors.errorResponseSchema;
export const telegramAccountNotFoundErrorResponseSchema =
    telegramAccountErrors.notFoundSchema!;
export const createTelegramAccountErrorResponse =
    telegramAccountErrors.createError;
export const createTelegramAccountNotFoundErrorResponse =
    telegramAccountErrors.createNotFound!;
