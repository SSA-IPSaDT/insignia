import Elysia from 'elysia';

import { organizations } from './organizations';
import { users } from './users';

export const v1 = new Elysia({
    name: 'v1',
    prefix: '/v1',
})
    .use(users)
    .use(organizations);
