import Elysia from 'elysia';

export const telegram = new Elysia({
    name: 'v1.users.accounts.telegram',
    prefix: '/telegram',
    detail: {
        tags: ['Users: Telegram'],
        description:
            'Синхронизация и взаимодействие с учетной записью Telegram',
    },
});
