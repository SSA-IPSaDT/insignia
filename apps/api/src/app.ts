import { serverTiming } from '@elysia/server-timing';
import { env } from '@insignia/env';
import { modules } from '@modules';
import { corsPlugin, docsPlugin, loggerPlugin } from '@plugins';
import { Elysia } from 'elysia';

export const app = new Elysia()
    .use(corsPlugin)
    .use(loggerPlugin)
    .use(docsPlugin)
    .use(
        serverTiming({
            enabled: env.NODE_ENV !== 'production',
        }),
    )
    .use(modules)
    .onStart((f) => {
        f.decorator.logger.info(`API initialized in ${env.NODE_ENV} mode.`);
    })
    .onStop((f) => {
        f.decorator.logger.info(`API stopped.`);
    });
