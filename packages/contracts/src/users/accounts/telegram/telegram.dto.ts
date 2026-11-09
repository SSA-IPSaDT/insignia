import { z } from 'zod';

import { nullToUndefined } from '../../../common';
import { telegramAccountBaseSchema } from './base';

export const telegramAccountDtoSchema = nullToUndefined(
    telegramAccountBaseSchema,
).describe('Данные учетной записи Telegram');

export type TelegramAccountDto = z.infer<typeof telegramAccountDtoSchema>;

export const updateTelegramAccountDtoSchema = z
    .object({
        allowsWriteToPm:
            telegramAccountBaseSchema.shape.allowsWriteToPm.optional(),
        languageCode: telegramAccountBaseSchema.shape.languageCode.optional(),
    })
    .describe('Данные для обновления параметров аккаунта Telegram');

export type UpdateTelegramAccountDto = z.infer<
    typeof updateTelegramAccountDtoSchema
>;

export const syncTelegramAccountDtoSchema = z
    .object({
        initData: z
            .string()
            .trim()
            .min(1, 'initData не может быть пустой строкой')
            .describe('Сырая строка валидации Telegram WebApp (initData)'),
    })
    .describe('Данные для синхронизации аккаунта Telegram');

export type SyncTelegramAccountDto = z.infer<
    typeof syncTelegramAccountDtoSchema
>;

export const deleteTelegramAccountDtoSchema = z
    .object({
        id: z
            .uuidv7(
                'Некорректный идентификатор аккаунта Telegram (ожидается UUIDv7)',
            )
            .describe('Идентификатор отвязанного аккаунта Telegram'),
        detached: z.boolean().describe('Флаг подтверждения отвязки аккаунта'),
    })
    .describe('Результат отвязки аккаунта Telegram');

export type DeleteTelegramAccountDto = z.infer<
    typeof deleteTelegramAccountDtoSchema
>;
