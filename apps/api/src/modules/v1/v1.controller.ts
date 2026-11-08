import Elysia from 'elysia';

import { users } from './users';

export const v1 = new Elysia({
    name: 'v1',
    prefix: '/v1',
}).use(users);
