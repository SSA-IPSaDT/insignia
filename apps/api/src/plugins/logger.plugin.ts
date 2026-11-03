import { type AppLogger, createLogger } from '@insignia/logger';
import { Elysia } from 'elysia';

export const apiLogger = createLogger('api');

export const loggerPlugin = new Elysia({
    name: 'insignia-logger',
    seed: 'insignia-logger',
})
    .decorate('logger', apiLogger)
    .onRequest(({ request }) => {
        (request as unknown as { _startTime: number })._startTime =
            performance.now();
    })
    .onAfterResponse(({ request, set, logger }) => {
        const startTime = (request as unknown as { _startTime?: number })
            ._startTime;
        const duration = startTime
            ? (performance.now() - startTime).toFixed(1)
            : 0;
        const url = new URL(request.url).pathname;
        const status = set.status ?? 200;

        logger.info(`${request.method} ${url} -> ${status} (${duration}ms)`);
    })
    .onError(({ request, error, code, logger }) => {
        const url = new URL(request.url).pathname;

        if (code === 'NOT_FOUND') {
            logger.warn(`Not Found: ${request.method} ${url}`);
            return;
        }

        logger.error(
            `Error on ${request.method} ${url} [${code}]: ${(error as { message: string }).message}`,
            error,
        );
    })
    .as('global');
