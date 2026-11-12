import type {
    CommonErrorCode,
    ProblemDetails,
} from '@insignia/contracts/common';
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
                            ProblemDetails | undefined;

                        if (
                            payload &&
                            typeof payload === 'object' &&
                            (payload.type || payload.code || payload.title)
                        ) {
                            return new InsigniaApiError(
                                response.status,
                                (payload.code ??
                                    'UNKNOWN_ERROR') as CommonErrorCode,
                                payload.detail ||
                                    payload.title ||
                                    `HTTP error ${response.status}`,
                                payload.invalidParams ?? payload.details,
                                payload,
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
