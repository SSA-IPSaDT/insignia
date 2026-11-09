import Elysia from 'elysia';

import { healthController } from './health';
import { v1 } from './v1';

export const modules = new Elysia().use(healthController).use(v1);
