import { describe, expect, test } from 'bun:test';

import { Temporal } from 'temporal-polyfill';

import {
    publicUserDtoSchema,
    telegramAccountBaseSchema,
    userBaseSchema,
    userProfileDtoSchema,
} from '../src/users';

describe('User Contracts Schema Validation', () => {
    const validUserId = '018f2780-2396-7a8e-a9d5-7389a0f69a53';
    const nowIso = '2026-11-08T12:00:00.000Z';

    const validUserBase = {
        id: validUserId,
        avatarUrl: 'https://example.com/avatar.png',
        lastName: 'Иванов',
        firstName: 'Иван',
        patronymic: 'Иванович',
        email: 'ivan@example.com',
        userName: 'ivan_dev',
        phone: '+79991234567',
        birthDate: Temporal.PlainDate.from('1995-05-15'),
        maxOrganizationCanCreate: 2,
        createdAt: nowIso,
        updatedAt: nowIso,
        deletedAt: null,
    };

    test('userBaseSchema validates complete valid user', () => {
        const result = userBaseSchema.safeParse(validUserBase);
        expect(result.success).toBe(true);
    });

    test('userBaseSchema allows nullable fields to be null', () => {
        const minimalUser = {
            id: validUserId,
            avatarUrl: null,
            lastName: null,
            firstName: 'Алексей',
            patronymic: null,
            email: null,
            userName: null,
            phone: null,
            birthDate: null,
            maxOrganizationCanCreate: 0,
            createdAt: nowIso,
            updatedAt: nowIso,
            deletedAt: null,
        };

        const result = userBaseSchema.safeParse(minimalUser);
        expect(result.success).toBe(true);
    });

    test('userBaseSchema rejects empty or whitespace-only firstName', () => {
        const invalid = {
            ...validUserBase,
            firstName: '   ',
        };
        const result = userBaseSchema.safeParse(invalid);
        expect(result.success).toBe(false);
    });

    test('userBaseSchema rejects invalid email format', () => {
        const invalid = {
            ...validUserBase,
            email: 'not-an-email',
        };
        const result = userBaseSchema.safeParse(invalid);
        expect(result.success).toBe(false);
    });

    test('userBaseSchema rejects maxOrganizationCanCreate greater than 8', () => {
        const invalid = {
            ...validUserBase,
            maxOrganizationCanCreate: 9,
        };
        const result = userBaseSchema.safeParse(invalid);
        expect(result.success).toBe(false);
    });

    test('publicUserDtoSchema strips sensitive and null fields when omitted', () => {
        const publicUser = {
            id: validUserId,
            firstName: 'Иван',
            lastName: 'Иванов',
        };

        const result = publicUserDtoSchema.safeParse(publicUser);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.firstName).toBe('Иван');
            expect(result.data.lastName).toBe('Иванов');
            expect('email' in result.data).toBe(false);
            expect('phone' in result.data).toBe(false);
        }
    });

    test('userProfileDtoSchema accepts optional omitted profile fields', () => {
        const profile = {
            id: validUserId,
            firstName: 'Иван',
            maxOrganizationCanCreate: 3,
            createdAt: nowIso,
            updatedAt: nowIso,
        };

        const result = userProfileDtoSchema.safeParse(profile);
        expect(result.success).toBe(true);
    });
});

describe('Telegram Account Contracts Schema Validation', () => {
    const validTelegramId = 123456789n;
    const validUuid = '018f2780-2396-7a8e-a9d5-7389a0f69a53';
    const nowIso = '2026-11-08T12:00:00.000Z';

    const validAccount = {
        id: validUuid,
        photoUrl: 'https://t.me/i/userpic/320/photo.jpg',
        telegramId: validTelegramId,
        firstName: 'Durov',
        lastName: 'Pavel',
        userName: 'durov',
        isBot: false,
        isPremium: true,
        languageCode: 'ru',
        allowsWriteToPm: true,
        userId: validUuid,
        createdAt: nowIso,
        updatedAt: nowIso,
    };

    test('telegramAccountBaseSchema validates correct telegram account', () => {
        const result = telegramAccountBaseSchema.safeParse(validAccount);
        expect(result.success).toBe(true);
    });

    test('telegramAccountBaseSchema applies defaults for optional booleans and language', () => {
        const minimal = {
            id: validUuid,
            photoUrl: null,
            telegramId: validTelegramId,
            firstName: 'Pavel',
            lastName: null,
            userName: null,
            userId: validUuid,
            createdAt: nowIso,
            updatedAt: nowIso,
        };

        const result = telegramAccountBaseSchema.safeParse(minimal);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.isBot).toBe(false);
            expect(result.data.isPremium).toBe(false);
            expect(result.data.languageCode).toBe('ru');
            expect(result.data.allowsWriteToPm).toBe(true);
        }
    });

    test('telegramAccountBaseSchema rejects negative or zero telegramId', () => {
        const invalid = {
            ...validAccount,
            telegramId: -100n,
        };
        const result = telegramAccountBaseSchema.safeParse(invalid);
        expect(result.success).toBe(false);
    });

    test('telegramAccountBaseSchema rejects invalid telegram username characters', () => {
        const invalid = {
            ...validAccount,
            userName: 'invalid-user-name!', // Telegram usernames only allow A-Z, a-z, 0-9, _
        };
        const result = telegramAccountBaseSchema.safeParse(invalid);
        expect(result.success).toBe(false);
    });

    test('telegramAccountBaseSchema rejects telegram username shorter than 4 characters', () => {
        const invalid = {
            ...validAccount,
            userName: 'abc', // Telegram usernames minimum 4 or 5 chars
        };
        const result = telegramAccountBaseSchema.safeParse(invalid);
        expect(result.success).toBe(false);
    });
});
