import type { ApiErrorResponse } from '@insignia/contracts';
import ky, { isHTTPError, type KyInstance } from 'ky';

import { InsigniaApiError } from '#errors';
import { resolveBaseUrl } from '#http/resolver';
import type { InsigniaClientOptions } from '#types';

import { parseInsigniaJson, stringifyInsigniaJson } from './json';

export const createHttpTransport = (
    options?: InsigniaClientOptions,
): KyInstance => {
    const baseUrl = resolveBaseUrl(options);

    return ky.create({
        baseUrl,

        fetch: options?.fetch,
        timeout: options?.timeout ?? 15000,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
        hooks: {
            beforeRequest: [
                async ({ request }) => {
                    if (options?.auth) {
                        const token =
                            typeof options.auth === 'function'
                                ? await options.auth()
                                : options.auth;

                        if (token)
                            request.headers.set('Insignia-Signet', token);
                    }
                },
            ],
            beforeError: [
                async ({ error }) => {
                    if (isHTTPError(error)) {
                        const { response } = error;
                        const payload = error.data as
                            ApiErrorResponse | undefined;

                        if (
                            payload &&
                            typeof payload === 'object' &&
                            payload.success === false &&
                            payload.error
                        ) {
                            return new InsigniaApiError(
                                response.status,
                                payload.error.code,
                                payload.error.message,
                                payload.error.details,
                                error,
                            );
                        }
                    }
                    return error;
                },
            ],
        },

        parseJson: parseInsigniaJson,
        stringifyJson: stringifyInsigniaJson,
    });
};
