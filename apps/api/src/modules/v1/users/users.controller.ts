import { createErrorResponse } from '@insignia/contracts/response';
import {
    createPaginatedPublicUsersResponse,
    createPublicUserResponse,
    createUserNotFoundErrorResponse,
    createUserProfileResponse,
    deleteUserEndpoint,
    takeMeEndpoint,
    takeUserByIdEndpoint,
    takeUsersEndpoint,
    updateUserEndpoint,
} from '@insignia/contracts/users';
import Elysia from 'elysia';

import { accounts } from './accounts';
import * as usersService from './users.service';

export const users = new Elysia({
    name: 'v1.users',
    prefix: '/users',
    detail: {
        tags: ['Users'],
        description: 'Операции с профилями пользователей платформы Insignia',
    },
})
    .use(accounts)
    .get(
        '/me',
        async ({ headers, status }) => {
            const userId =
                headers['x-user-id'] ||
                headers['insignia-signet'] ||
                headers['authorization']?.replace(/^Bearer\s+/i, '');

            if (!userId) {
                return status(404, createUserNotFoundErrorResponse());
            }

            const user = await usersService.takeMeById(userId);

            if (!user) {
                return status(404, createUserNotFoundErrorResponse());
            }

            return createUserProfileResponse(user);
        },
        takeMeEndpoint,
    )
    .get(
        '/:id',
        async ({ params: { id }, status }) => {
            const user = await usersService.takePublicUserById(id);

            if (!user) {
                return status(404, createUserNotFoundErrorResponse());
            }

            return createPublicUserResponse(user);
        },
        takeUserByIdEndpoint,
    )
    .get(
        '',
        async ({ query }) => {
            const { items, total } = await usersService.takeUsers(query);
            return createPaginatedPublicUsersResponse({
                items,
                total,
                page: query.page,
                limit: query.limit,
            });
        },
        takeUsersEndpoint,
    )
    .patch(
        '/:id',
        async ({ status }) => {
            return status(501, createErrorResponse('NOT_IMPLEMENTED'));
        },
        updateUserEndpoint,
    )
    .delete(
        '/:id',
        async ({ status }) => {
            return status(501, createErrorResponse('NOT_IMPLEMENTED'));
        },
        deleteUserEndpoint,
    );
