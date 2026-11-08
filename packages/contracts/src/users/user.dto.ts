import { z } from 'zod';

import { userBaseSchema } from './base';

const base = userBaseSchema.shape;

export const publicUserDtoSchema = z
    .object({
        id: base.id.describe('Уникальный идентификатор пользователя (UUIDv7)'),

        lastName: base.lastName
            .unwrap()
            .optional()
            .describe('Фамилия пользователя (опционально)'),
        firstName: base.firstName.describe('Имя пользователя'),
        patronymic: base.patronymic
            .unwrap()
            .optional()
            .describe('Отчество пользователя (опционально)'),
        avatarUrl: base.avatarUrl
            .unwrap()
            .optional()
            .describe('Ссылка на публичный аватар пользователя'),
        userName: base.userName
            .unwrap()
            .optional()
            .describe('Публичное имя пользователя (юзернейм)'),
    })
    .describe(
        'Публичный профиль пользователя для отображения другим участникам платформы',
    );

export type PublicUserDto = z.infer<typeof publicUserDtoSchema>;

export const userProfileDtoSchema = z
    .object({
        id: base.id.describe('Уникальный идентификатор пользователя (UUIDv7)'),

        avatarUrl: base.avatarUrl
            .unwrap()
            .optional()
            .describe('Ссылка на аватар пользователя'),

        lastName: base.lastName
            .unwrap()
            .optional()
            .describe('Фамилия пользователя'),
        firstName: base.firstName.describe('Имя пользователя'),
        patronymic: base.patronymic
            .unwrap()
            .optional()
            .describe('Отчество пользователя'),

        userName: base.userName
            .unwrap()
            .optional()
            .describe('Уникальное имя пользователя (юзернейм)'),
        email: base.email
            .unwrap()
            .optional()
            .describe('Адрес электронной почты пользователя'),
        phone: base.phone
            .unwrap()
            .optional()
            .describe(
                'Номер телефона пользователя в международном формате E.164',
            ),

        birthDate: base.birthDate
            .unwrap()
            .optional()
            .describe('Календарная дата рождения пользователя'),

        maxOrganizationCanCreate: base.maxOrganizationCanCreate.describe(
            'Максимальное количество организаций, доступное для создания данным пользователем',
        ),

        createdAt: base.createdAt.describe(
            'Временная метка регистрации профиля (ISO-8601 UTC)',
        ),
        updatedAt: base.updatedAt.describe(
            'Временная метка последнего обновления профиля (ISO-8601 UTC)',
        ),
    })
    .describe(
        'Полный профиль текущего авторизованного пользователя платформы Insignia',
    );
export type UserProfileDTO = z.infer<typeof userProfileDtoSchema>;
export const userDtoSchema = userProfileDtoSchema;
export type UserDto = UserProfileDTO;
