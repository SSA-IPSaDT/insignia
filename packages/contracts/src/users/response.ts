import { z } from 'zod';

import {
    createDomainEndpoint,
    createDomainPaginatedResponse,
    createDomainResponse,
    type PaginatedApiResponse,
    type PaginatedData,
    paginationQuerySchema,
} from '../response';
import { userBaseSchema } from './base';
import { userNotFoundErrorResponseSchema } from './errors';
import {
    type DeleteUserDto,
    deleteUserDtoSchema,
    type PublicUserDto,
    publicUserDtoSchema,
    type UpdateUserDto,
    updateUserDtoSchema,
    type UserProfileDTO,
    userProfileDtoSchema,
} from './user.dto';

/**
 * Схема параметров пути для получения пользователя по идентификатору (UUIDv7).
 */
export const takeUserByIdParamsSchema = userBaseSchema
    .pick({
        id: true,
    })
    .describe('Параметры получения пользователя по идентификатору');

export type TakeUserByIdParams = z.infer<typeof takeUserByIdParamsSchema>;

/**
 * Доступные поля для сортировки пользователей.
 */
export const userSortFieldSchema = z
    .enum(['createdAt', 'firstName', 'lastName', 'userName', 'email'])
    .default('createdAt')
    .describe('Поле для сортировки списка пользователей');

export type UserSortField = z.infer<typeof userSortFieldSchema>;

/**
 * Zod-схема query-параметров для получения списка пользователей с пагинацией и поиском.
 */
export const takeUsersQuerySchema = paginationQuerySchema
    .extend({
        sortBy: userSortFieldSchema,
    })
    .describe('Параметры пагинации, поиска и сортировки списка пользователей');

export type TakeUsersQuery = z.infer<typeof takeUsersQuerySchema>;

/**
 * Схема и конструктор успешного ответа с публичным профилем пользователя.
 */
export const publicUserResponse = createDomainResponse(
    publicUserDtoSchema,
    'публичным профилем пользователя',
);

export const publicUserResponseSchema = publicUserResponse.schema;
export type PublicUserResponse = PublicUserDto;
export const createPublicUserResponse = publicUserResponse.create;
export const wrapPublicUserResponse = publicUserResponse.wrap;

/**
 * Пагинированная схема и конструктор успешного ответа со списком пользователей.
 */
export const paginatedPublicUsersResponse = createDomainPaginatedResponse(
    publicUserDtoSchema,
    'списком пользователей с пагинацией',
);

export const paginatedPublicUsersResponseSchema =
    paginatedPublicUsersResponse.schema;
export type PaginatedPublicUsersResponse = PaginatedData<PublicUserDto>;
export const createPaginatedPublicUsersResponse =
    paginatedPublicUsersResponse.create;
export const wrapPaginatedPublicUsersResponse =
    paginatedPublicUsersResponse.wrap;

/**
 * Схема и конструктор успешного ответа с полным профилем пользователя (ручка me / профиль).
 */
export const userProfileResponse = createDomainResponse(
    userProfileDtoSchema,
    'профилем пользователя',
);

export const userProfileResponseSchema = userProfileResponse.schema;
export type UserProfileResponse = UserProfileDTO;
export const createUserProfileResponse = userProfileResponse.create;
export const wrapUserProfileResponse = userProfileResponse.wrap;

/**
 * Контракт маршрута GET v1/users/me (получение полного профиля текущего пользователя).
 */
export const takeMeEndpoint = createDomainEndpoint({
    detail: {
        tags: ['Users'],
        summary: 'Получить профиль текущего пользователя',
        description:
            'Возвращает полный профиль текущего пользователя платформы Insignia',
    },
    response: {
        200: userProfileResponseSchema,
        404: userNotFoundErrorResponseSchema,
    },
});

export const takeMeResponseSchema = takeMeEndpoint.response;

/**
 * Контракт маршрута v1/users/:id (take-by-id)
 */
export const takeUserByIdEndpoint = createDomainEndpoint({
    params: takeUserByIdParamsSchema,
    detail: {
        tags: ['Users'],
        summary: 'Получить пользователя по уникальному идентификатору',
        description: 'Возвращает публичный профиль пользователя',
    },
    response: {
        200: publicUserResponseSchema,
        404: userNotFoundErrorResponseSchema,
    },
});

export const takeUserByIdResponseSchema = takeUserByIdEndpoint.response;

/**
 * Контракт маршрута v1/users (получение списка пользователей с пагинацией)
 */
export const takeUsersEndpoint = createDomainEndpoint({
    query: takeUsersQuerySchema,
    response: {
        200: paginatedPublicUsersResponseSchema,
    },
    detail: {
        tags: ['Users'],
        summary: 'Получить список пользователей',
        description:
            'Возвращает пагинированный список публичных профилей пользователей с поддержкой поиска и сортировки',
    },
});

export const takeUsersResponseSchema = takeUsersEndpoint.response;

/**
 * Конверт и конструктор успешного ответа при удалении пользователя.
 */
export const deleteUserResponse = createDomainResponse(
    deleteUserDtoSchema,
    'подтверждением удаления пользователя',
);

export const deleteUserResponseSchema = deleteUserResponse.schema;
export type DeleteUserResponse = DeleteUserDto;
export const createDeleteUserResponse = deleteUserResponse.create;
export const wrapDeleteUserResponse = deleteUserResponse.wrap;

/**
 * Контракт маршрута PATCH v1/users/:id (частичное обновление профиля пользователя).
 */
export const updateUserEndpoint = createDomainEndpoint({
    params: takeUserByIdParamsSchema,
    body: updateUserDtoSchema,
    response: {
        200: publicUserResponseSchema,
        404: userNotFoundErrorResponseSchema,
    },
    detail: {
        tags: ['Users'],
        summary: 'Частичное обновление профиля пользователя',
        description:
            'Обновляет переданные атрибуты профиля пользователя (имя, фамилию, аватар, контакты)',
    },
});

export const updateUserResponseSchema = updateUserEndpoint.response;

/**
 * Контракт маршрута DELETE v1/users/:id (мягкое удаление пользователя).
 */
export const deleteUserEndpoint = createDomainEndpoint({
    params: takeUserByIdParamsSchema,
    response: {
        200: deleteUserResponseSchema,
        404: userNotFoundErrorResponseSchema,
    },
    detail: {
        tags: ['Users'],
        summary: 'Удаление профиля пользователя',
        description:
            'Выполняет мягкое удаление профиля пользователя (soft delete)',
    },
});

export const deleteUserResponseSchemas = deleteUserEndpoint.response;
