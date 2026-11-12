import { z } from 'zod';

import {
    createDomainEndpoint,
    createDomainPaginatedResponse,
    createDomainResponse,
    type PaginatedApiResponse,
    type PaginatedData,
    paginationQuerySchema,
} from '../response';
import { organizationBaseSchema, organizationStatusSchema } from './base';
import {
    organizationAlreadyExistsErrorSchema,
    organizationNotFoundErrorResponseSchema,
} from './errors';
import {
    createOrganizationDtoSchema,
    type DeleteOrganizationDto,
    deleteOrganizationDtoSchema,
    type OrganizationDto,
    organizationDtoSchema,
    type PublicOrganizationDto,
    publicOrganizationDtoSchema,
    updateOrganizationDtoSchema,
} from './organization.dto';

export const takeOrganizationByIdParamsSchema = organizationBaseSchema
    .pick({
        id: true,
    })
    .describe('Параметры получения организации по идентификатору');

export type TakeOrganizationByIdParams = z.infer<
    typeof takeOrganizationByIdParamsSchema
>;

export const organizationSortFieldSchema = z
    .enum(['createdAt', 'name', 'status'])
    .default('createdAt')
    .describe('Поле для сортировки списка организаций');

export type OrganizationSortField = z.infer<typeof organizationSortFieldSchema>;

export const takeOrganizationsQuerySchema = paginationQuerySchema
    .extend({
        sortBy: organizationSortFieldSchema,
        status: organizationStatusSchema.optional(),
    })
    .describe('Параметры пагинации, поиска и фильтрации организаций');

export type TakeOrganizationsQuery = z.infer<
    typeof takeOrganizationsQuerySchema
>;

export const organizationResponse = createDomainResponse(
    organizationDtoSchema,
    'данными организации',
);

export const organizationResponseSchema = organizationResponse.schema;
export type OrganizationResponse = OrganizationDto;
export const createOrganizationResponse = organizationResponse.create;
export const wrapOrganizationResponse = organizationResponse.wrap;

export const paginatedOrganizationsResponse = createDomainPaginatedResponse(
    publicOrganizationDtoSchema,
    'списком организаций с пагинацией',
);

export const paginatedOrganizationsResponseSchema =
    paginatedOrganizationsResponse.schema;
export type PaginatedOrganizationsResponse =
    PaginatedData<PublicOrganizationDto>;
export const createPaginatedOrganizationsResponse =
    paginatedOrganizationsResponse.create;
export const wrapPaginatedOrganizationsResponse =
    paginatedOrganizationsResponse.wrap;

export const deleteOrganizationResponse = createDomainResponse(
    deleteOrganizationDtoSchema,
    'подтверждением удаления организации',
);

export const deleteOrganizationResponseSchema =
    deleteOrganizationResponse.schema;
export type DeleteOrganizationResponse = DeleteOrganizationDto;
export const createDeleteOrganizationResponse =
    deleteOrganizationResponse.create;
export const wrapDeleteOrganizationResponse = deleteOrganizationResponse.wrap;

export const takeOrganizationsEndpoint = createDomainEndpoint({
    query: takeOrganizationsQuerySchema,
    response: {
        200: paginatedOrganizationsResponseSchema,
    },
    detail: {
        tags: ['Organizations'],
        summary: 'Получить список организаций',
        description:
            'Возвращает пагинированный список организаций с поддержкой поиска и фильтрации',
    },
});

export const takeOrganizationsResponseSchema =
    takeOrganizationsEndpoint.response;

export const takeOrganizationByIdEndpoint = createDomainEndpoint({
    params: takeOrganizationByIdParamsSchema,
    response: {
        200: organizationResponseSchema,
        404: organizationNotFoundErrorResponseSchema,
    },
    detail: {
        tags: ['Organizations'],
        summary: 'Получить организацию по идентификатору',
        description: 'Возвращает подробные данные организации по её UUID',
    },
});

export const takeOrganizationByIdResponseSchema =
    takeOrganizationByIdEndpoint.response;

export const createOrganizationEndpoint = createDomainEndpoint({
    body: createOrganizationDtoSchema,
    response: {
        201: organizationResponseSchema,
        409: organizationAlreadyExistsErrorSchema,
    },
    detail: {
        tags: ['Organizations'],
        summary: 'Создание новой организации',
        description: 'Создает новую организацию от имени текущего пользователя',
    },
});

export const createOrganizationResponseSchema =
    createOrganizationEndpoint.response;

export const updateOrganizationEndpoint = createDomainEndpoint({
    params: takeOrganizationByIdParamsSchema,
    body: updateOrganizationDtoSchema,
    response: {
        200: organizationResponseSchema,
        404: organizationNotFoundErrorResponseSchema,
    },
    detail: {
        tags: ['Organizations'],
        summary: 'Обновление данных организации',
        description: 'Частично обновляет профиль и параметры организации',
    },
});

export const updateOrganizationResponseSchema =
    updateOrganizationEndpoint.response;

export const deleteOrganizationEndpoint = createDomainEndpoint({
    params: takeOrganizationByIdParamsSchema,
    response: {
        200: deleteOrganizationResponseSchema,
        404: organizationNotFoundErrorResponseSchema,
    },
    detail: {
        tags: ['Organizations'],
        summary: 'Удаление организации',
        description:
            'Выполняет мягкое удаление организации (soft delete) и деактивирует её',
    },
});

export const deleteOrganizationResponseSchemas =
    deleteOrganizationEndpoint.response;
