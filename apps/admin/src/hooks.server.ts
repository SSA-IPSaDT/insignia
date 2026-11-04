import { createLogger } from '@insignia/logger';
import type {
    Handle,
    HandleFetch,
    HandleServerError,
    ServerInit,
} from '@sveltejs/kit/hooks';

const logger = createLogger('admin:server');

/**
 * Server startup initialization hook.
 * Executed once when the SvelteKit server boots up.
 * Use this for warmups, DB checks, background workers, or startup logging.
 */
export const init: ServerInit = async () => {
    logger.info('Insignia Admin server starting up...');
};

/**
 * Main request interceptor hook.
 * Handles incoming HTTP requests, session validation, timing, and security headers.
 */
export const handle: Handle = async ({ event, resolve }) => {
    const start = performance.now();
    const response = await resolve(event);
    const duration = Math.round(performance.now() - start);

    logger.debug(
        `${event.request.method} ${event.url.pathname} -> ${response.status} (${duration}ms)`,
    );

    return response;
};

/**
 * Server-side error handler hook.
 * Logs unhandled exceptions occurring in endpoints, actions, or load functions.
 */
export const handleError: HandleServerError = async ({
    error,
    event,
    kind,
}) => {
    logger.error(`Unhandled server error [${kind}]`, {
        kind,
        path: event.url.pathname,
        error: error instanceof Error ? error.stack : String(error),
    });

    return {
        message: 'Internal Server Error',
    };
};

/**
 * Fetch interceptor for requests made with event.fetch on the server.
 */
export const handleFetch: HandleFetch = async ({ request, fetch }) => {
    return fetch(request);
};
