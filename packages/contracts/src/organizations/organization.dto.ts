import type { z } from 'zod';

import { nullToUndefined } from '../common';
import { organizationBaseSchema, organizationStatusSchema } from './base';

export const organizationDtoSchema = nullToUndefined(
    organizationBaseSchema.omit({
        deletedAt: true,
    }),
).describe('Полные данные организации');

export type OrganizationDto = z.infer<typeof organizationDtoSchema>;

export const publicOrganizationDtoSchema = nullToUndefined(
    organizationBaseSchema.pick({
        id: true,
        logoUrl: true,
        name: true,
        slug: true,
        description: true,
        isVerified: true,
        status: true,
        createdAt: true,
    }),
).describe('Публичная карточка организации');

export type PublicOrganizationDto = z.infer<typeof publicOrganizationDtoSchema>;

export const createOrganizationDtoSchema = organizationBaseSchema
    .pick({
        name: true,
    })
    .extend({
        slug: organizationBaseSchema.shape.slug.optional(),
        description: organizationBaseSchema.shape.description.optional(),
        logoUrl: organizationBaseSchema.shape.logoUrl.optional(),
    })
    .describe('Данные для создания новой организации');

export type CreateOrganizationDto = z.infer<typeof createOrganizationDtoSchema>;

export const updateOrganizationDtoSchema = organizationBaseSchema
    .pick({
        name: true,
        slug: true,
        description: true,
        logoUrl: true,
        status: true,
    })
    .partial()
    .describe('Данные для частичного обновления организации');

export type UpdateOrganizationDto = z.infer<typeof updateOrganizationDtoSchema>;

export const deleteOrganizationDtoSchema = organizationBaseSchema
    .pick({
        id: true,
    })
    .extend({
        deleted: organizationBaseSchema.shape.isVerified
            .unwrap()
            .describe('Флаг подтверждения удаления'),
    })
    .describe('Результат удаления организации');

export type DeleteOrganizationDto = z.infer<typeof deleteOrganizationDtoSchema>;
