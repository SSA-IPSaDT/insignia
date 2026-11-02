import Elysia from 'elysia';

import { healthController } from './health';

export const modules = new Elysia().use(healthController);
