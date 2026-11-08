import Elysia from 'elysia';

import { accounts } from './accounts';

export const users = new Elysia({
    name: 'v1.users',
    prefix: '/users',
    detail: {
        tags: ['Users'],
        description: 'Операции с профилями пользователей платформы Insignia',
    },
}).use(accounts);
