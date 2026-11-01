import {} from '@elysia/openapi';
import { env } from '@insignia/env';
import { loggerPlugin } from '@plugins';
import { Elysia } from 'elysia';

import { modules } from './modules';

export const app = new Elysia()
    .use(loggerPlugin)
    .use(modules)
    .get('/', ({ logger }) => {
        // logger.debug('проверка работы');
        return 'hello, world!';
    })
    .onStart((f) => {
        f.decorator.logger.info(`API initialized in ${env.NODE_ENV} mode.`);
    })
    .onStop((f) => {
        f.decorator.logger.info(`API stopped.`);
    });
