import { z } from 'zod';

import { timestampsSchema } from '../../../common';

export const telegramAccountBaseSchema = z
    .object({
        id: z
            .uuidv7('Некорректный идентификатор (ожидается UUIDv7)')
            .describe(
                'Уникальный идентификатор записи аккаунта Telegram (UUIDv7)',
            ),

        photoUrl: z
            .url('Некорректная ссылка на аватар')
            .max(2048, 'Ссылка на аватар не должна превышать 2048 символов')
            .nullable()
            .describe('Ссылка на фото профиля Telegram (до 2048 символов)'),

        telegramId: z
            .bigint()
            .positive('Telegram ID должен быть положительным числом')
            .describe(
                'Уникальный 64-битный числовой идентификатор пользователя в Telegram (BigInt > 0)',
            ),

        lastName: z
            .string()
            .trim()
            .min(1, 'Фамилия не может быть пустой')
            .max(64, 'Фамилия не должна превышать 64 символа')
            .nullable()
            .describe('Фамилия пользователя в Telegram (до 64 символов)'),
        firstName: z
            .string({ error: 'Имя обязательно для заполнения' })
            .trim()
            .min(1, 'Имя не может быть пустым')
            .max(64, 'Имя не должно превышать 64 символа')
            .describe('Имя пользователя в Telegram (от 1 до 64 символов)'),

        userName: z
            .string()
            .trim()
            .regex(
                /^[A-Za-z0-9_]{4,32}$/,
                'Имя пользователя Telegram должно быть от 4 до 32 символов (латиница, цифры, подчёркивание)',
            )
            .nullable()
            .describe(
                'Имя пользователя (username) в Telegram без @ (от 4 до 32 символов)',
            ),

        isBot: z
            .boolean()
            .default(false)
            .describe(
                'Признак, является ли учетная запись ботом (false для пользователей)',
            ),
        isPremium: z
            .boolean()
            .default(false)
            .describe('Признак наличия активной подписки Telegram Premium'),
        languageCode: z
            .string()
            .trim()
            .min(2, 'Код языка должен содержать не менее 2 символов')
            .max(10, 'Код языка не должен превышать 10 символов')
            .default('ru')
            .describe('IETF-код языка интерфейса пользователя в Telegram'),
        allowsWriteToPm: z
            .boolean()
            .default(true)
            .describe(
                'Разрешена ли отправка сообщений пользователю в личные сообщения ботом',
            ),

        userId: z
            .uuidv7(
                'Некорректный идентификатор пользователя (ожидается UUIDv7)',
            )
            .describe(
                'Идентификатор связанного профиля пользователя Insignia (UUIDv7)',
            ),

        ...timestampsSchema.shape,
    })
    .describe(
        'Базовая схема связанной учетной записи Telegram платформы Insignia',
    );

export type TelegramAccountBase = z.infer<typeof telegramAccountBaseSchema>;
