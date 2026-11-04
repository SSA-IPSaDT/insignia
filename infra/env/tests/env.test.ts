import { describe, expect, test } from 'bun:test';

import { adminEnvSchema } from '../src/admin';
import { apiEnvSchema } from '../src/api';
import { baseEnvSchema } from '../src/base';
import { createLazyEnv, parseEnv } from '../src/common';
import { databaseEnvSchema } from '../src/database';

describe('Base Environment Schema', () => {
    test('baseEnvSchema sets correct defaults when omitted', () => {
        const parsed = baseEnvSchema.parse({});

        expect(parsed.NODE_ENV).toBe('development');
        expect(parsed.MODE).toBe('development');
        expect(parsed.LOG_LEVEL).toBe('info');
    });

    test('baseEnvSchema parses valid custom values', () => {
        const parsed = baseEnvSchema.parse({
            NODE_ENV: 'production',
            MODE: 'production',
            LOG_LEVEL: 'warn',
        });

        expect(parsed.NODE_ENV).toBe('production');
        expect(parsed.MODE).toBe('production');
        expect(parsed.LOG_LEVEL).toBe('warn');
    });

    test('baseEnvSchema rejects invalid NODE_ENV', () => {
        const result = baseEnvSchema.safeParse({
            NODE_ENV: 'invalid_env',
        });

        expect(result.success).toBe(false);
    });

    test('baseEnvSchema rejects invalid LOG_LEVEL', () => {
        const result = baseEnvSchema.safeParse({
            LOG_LEVEL: 'verbose',
        });

        expect(result.success).toBe(false);
    });
});

describe('API Environment Schema', () => {
    test('apiEnvSchema sets correct defaults and inherits base schema', () => {
        const parsed = apiEnvSchema.parse({});

        expect(parsed.NODE_ENV).toBe('development');
        expect(parsed.API_HOST).toBe('0.0.0.0');
        expect(parsed.API_PORT).toBe(51000);
    });

    test('apiEnvSchema coerces string API_PORT to number', () => {
        const parsed = apiEnvSchema.parse({
            API_PORT: '51000',
            API_HOST: '127.0.0.1',
        });

        expect(parsed.API_PORT).toBe(51000);
        expect(parsed.API_HOST).toBe('127.0.0.1');
    });
});

describe('Admin Environment Schema', () => {
    test('adminEnvSchema sets correct defaults and inherits base schema', () => {
        const parsed = adminEnvSchema.parse({});

        expect(parsed.NODE_ENV).toBe('development');
        expect(parsed.ADMIN_HOST).toBe('localhost');
        expect(parsed.ADMIN_PORT).toBe(51002);
    });

    test('adminEnvSchema coerces string ADMIN_PORT to number', () => {
        const parsed = adminEnvSchema.parse({
            ADMIN_PORT: '51002',
            ADMIN_HOST: '0.0.0.0',
        });

        expect(parsed.ADMIN_PORT).toBe(51002);
        expect(parsed.ADMIN_HOST).toBe('0.0.0.0');
    });
});

describe('Database Environment Schema', () => {
    test('databaseEnvSchema sets correct defaults and computes DATABASE_URL', () => {
        const parsed = databaseEnvSchema.parse({});

        expect(parsed.DATABASE_HOST).toBe('localhost');
        expect(parsed.DATABASE_PORT).toBe(52000);
        expect(parsed.DATABASE_USER).toBe('insignia');
        expect(parsed.DATABASE_PASSWORD).toBe('insignia_password');
        expect(parsed.DATABASE_NAME).toBe('insignia');
        expect(parsed.DATABASE_URL).toBe(
            'postgresql://insignia:insignia_password@localhost:52000/insignia',
        );
    });

    test('databaseEnvSchema coerces string port and updates computed DATABASE_URL', () => {
        const parsed = databaseEnvSchema.parse({
            DATABASE_PORT: '5432',
            DATABASE_HOST: 'postgres',
            DATABASE_USER: 'admin',
            DATABASE_PASSWORD: 'secret_password',
            DATABASE_NAME: 'prod_db',
        });

        expect(parsed.DATABASE_PORT).toBe(5432);
        expect(parsed.DATABASE_URL).toBe(
            'postgresql://admin:secret_password@postgres:5432/prod_db',
        );
    });

    test('databaseEnvSchema preserves explicitly provided DATABASE_URL', () => {
        const explicitUrl =
            'postgresql://cloud_user:cloud_pass@aws.neon.tech:5432/remote_db';

        const parsed = databaseEnvSchema.parse({
            DATABASE_URL: explicitUrl,
        });

        expect(parsed.DATABASE_URL).toBe(explicitUrl);
    });

    test('databaseEnvSchema rejects invalid DATABASE_URL', () => {
        expect(() => {
            databaseEnvSchema.parse({
                DATABASE_URL: 'not-a-valid-url',
            });
        }).toThrow();
    });
});

describe('Common Environment Utilities', () => {
    test('parseEnv parses valid source object successfully', () => {
        const parsed = parseEnv(baseEnvSchema, {
            NODE_ENV: 'test',
            LOG_LEVEL: 'error',
        });

        expect(parsed.NODE_ENV).toBe('test');
        expect(parsed.LOG_LEVEL).toBe('error');
    });

    test('parseEnv throws formatted error on invalid environment', () => {
        expect(() => {
            parseEnv(baseEnvSchema, {
                NODE_ENV: 'unsupported_mode',
            });
        }).toThrow(/Некорректная конфигурация окружения/);
    });

    test('createLazyEnv creates lazy proxy that resolves property on demand', () => {
        const lazyEnv = createLazyEnv(baseEnvSchema);

        expect(lazyEnv.NODE_ENV).toBeDefined();
        expect(lazyEnv.LOG_LEVEL).toBeDefined();
    });
});
