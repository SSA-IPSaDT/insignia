import { describe, expect, test } from 'bun:test';

import {
    getLocalIp,
    resolveApiUrl,
    resolveAppUrl,
    resolveNetworkUrl,
} from '#utils/app-url';

describe('app-url utilities', () => {
    test('getLocalIp returns a valid IPv4 address', () => {
        const ip = getLocalIp();

        expect(typeof ip).toBe('string');
        expect(ip).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
    });

    test('resolveNetworkUrl replaces localhost with local IP', () => {
        const localIp = getLocalIp();
        const resolved = resolveNetworkUrl('http://localhost:51001');

        expect(resolved).toBe(`http://${localIp}:51001`);
    });

    test('resolveNetworkUrl replaces 0.0.0.0 with local IP', () => {
        const localIp = getLocalIp();
        const resolved = resolveNetworkUrl('http://0.0.0.0:51000/api');

        expect(resolved).toBe(`http://${localIp}:51000/api`);
    });

    test('resolveNetworkUrl preserves public HTTPS domain', () => {
        const publicUrl = 'https://app.insignia.tech/dashboard';
        const resolved = resolveNetworkUrl(publicUrl);

        expect(resolved).toBe(publicUrl);
    });

    test('resolveNetworkUrl preserves external domain with port or path', () => {
        const externalUrl = 'https://demo.insignia.tech:8443/app';
        const resolved = resolveNetworkUrl(externalUrl);

        expect(resolved).toBe(externalUrl);
    });

    test('resolveAppUrl returns a valid URL string without localhost or 0.0.0.0', () => {
        const url = resolveAppUrl();

        expect(typeof url).toBe('string');
        expect(url.startsWith('http://') || url.startsWith('https://')).toBe(
            true,
        );
        expect(url).not.toContain('localhost');
        expect(url).not.toContain('0.0.0.0');
    });

    test('resolveApiUrl returns a valid URL string without localhost or 0.0.0.0', () => {
        const url = resolveApiUrl();

        expect(typeof url).toBe('string');
        expect(url.startsWith('http://') || url.startsWith('https://')).toBe(
            true,
        );
        expect(url).not.toContain('localhost');
        expect(url).not.toContain('0.0.0.0');
    });
});
