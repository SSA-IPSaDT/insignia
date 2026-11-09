import { createErrorResponse } from '@insignia/contracts/response';
import {
    deleteTelegramAccountEndpoint,
    syncTelegramAccountEndpoint,
    takeTelegramAccountByIdEndpoint,
    updateTelegramAccountEndpoint,
} from '@insignia/contracts/users';
import Elysia from 'elysia';

export const telegram = new Elysia({
    name: 'v1.users.accounts.telegram',
    prefix: '/telegram',
    detail: {
        tags: ['Users: Telegram'],
        description:
            'Синхронизация и взаимодействие с учетной записью Telegram',
    },
})
    .post(
        '/sync',
        async ({ status }) => {
            return status(501, createErrorResponse('NOT_IMPLEMENTED'));
        },
        syncTelegramAccountEndpoint,
    )
    .get(
        '/:id',
        async ({ status }) => {
            return status(501, createErrorResponse('NOT_IMPLEMENTED'));
        },
        takeTelegramAccountByIdEndpoint,
    )
    .patch(
        '/:id',
        async ({ status }) => {
            return status(501, createErrorResponse('NOT_IMPLEMENTED'));
        },
        updateTelegramAccountEndpoint,
    )
    .delete(
        '/:id',
        async ({ status }) => {
            return status(501, createErrorResponse('NOT_IMPLEMENTED'));
        },
        deleteTelegramAccountEndpoint,
    );
