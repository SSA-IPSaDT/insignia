import { Temporal } from 'temporal-polyfill';
import { z } from 'zod';

import {
    plainTemporalDtoSchema,
    softDeleteSchema,
    timestampsSchema,
} from '../common';
import { phoneDtoSchema } from '../common/phone-number';

export const userBaseSchema = z
    .object({
        id: z
            .uuidv7(
                'Некорректный идентификатор пользователя (ожидается UUIDv7)',
            )
            .describe('Уникальный идентификатор пользователя (UUIDv7)'),

        avatarUrl: z
            .url('Некорректная ссылка на аватар')
            .max(2048, 'Ссылка на аватар не должна превышать 2048 символов')
            .nullable()
            .describe('Ссылка на аватар пользователя (до 2048 символов)'),

        lastName: z
            .string()
            .trim()
            .min(1, 'Фамилия не может быть пустой')
            .max(64, 'Фамилия не должна превышать 64 символа')
            .nullable()
            .describe('Фамилия пользователя (от 1 до 64 символов)'),
        firstName: z
            .string({ error: 'Имя обязательно для заполнения' })
            .trim()
            .min(1, 'Имя не может быть пустым')
            .max(64, 'Имя не должно превышать 64 символа')
            .describe('Имя пользователя (от 1 до 64 символов)'),
        patronymic: z
            .string()
            .trim()
            .min(1, 'Отчество не может быть пустым')
            .max(64, 'Отчество не должно превышать 64 символа')
            .nullable()
            .describe('Отчество пользователя (от 1 до 64 символов)'),

        email: z
            .email('Некорректный адрес электронной почты')
            .max(255, 'Email не должен превышать 255 символов')
            .nullable()
            .describe('Адрес электронной почты пользователя (до 255 символов)'),
        userName: z
            .string()
            .trim()
            .regex(
                /^[a-z0-9_-]{3,32}$/i,
                'Имя пользователя должно содержать от 3 до 32 символов (латиница, цифры, дефис, подчёркивание)',
            )
            .nullable()
            .describe(
                'Уникальное имя пользователя в системе (от 3 до 32 символов)',
            ),
        phone: phoneDtoSchema
            .nullable()
            .describe(
                'Номер телефона пользователя в международном формате E.164',
            ),

        birthDate: plainTemporalDtoSchema
            .refine(
                (d: Temporal.PlainDate) =>
                    Temporal.PlainDate.compare(d, '1940-01-01') >= 0,
                'Дата рождения не может быть раньше 1940 года',
            )
            .nullable()
            .describe(
                'Дата рождения пользователя в формате ISO-8601 (не ранее 1940 года)',
            ),

        maxOrganizationCanCreate: z
            .int('Значение должно быть целым числом')
            .nonnegative('Количество организаций не может быть отрицательным')
            .max(8, 'Максимальное количество создаваемых организаций — 8')
            .describe(
                'Максимальное количество организаций, которое может создать данный пользователь (до 8)',
            ),

        ...timestampsSchema.shape,
        ...softDeleteSchema.shape,
    })
    .describe(
        'Базовая схема сущности пользователя платформы Insignia со всеми атрибутами',
    );

export type UserBase = z.infer<typeof userBaseSchema>;
