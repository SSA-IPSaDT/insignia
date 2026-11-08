import { serverTiming } from '@elysia/server-timing';
import env from '@insignia/env';
import { Elysia } from 'elysia';

import { modules } from '#modules';
import { corsPlugin, docsPlugin, errorPlugin, loggerPlugin } from '#plugins';

export const app = new Elysia()
    .use(corsPlugin)
    .use(loggerPlugin)
    .use(errorPlugin)
    .use(docsPlugin)
    .use(
        serverTiming({
            enabled: env.NODE_ENV !== 'production',
        }),
    )
    .get('/favicon.ico', ({ set }) => {
        set.status = 204;
    })
    .use(modules)
    .onStart((f) => {
        f.decorator.logger.info(
            `API running at ${env.PUBLIC_API_URL} in ${env.NODE_ENV} mode.`,
        );
    })
    .onStop((f) => {
        f.decorator.logger.info(`API stopped.`);
    });
