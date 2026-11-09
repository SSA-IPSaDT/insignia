import { describe, expect, test } from 'bun:test';

import { Temporal } from 'temporal-polyfill';

import { parseInsigniaJson, stringifyInsigniaJson } from '../src/http/json';

describe('SDK JSON Serializer & Parser (parseInsigniaJson / stringifyInsigniaJson)', () => {
    test('hydrates ISO-8601 calendar date into Temporal.PlainDate', () => {
        const json = JSON.stringify({
            birthDate: '1995-05-20',
        });

        const parsed = parseInsigniaJson<{ birthDate: Temporal.PlainDate }>(
            json,
        );

        expect(parsed.birthDate).toBeInstanceOf(Temporal.PlainDate);
        expect(parsed.birthDate.year).toBe(1995);
        expect(parsed.birthDate.month).toBe(5);
        expect(parsed.birthDate.day).toBe(20);
    });

    test('hydrates ISO-8601 datetime into Temporal.Instant', () => {
        const json = JSON.stringify({
            createdAt: '2026-11-09T10:15:30.500Z',
            updatedAt: '2026-11-09T12:00:00Z',
        });

        const parsed = parseInsigniaJson<{
            createdAt: Temporal.Instant;
            updatedAt: Temporal.Instant;
        }>(json);

        expect(parsed.createdAt).toBeInstanceOf(Temporal.Instant);
        expect(parsed.updatedAt).toBeInstanceOf(Temporal.Instant);
        expect(parsed.createdAt.toString()).toBe('2026-11-09T10:15:30.5Z');
    });

    test('hydrates telegramId into BigInt', () => {
        const json = JSON.stringify({
            telegramId: '123456789012345678',
        });

        const parsed = parseInsigniaJson<{ telegramId: bigint }>(json);

        expect(typeof parsed.telegramId).toBe('bigint');
        expect(parsed.telegramId).toBe(123456789012345678n);
    });

    test('stringifyInsigniaJson serializes BigInt into string safely', () => {
        const payload = {
            telegramId: 987654321098765432n,
            title: 'Test',
        };

        const serialized = stringifyInsigniaJson(payload);
        expect(serialized).toBe(
            '{"telegramId":"987654321098765432","title":"Test"}',
        );
    });
});
