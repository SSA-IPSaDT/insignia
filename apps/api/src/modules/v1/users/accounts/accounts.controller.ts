import Elysia from 'elysia';

import { telegram } from './telegram';

export const accounts = new Elysia({
    name: 'v1.users.accounts',
    prefix: '/accounts',
    detail: {
        tags: ['Users: Accounts'],
        description: 'Управление внешними привязанными учетными записями',
    },
}).use(telegram);
