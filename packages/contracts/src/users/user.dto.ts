import { z } from 'zod';

import { nullToUndefined } from '../common';
import { userBaseSchema } from './base';

export const publicUserDtoSchema = nullToUndefined(
    userBaseSchema.pick({
        id: true,
        lastName: true,
        firstName: true,
        patronymic: true,
        avatarUrl: true,
        userName: true,
    }),
).describe('Публичный профиль пользователя');

export type PublicUserDto = z.infer<typeof publicUserDtoSchema>;

export const userProfileDtoSchema = nullToUndefined(
    userBaseSchema.omit({
        deletedAt: true,
    }),
).describe('Полный профиль пользователя');

export type UserProfileDTO = z.infer<typeof userProfileDtoSchema>;
export const userDtoSchema = userProfileDtoSchema;
export type UserDto = UserProfileDTO;

export const updateUserDtoSchema = z
    .object({
        firstName: userBaseSchema.shape.firstName.optional(),
        lastName: userBaseSchema.shape.lastName.optional(),
        patronymic: userBaseSchema.shape.patronymic.optional(),
        avatarUrl: userBaseSchema.shape.avatarUrl.optional(),
        userName: userBaseSchema.shape.userName.optional(),
        email: userBaseSchema.shape.email.optional(),
        phone: userBaseSchema.shape.phone.optional(),
        birthDate: userBaseSchema.shape.birthDate.optional(),
    })
    .describe('Данные для частичного обновления профиля пользователя');

export type UpdateUserDto = z.infer<typeof updateUserDtoSchema>;

export const deleteUserDtoSchema = z
    .object({
        id: z
            .uuidv7(
                'Некорректный идентификатор пользователя (ожидается UUIDv7)',
            )
            .describe('Идентификатор удаленного пользователя'),
        deleted: z.boolean().describe('Флаг подтверждения удаления'),
    })
    .describe('Результат удаления профиля пользователя');

export type DeleteUserDto = z.infer<typeof deleteUserDtoSchema>;
