import { describe, expect, test } from 'bun:test';

import { resolveBaseUrl } from '#http/resolver';

describe('SDK resolveBaseUrl', () => {
    test('resolves explicit baseUrl correctly', () => {
        const url = resolveBaseUrl({
            baseUrl: 'https://custom-api.insignia.tech',
        });
        expect(url).toBe('https://custom-api.insignia.tech');
    });

    test('resolves host and port with default http protocol', () => {
        const url = resolveBaseUrl({ host: '127.0.0.1', port: 8080 });
        expect(url).toBe('http://127.0.0.1:8080');
    });

    test('resolves host, port and explicit https protocol', () => {
        const url = resolveBaseUrl({
            host: 'api.internal',
            port: 8443,
            protocol: 'https',
        });
        expect(url).toBe('https://api.internal:8443');
    });

    test('falls back to default URL when no options provided', () => {
        const url = resolveBaseUrl();
        expect(url).toBe(
            process.env.PUBLIC_API_URL ?? 'http://localhost:51000',
        );
    });
});
