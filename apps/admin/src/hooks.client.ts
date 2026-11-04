import type { ClientInit, HandleClientError } from '@sveltejs/kit/hooks';

/**
 * Client-side initialization hook.
 * Executed once when the SvelteKit application is hydrated in the browser.
 * Use this for client analytics, service workers, or global event listeners.
 */
export const init: ClientInit = async () => {
    // Client-side bootstrap logic (e.g. tracking, client metrics)
};

/**
 * Client-side error handler hook.
 * Catches unhandled client errors and unexpected lifecycle failures.
 */
export const handleError: HandleClientError = async ({
    error,
    event,
    kind,
}) => {
    console.error(`[Admin Client Error: ${kind}]`, {
        kind,
        url: event.url.href,
        error,
    });

    return {
        message: 'Client Error',
    };
};
