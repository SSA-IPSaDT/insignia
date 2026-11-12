import { describe, expect, test } from 'bun:test';

import {
    deleteTelegramAccountDtoSchema,
    deleteTelegramAccountEndpoint,
    syncTelegramAccountDtoSchema,
    syncTelegramAccountEndpoint,
    takeTelegramAccountByIdEndpoint,
    TELEGRAM_ACCOUNT_ERROR_MESSAGES,
    telegramAccountBaseSchema,
    telegramAccountDtoSchema,
    telegramAccountErrors,
    updateTelegramAccountDtoSchema,
    updateTelegramAccountEndpoint,
} from '../src/users';

describe('Telegram Account Contracts Validation', () => {
    const validId = '018f2780-2396-7a8e-a9d5-7389a0f69a53';
    const validUserId = '018f2780-2396-7a8e-a9d5-7389a0f69a54';
    const nowIso = '2026-11-08T12:00:00.000Z';

    const validAccountBase = {
        id: validId,
        photoUrl: 'https://example.com/photo.jpg',
        telegramId: 123456789n,
        lastName: 'Дуров',
        firstName: 'Павел',
        userName: 'durov',
        isBot: false,
        isPremium: true,
        languageCode: 'ru',
        allowsWriteToPm: true,
        userId: validUserId,
        createdAt: nowIso,
        updatedAt: nowIso,
    };

    test('telegramAccountDtoSchema converts null to undefined', () => {
        const raw = {
            ...validAccountBase,
            photoUrl: null,
            lastName: null,
            userName: null,
        };

        const parsed = telegramAccountDtoSchema.parse(raw);
        expect(parsed.photoUrl).toBeUndefined();
        expect(parsed.lastName).toBeUndefined();
        expect(parsed.userName).toBeUndefined();
        expect(parsed.firstName).toBe('Павел');
    });

    test('syncTelegramAccountDtoSchema requires non-empty initData', () => {
        expect(
            syncTelegramAccountDtoSchema.safeParse({
                initData: 'query_id=123&user=%7B...%7D',
            }).success,
        ).toBe(true);

        expect(
            syncTelegramAccountDtoSchema.safeParse({ initData: '' }).success,
        ).toBe(false);
    });

    test('updateTelegramAccountDtoSchema validates optional fields', () => {
        const valid = {
            allowsWriteToPm: false,
            languageCode: 'en',
        };
        const parsed = updateTelegramAccountDtoSchema.safeParse(valid);
        expect(parsed.success).toBe(true);
    });

    test('deleteTelegramAccountDtoSchema validates detach result', () => {
        const valid = {
            id: validId,
            detached: true,
        };
        const parsed = deleteTelegramAccountDtoSchema.safeParse(valid);
        expect(parsed.success).toBe(true);
    });

    test('telegramAccountErrors creates typed error responses', () => {
        const error = telegramAccountErrors.createError(
            'TELEGRAM_AUTH_INVALID',
        );
        expect(error.code).toBe('TELEGRAM_AUTH_INVALID');
        expect(error.detail).toBe(
            TELEGRAM_ACCOUNT_ERROR_MESSAGES.TELEGRAM_AUTH_INVALID,
        );
        expect(error.status).toBe(401);

        const notFound = telegramAccountErrors.createNotFound!();
        expect(notFound.code).toBe('TELEGRAM_ACCOUNT_NOT_FOUND');
        expect(notFound.status).toBe(404);
    });

    test('all telegram endpoints define standard 501 response code', () => {
        expect(syncTelegramAccountEndpoint.response[501]).toBeDefined();
        expect(takeTelegramAccountByIdEndpoint.response[501]).toBeDefined();
        expect(updateTelegramAccountEndpoint.response[501]).toBeDefined();
        expect(deleteTelegramAccountEndpoint.response[501]).toBeDefined();
    });
});
