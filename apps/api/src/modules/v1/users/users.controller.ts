import { createErrorResponse } from '@insignia/contracts/response';
import {
    createUserNotFoundErrorResponse,
    deleteUserEndpoint,
    takeMeEndpoint,
    takeUserByIdEndpoint,
    takeUsersEndpoint,
    updateUserEndpoint,
    wrapPaginatedPublicUsersResponse,
    wrapPublicUserResponse,
    wrapUserProfileResponse,
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
        async ({ headers }) => {
            const userId =
                headers['x-user-id'] ||
                headers['insignia-signet'] ||
                headers['authorization']?.replace(/^Bearer\s+/i, '');

            if (!userId) {
                return createUserNotFoundErrorResponse(
                    'Пользователь не найден.',
                );
            }

            const user = await usersService.takeMeById(userId);

            if (!user) {
                return createUserNotFoundErrorResponse(
                    'Пользователь не найден.',
                );
            }

            return wrapUserProfileResponse(user);
        },
        takeMeEndpoint,
    )
    .get(
        '/:id',
        async ({ params: { id } }) => {
            const user = await usersService.takePublicUserById(id);

            if (!user) {
                return createUserNotFoundErrorResponse(
                    'Пользователь не найден.',
                );
            }

            return wrapPublicUserResponse(user);
        },
        takeUserByIdEndpoint,
    )
    .get(
        '',
        async ({ query }) => {
            const { items, total } = await usersService.takeUsers(query);
            return wrapPaginatedPublicUsersResponse({
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
        () => createErrorResponse('NOT_IMPLEMENTED'),
        updateUserEndpoint,
    )
    .delete(
        '/:id',
        () => createErrorResponse('NOT_IMPLEMENTED'),
        deleteUserEndpoint,
    );
