import { describe, expect, test } from 'bun:test';

import { adminRawSchema } from '../src/admin';
import { apiRawSchema } from '../src/api';
import { appRawSchema, webRawSchema } from '../src/app';
import { baseRawSchema } from '../src/base';
import { botRawSchema } from '../src/bot';
import { createLazyEnv, parseEnv } from '../src/common';
import { databaseRawSchema } from '../src/database';
import env from '../src/index';
import { envRawSchema, envSchema } from '../src/schema';

describe('Raw Schemas Isolation', () => {
    test('baseRawSchema defines base runtime parameters', () => {
        const parsed = baseRawSchema.parse({});

        expect(parsed.NODE_ENV).toBe('development');
        expect(parsed.LOG_LEVEL).toBe('info');
        expect(parsed.ROOT_DOMAIN).toBe('insignia.tech');
        expect(parsed.TRUST_PROXY).toBe(false);
        expect(parsed.BODY_SIZE).toBe(1024 * 1024 * 25);
    });

    test('apiRawSchema defines API-specific raw parameters', () => {
        const parsed = apiRawSchema.parse({});

        expect(parsed.API_PORT).toBe(51000);
        expect(parsed.API_HOST).toBe('localhost');
        expect(parsed.API_DOMAIN_SUB).toBe('api');
        expect(parsed.AUTH_PASSWORD_PEPPER).toBeDefined();
        expect(parsed.JWT_ACCESS_SECRET).toBeDefined();
        expect(parsed.JWT_REFRESH_SECRET).toBeDefined();
    });

    test('adminRawSchema defines Admin-specific raw parameters', () => {
        const parsed = adminRawSchema.parse({});

        expect(parsed.ADMIN_PORT).toBe(51002);
        expect(parsed.ADMIN_HOST).toBe('localhost');
        expect(parsed.ADMIN_DOMAIN_SUB).toBe('admin');
    });

    test('appRawSchema defines App-specific raw parameters', () => {
        const parsed = appRawSchema.parse({});

        expect(parsed.APP_PORT).toBe(51001);
        expect(parsed.APP_HOST).toBe('localhost');
        expect(parsed.APP_DOMAIN_SUB).toBe('app');
        expect(parsed.ENABLE_PWA).toBe(true);
        expect(parsed.TELEGRAM_MINI_APP_MODE).toBe(false);
    });

    test('botRawSchema defines Telegram and Webhook raw parameters', () => {
        const parsed = botRawSchema.parse({});

        expect(parsed.TELEGRAM_BOT_TOKEN).toBe(
            '0000000000:AAFakeTestTokenForDevAndTestingOnly',
        );
        expect(parsed.TELEGRAM_TEST_ENVIRONMENT).toBe(false);
        expect(parsed.BOT_PORT).toBe(51004);
        expect(parsed.BOT_HOST).toBe('localhost');
        expect(parsed.BOT_DOMAIN_SUB).toBe('bot');
        expect(parsed.BOT_WEBHOOK_ENABLED).toBe(false);
        expect(parsed.TELEGRAM_WEBHOOK_SECRET).toBe('');
    });

    test('botRawSchema validates the Telegram token format when provided', () => {
        const validToken = '1234567890:AAFakeTestTokenForDevAndTestingOnly';
        const parsed = botRawSchema.parse({
            TELEGRAM_BOT_TOKEN: validToken,
        });

        expect(parsed.TELEGRAM_BOT_TOKEN).toBe(validToken);
        expect(() =>
            botRawSchema.parse({
                TELEGRAM_BOT_TOKEN: 'not-a-telegram-token',
            }),
        ).toThrow();
        expect(() =>
            botRawSchema.parse({
                TELEGRAM_BOT_TOKEN: '',
            }),
        ).toThrow();
    });

    test('databaseRawSchema defines Database connection parameters', () => {
        const parsed = databaseRawSchema.parse({});

        expect(parsed.DATABASE_HOST).toBe('localhost');
        expect(parsed.DATABASE_PORT).toBe(52000);
        expect(parsed.DATABASE_USER).toBe('insignia');
        expect(parsed.DATABASE_PASSWORD).toBe('insignia_password');
        expect(parsed.DATABASE_NAME).toBe('insignia');
        expect(parsed.DATABASE_URL).toBeUndefined();
    });
});

