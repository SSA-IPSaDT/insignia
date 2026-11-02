import { serverTiming } from '@elysia/server-timing';
import { apiEnv } from '@insignia/env';
import { Elysia } from 'elysia';

import { modules } from '#modules';
import { corsPlugin, docsPlugin, loggerPlugin } from '#plugins';

export const app = new Elysia()
    .use(corsPlugin)
    .use(loggerPlugin)
    .use(docsPlugin)
    .use(
        serverTiming({
            enabled: apiEnv.NODE_ENV !== 'production',
        }),
    )
    .use(modules)
    .onStart((f) => {
        f.decorator.logger.info(
            `API running at http://${apiEnv.API_HOST}:${apiEnv.API_PORT} in ${apiEnv.NODE_ENV} mode.`,
        );
    })
    .onStop((f) => {
        f.decorator.logger.info(`API stopped.`);
    });
