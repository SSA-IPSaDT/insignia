import Elysia from 'elysia';

import { healthController } from './health';
import { problemsController } from './problems';
import { v1 } from './v1';

export const modules = new Elysia()
    .use(healthController)
    .use(problemsController)
    .use(v1);
