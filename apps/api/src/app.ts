import { serverTiming } from '@elysia/server-timing';
import { db } from '@insignia/database';
import env from '@insignia/env';
import { Elysia } from 'elysia';

import { modules } from '#modules';
import {
    corsPlugin,
    docsPlugin,
    errorPlugin,
    loggerPlugin,
    serializerPlugin,
} from '#plugins';

export const app = new Elysia()
    .use(corsPlugin)
    .use(loggerPlugin)
    .use(errorPlugin)
    .use(serializerPlugin)
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
    .onStart(async (f) => {
        f.decorator.logger.info(
            `API running at ${env.PUBLIC_API_URL} in ${env.NODE_ENV} mode.`,
        );

        await db.connect();

        f.decorator.logger.info(
            `База данных по пути postgresql://****:****@${env.DATABASE_HOST}:${env.DATABASE_PORT}/${env.DATABASE_NAME} подключена`,
        );
    })
    .onStop(async (f) => {
        f.decorator.logger.info(`API stopped.`);

        await db.close();

        f.decorator.logger.info(`База данных успешно отключена`);
    });
