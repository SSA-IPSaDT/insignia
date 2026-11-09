import { z } from 'zod';

import { softDeleteSchema, timestampsSchema } from '../common';

export const organizationStatusSchema = z
    .enum(['active', 'archived'])
    .describe('Статус организации');

export type OrganizationStatus = z.infer<typeof organizationStatusSchema>;

export const organizationBaseSchema = z
    .object({
        id: z
            .uuidv7('Некорректный идентификатор организации (ожидается UUIDv7)')
            .describe('Уникальный идентификатор организации'),

        logoUrl: z
            .url('Некорректная ссылка на логотип')
            .max(2048, 'Ссылка на логотип не должна превышать 2048 символов')
            .nullable()
            .describe('Ссылка на логотип организации'),

        name: z
            .string({ error: 'Название организации обязательно' })
            .trim()
            .min(2, 'Название организации должно содержать не менее 2 символов')
            .max(128, 'Название организации не должно превышать 128 символов')
            .describe('Официальное название организации'),

        slug: z
            .string()
            .trim()
            .min(3, 'Slug должен содержать не менее 3 символов')
            .max(64, 'Slug не должен превышать 64 символов')
            .regex(
                /^[a-z0-9_-]+$/,
                'Slug может содержать только строчные латинские буквы, цифры, дефис и подчеркивание',
            )
            .nullable()
            .describe('Уникальный короткий URL-идентификатор организации'),

        description: z
            .string()
            .trim()
            .max(2048, 'Описание организации не должно превышать 2048 символов')
            .nullable()
            .describe('Публичное описание деятельности организации'),

        isVerified: z
            .boolean()
            .default(false)
            .describe('Признак верификации организации администрацией'),

        ownerId: z
            .uuidv7(
                'Некорректный идентификатор владельца организации (ожидается UUIDv7)',
            )
            .nullable()
            .describe('Идентификатор пользователя-владельца организации'),

        status: organizationStatusSchema
            .default('active')
            .describe('Текущий статус организации'),

        ...timestampsSchema.shape,
        ...softDeleteSchema.shape,
    })
    .describe('Базовая схема сущности организации');

export type OrganizationBase = z.infer<typeof organizationBaseSchema>;