describe('Unified Dynamic Environment Transformation', () => {
    test('computes dev URLs, origins, and database connection', () => {
        const parsed = envSchema.parse({});

        // Dev URLs
        expect(parsed.PUBLIC_API_URL).toBe('http://localhost:51000');
        expect(parsed.PUBLIC_ADMIN_URL).toBe('http://localhost:51002');
        expect(parsed.PUBLIC_APP_URL).toBe('http://localhost:51001');
        expect(parsed.PUBLIC_WEB_URL).toBe('http://localhost:51001');
        expect(parsed.PUBLIC_BOT_URL).toBe('http://localhost:51004');
        expect(parsed.ADMIN_ORIGIN).toBe('http://localhost:51002');
        expect(parsed.APP_ORIGIN).toBe('http://localhost:51001');
        expect(parsed.WEB_ORIGIN).toBe('http://localhost:51001');

        // CORS
        expect(parsed.CORS_ALLOWED_ORIGINS).toContain('http://localhost:51001');
        expect(parsed.CORS_ALLOWED_ORIGINS).toContain('http://localhost:51002');
        expect(parsed.CORS_ALLOWED_ORIGINS).toContain('http://localhost:51004');

        // Database URL
        expect(parsed.DATABASE_URL).toBe(
            'postgresql://insignia:insignia_password@localhost:52000/insignia',
        );
    });

    test('computes production HTTPS URLs with subdomains from ROOT_DOMAIN', () => {
        const parsed = envSchema.parse({
            NODE_ENV: 'production',
            ROOT_DOMAIN: 'insignia.tech',
            API_HOST: '0.0.0.0',
            ADMIN_HOST: '0.0.0.0',
            BOT_HOST: '0.0.0.0',
        });

        expect(parsed.PUBLIC_API_URL).toBe('https://api.insignia.tech');
        expect(parsed.PUBLIC_ADMIN_URL).toBe('https://admin.insignia.tech');
        expect(parsed.PUBLIC_APP_URL).toBe('https://app.insignia.tech');
        expect(parsed.PUBLIC_WEB_URL).toBe('https://app.insignia.tech');
        expect(parsed.PUBLIC_BOT_URL).toBe('https://bot.insignia.tech');
        expect(parsed.ADMIN_ORIGIN).toBe('https://admin.insignia.tech');
        expect(parsed.APP_ORIGIN).toBe('https://app.insignia.tech');
        expect(parsed.WEB_ORIGIN).toBe('https://app.insignia.tech');
        expect(parsed.CORS_ALLOWED_ORIGINS).toContain(
            'https://app.insignia.tech',
        );
        expect(parsed.CORS_ALLOWED_ORIGINS).toContain(
            'https://admin.insignia.tech',
        );
        expect(parsed.CORS_ALLOWED_ORIGINS).toContain(
            'https://bot.insignia.tech',
        );
    });

    test('correctly parses string boolean representations', () => {
        const parsedFalse = envSchema.parse({
            API_CORS_ALLOW_ALL: 'false',
            BOT_WEBHOOK_ENABLED: '0',
            ENABLE_PWA: 'no',
        });
        expect(parsedFalse.API_CORS_ALLOW_ALL).toBe(false);
        expect(parsedFalse.BOT_WEBHOOK_ENABLED).toBe(false);
        expect(parsedFalse.ENABLE_PWA).toBe(false);

        const parsedTrue = envSchema.parse({
            API_CORS_ALLOW_ALL: 'true',
            BOT_WEBHOOK_ENABLED: '1',
            TELEGRAM_MINI_APP_MODE: 'yes',
        });
        expect(parsedTrue.API_CORS_ALLOW_ALL).toBe(true);
        expect(parsedTrue.BOT_WEBHOOK_ENABLED).toBe(true);
        expect(parsedTrue.TELEGRAM_MINI_APP_MODE).toBe(true);
    });

    test('supports wildcard CORS when API_CORS_ALLOW_ALL is enabled', () => {
        const parsed = envSchema.parse({
            API_CORS_ALLOW_ALL: 'true',
        });

        expect(parsed.CORS_ALLOWED_ORIGINS).toEqual(['*']);
    });

    test('preserves explicitly configured DATABASE_URL', () => {
        const explicitUrl =
            'postgresql://cloud:secret@aws.neon.tech:5432/remote_db';
        const parsed = envSchema.parse({
            DATABASE_URL: explicitUrl,
        });

        expect(parsed.DATABASE_URL).toBe(explicitUrl);
    });
});

describe('Common Environment Utilities & Default Export', () => {
    test('default export env resolves lazy properties', () => {
        expect(env.PUBLIC_API_URL).toBeDefined();
        expect(env.PUBLIC_ADMIN_URL).toBeDefined();
        expect(env.DATABASE_URL).toBeDefined();
        expect(env.NODE_ENV).toBeDefined();
    });

    test('parseEnv parses valid source object successfully', () => {
        const parsed = parseEnv(envRawSchema, {
            NODE_ENV: 'test',
            LOG_LEVEL: 'error',
        });

        expect(parsed.NODE_ENV).toBe('test');
        expect(parsed.LOG_LEVEL).toBe('error');
    });

    test('parseEnv throws formatted error on invalid environment', () => {
        expect(() => {
            parseEnv(envRawSchema, {
                NODE_ENV: 'unsupported_mode',
            });
        }).toThrow(/Некорректная конфигурация окружения/);
    });

    test('createLazyEnv creates lazy proxy that resolves property on demand', () => {
        const lazyEnv = createLazyEnv(envSchema);

        expect(lazyEnv.PUBLIC_API_URL).toBeDefined();
        expect(lazyEnv.PUBLIC_ADMIN_URL).toBeDefined();
        expect(lazyEnv.DATABASE_URL).toBeDefined();
    });
});
