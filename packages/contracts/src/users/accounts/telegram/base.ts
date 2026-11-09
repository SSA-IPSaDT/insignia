import { z } from 'zod';

import { timestampsSchema } from '../../../common';

export const telegramAccountBaseSchema = z
    .object({
        id: z
            .uuidv7('Некорректный идентификатор (ожидается UUIDv7)')
            .describe('Уникальный идентификатор записи аккаунта Telegram'),

        photoUrl: z
            .url('Некорректная ссылка на аватар')
            .max(2048, 'Ссылка на аватар не должна превышать 2048 символов')
            .nullable()
            .describe('Ссылка на фото профиля Telegram'),

        telegramId: z
            .bigint()
            .positive('Telegram ID должен быть положительным числом')
            .describe('Идентификатор пользователя в Telegram'),

        lastName: z
            .string()
            .trim()
            .min(1, 'Фамилия не может быть пустой')
            .max(64, 'Фамилия не должна превышать 64 символа')
            .nullable()
            .describe('Фамилия пользователя в Telegram'),
        firstName: z
            .string({ error: 'Имя обязательно для заполнения' })
            .trim()
            .min(1, 'Имя не может быть пустым')
            .max(64, 'Имя не должно превышать 64 символа')
            .describe('Имя пользователя в Telegram'),

        userName: z
            .string()
            .trim()
            .regex(
                /^[A-Za-z0-9_]{4,32}$/,
                'Имя пользователя Telegram должно быть от 4 до 32 символов (латиница, цифры, подчёркивание)',
            )
            .nullable()
            .describe('Имя пользователя в Telegram без @'),

        isBot: z.boolean().default(false).describe('Признак бота'),
        isPremium: z
            .boolean()
            .default(false)
            .describe('Признак наличия Telegram Premium'),
        languageCode: z
            .string()
            .trim()
            .min(2, 'Код языка должен содержать не менее 2 символов')
            .max(10, 'Код языка не должен превышать 10 символов')
            .default('ru')
            .describe('Код языка интерфейса пользователя в Telegram'),
        allowsWriteToPm: z
            .boolean()
            .default(true)
            .describe('Разрешение на отправку сообщений ботом'),

        userId: z
            .uuidv7(
                'Некорректный идентификатор пользователя (ожидается UUIDv7)',
            )
            .describe('Идентификатор профиля пользователя'),

        ...timestampsSchema.shape,
    })
    .describe('Базовая схема учетной записи Telegram');

export type TelegramAccountBase = z.infer<typeof telegramAccountBaseSchema>;
