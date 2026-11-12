import type { z } from 'zod';

import {
    type ApiResponse,
    createDomainEndpoint,
    createDomainResponse,
} from '../../../response';
import { telegramAccountBaseSchema } from './base';
import { telegramAccountNotFoundErrorResponseSchema } from './errors';
import {
    type DeleteTelegramAccountDto,
    deleteTelegramAccountDtoSchema,
    syncTelegramAccountDtoSchema,
    type TelegramAccountDto,
    telegramAccountDtoSchema,
    updateTelegramAccountDtoSchema,
} from './telegram.dto';

export const takeTelegramAccountByIdParamsSchema = telegramAccountBaseSchema
    .pick({
        id: true,
    })
    .describe('Параметры пути для получения аккаунта Telegram');

export type TakeTelegramAccountByIdParams = z.infer<
    typeof takeTelegramAccountByIdParamsSchema
>;

export const telegramAccountResponse = createDomainResponse(
    telegramAccountDtoSchema,
    'данными аккаунта Telegram',
);

export const telegramAccountResponseSchema = telegramAccountResponse.schema;
export type TelegramAccountResponse = TelegramAccountDto;
export const createTelegramAccountResponse = telegramAccountResponse.create;
export const wrapTelegramAccountResponse = telegramAccountResponse.wrap;

export const deleteTelegramAccountResponse = createDomainResponse(
    deleteTelegramAccountDtoSchema,
    'подтверждением отвязки аккаунта Telegram',
);

export const deleteTelegramAccountResponseSchema =
    deleteTelegramAccountResponse.schema;
export type DeleteTelegramAccountResponse = DeleteTelegramAccountDto;
export const createDeleteTelegramAccountResponse =
    deleteTelegramAccountResponse.create;
export const wrapDeleteTelegramAccountResponse =
    deleteTelegramAccountResponse.wrap;

export const syncTelegramAccountEndpoint = createDomainEndpoint({
    body: syncTelegramAccountDtoSchema,
    response: {
        200: telegramAccountResponseSchema,
    },
    detail: {
        tags: ['Users: Telegram'],
        summary: 'Синхронизация учетной записи Telegram',
        description:
            'Синхронизирует профиль Telegram с профилем пользователя по данным initData WebApp',
    },
});

export const takeTelegramAccountByIdEndpoint = createDomainEndpoint({
    params: takeTelegramAccountByIdParamsSchema,
    response: {
        200: telegramAccountResponseSchema,
        404: telegramAccountNotFoundErrorResponseSchema,
    },
    detail: {
        tags: ['Users: Telegram'],
        summary: 'Получить аккаунт Telegram по идентификатору',
        description: 'Возвращает данные привязанного аккаунта Telegram',
    },
});

export const updateTelegramAccountEndpoint = createDomainEndpoint({
    params: takeTelegramAccountByIdParamsSchema,
    body: updateTelegramAccountDtoSchema,
    response: {
        200: telegramAccountResponseSchema,
        404: telegramAccountNotFoundErrorResponseSchema,
    },
    detail: {
        tags: ['Users: Telegram'],
        summary: 'Обновление настроек аккаунта Telegram',
        description:
            'Обновляет параметры взаимодействия (разрешение на отправку в ЛС, язык интерфейса)',
    },
});

export const deleteTelegramAccountEndpoint = createDomainEndpoint({
    params: takeTelegramAccountByIdParamsSchema,
    response: {
        200: deleteTelegramAccountResponseSchema,
        404: telegramAccountNotFoundErrorResponseSchema,
    },
    detail: {
        tags: ['Users: Telegram'],
        summary: 'Отвязка аккаунта Telegram',
        description:
            'Отвязывает учетную запись Telegram от профиля пользователя',
    },
});
