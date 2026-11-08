import type { InsigniaClientOptions } from '#types';

export const resolveBaseUrl = (options?: InsigniaClientOptions): string => {
    if (options && 'baseUrl' in options && options.baseUrl) {
        return options.baseUrl;
    }

    if (options && 'host' in options && 'port' in options) {
        const protocol = options.protocol ?? 'http';
        return `${protocol}://${options.host}:${options.port}`;
    }

    const envUrl =
        typeof process !== 'undefined'
            ? process.env?.PUBLIC_API_URL
            : typeof Bun !== 'undefined'
              ? Bun.env?.PUBLIC_API_URL
              : undefined;

    return envUrl ?? 'http://localhost:51000';
};
