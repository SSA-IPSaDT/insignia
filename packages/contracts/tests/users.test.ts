import { describe, expect, test } from 'bun:test';

import { Temporal } from 'temporal-polyfill';

import { nullToUndefined } from '../src/common';
import {
    createPaginatedPublicUsersResponse,
    createPublicUserResponse,
    createUserErrorResponse,
    createUserNotFoundErrorResponse,
    paginatedPublicUsersResponseSchema,
    publicUserDtoSchema,
    publicUserResponseSchema,
    takeUserByIdParamsSchema,
    takeUserByIdResponseSchema,
    takeUsersEndpoint,
    takeUsersQuerySchema,
    takeUsersResponseSchema,
    telegramAccountBaseSchema,
    USER_ERROR_MESSAGES,
    userBaseSchema,
    userErrorResponseSchema,
    userNotFoundErrorResponseSchema,
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

    test('publicUserDtoSchema transforms null fields from database into undefined', () => {
        const rawDbUser = {
            id: validUserId,
            firstName: 'Иван',
            lastName: null,
            patronymic: null,
            avatarUrl: null,
            userName: null,
        };

        const result = publicUserDtoSchema.safeParse(rawDbUser);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.firstName).toBe('Иван');
            expect(result.data.lastName).toBeUndefined();
            expect(result.data.patronymic).toBeUndefined();
            expect(result.data.avatarUrl).toBeUndefined();
            expect(result.data.userName).toBeUndefined();

            // При сериализации в JSON поля со значением undefined полностью исключаются
            const json = JSON.parse(JSON.stringify(result.data));
            expect(json).toEqual({
                id: validUserId,
                firstName: 'Иван',
            });
            expect('lastName' in json).toBe(false);
            expect('userName' in json).toBe(false);
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

    test('nullToUndefined utility converts object schema nullable fields into optional', () => {
        const customDto = nullToUndefined(
            userBaseSchema.pick({
                id: true,
                firstName: true,
                lastName: true,
                email: true,
            }),
        );

        // id and firstName remain required
        expect(customDto.safeParse({ id: validUserId }).success).toBe(false);
        expect(
            customDto.safeParse({ id: validUserId, firstName: 'Иван' }).success,
        ).toBe(true);

        // nullable fields accept null and map to undefined
        const parsed = customDto.safeParse({
            id: validUserId,
            firstName: 'Иван',
            lastName: null,
            email: null,
        });
        expect(parsed.success).toBe(true);
        if (parsed.success) {
            expect(parsed.data.lastName).toBeUndefined();
            expect(parsed.data.email).toBeUndefined();
        }
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

describe('User Endpoint & Error Contracts Validation', () => {
    const validUserId = '018f2780-2396-7a8e-a9d5-7389a0f69a53';

    test('takeUserByIdParamsSchema validates valid UUIDv7', () => {
        const result = takeUserByIdParamsSchema.safeParse({ id: validUserId });
        expect(result.success).toBe(true);
    });

    test('takeUserByIdParamsSchema rejects invalid UUID', () => {
        const result = takeUserByIdParamsSchema.safeParse({
            id: '123-not-a-uuid',
        });
        expect(result.success).toBe(false);
    });

    test('createPublicUserResponse validates and transforms raw DB user', () => {
        const rawDbUser = {
            id: validUserId,
            firstName: 'Ольга',
            lastName: null,
            patronymic: null,
            avatarUrl: null,
            userName: null,
        };

        const response = createPublicUserResponse(rawDbUser);
        expect(response.success).toBe(true);
        expect(response.data.id).toBe(validUserId);
        expect(response.data.firstName).toBe('Ольга');
        expect(response.data.lastName).toBeUndefined();
        expect(response.data.avatarUrl).toBeUndefined();

        const json = JSON.parse(JSON.stringify(response));
        expect(json).toEqual({
            success: true,
            data: {
                id: validUserId,
                firstName: 'Ольга',
            },
        });
        expect('lastName' in json.data).toBe(false);
    });

    test('createUserNotFoundErrorResponse produces correct 404 error envelope', () => {
        const notFoundResponse = createUserNotFoundErrorResponse();
        expect(notFoundResponse.success).toBe(false);
        expect(notFoundResponse.error.code).toBe('USER_NOT_FOUND');
        expect(notFoundResponse.error.message).toBe(
            USER_ERROR_MESSAGES.USER_NOT_FOUND,
        );

        const customMessageResponse = createUserNotFoundErrorResponse(
            'Пользователь не найден в текущей организации.',
        );
        expect(customMessageResponse.error.message).toBe(
            'Пользователь не найден в текущей организации.',
        );
    });

    test('takeUserByIdResponseSchema validates 200, 404, and 422 schemas', () => {
        // 200
        const successPayload = {
            success: true,
            data: {
                id: validUserId,
                firstName: 'Иван',
            },
        };
        expect(
            takeUserByIdResponseSchema[200].safeParse(successPayload).success,
        ).toBe(true);

        // 404
        const notFoundPayload = {
            success: false,
            error: {
                code: 'USER_NOT_FOUND',
                message: 'Пользователь не найден.',
            },
        };
        expect(
            takeUserByIdResponseSchema[404].safeParse(notFoundPayload).success,
        ).toBe(true);

        // 422
        const validationErrorPayload = {
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Ошибка валидации входящих данных.',
                details: {
                    fields: { id: 'Некорректный идентификатор пользователя' },
                },
            },
        };
        expect(
            takeUserByIdResponseSchema[422].safeParse(validationErrorPayload)
                .success,
        ).toBe(true);
    });

    test('createUserErrorResponse supports all UserErrorCodes with default messages', () => {
        const codes = [
            'USER_NOT_FOUND',
            'USER_ALREADY_EXISTS',
            'USER_CREATE_FAILED',
            'USER_UPDATE_FAILED',
            'USER_DELETE_FAILED',
            'USER_BLOCKED',
        ] as const;

        for (const code of codes) {
            const res = createUserErrorResponse(code);
            expect(res.success).toBe(false);
            expect(res.error.code).toBe(code);
            expect(res.error.message).toBe(USER_ERROR_MESSAGES[code]);
        }
    });

    test('createUserErrorResponse falls back to CommonErrorCode when requested', () => {
        const res = createUserErrorResponse('BAD_REQUEST');
        expect(res.success).toBe(false);
        expect(res.error.code).toBe('BAD_REQUEST');
        expect(res.error.message).toBe('Некорректный запрос.');
    });

    test('user error schemas include rich markdown descriptions and defaults for Scalar UI', () => {
        const messageDesc =
            userErrorResponseSchema.shape.error.shape.message.description;
        expect(messageDesc).toContain('**Стандартные сообщения по кодам:**');
        expect(messageDesc).toContain(
            '- `USER_NOT_FOUND`: *«Пользователь не найден.»*',
        );
        expect(messageDesc).toContain(
            '- `USER_ALREADY_EXISTS`: *«Пользователь с такими данными уже существует.»*',
        );
        expect(messageDesc).toContain(
            '- `USER_BLOCKED`: *«Профиль пользователя заблокирован.»*',
        );

        expect(
            userNotFoundErrorResponseSchema.shape.error.shape.message
                .description,
        ).toBe('Пользователь не найден.');
    });

    test('takeUserByIdResponseSchema has clean and specific envelope descriptions', () => {
        expect(takeUserByIdResponseSchema[200].description).toBe(
            'Конверт успешного ответа с публичным профилем пользователя',
        );
        expect(takeUserByIdResponseSchema[404].description).toBe(
            'Конверт ответа с ошибкой: пользователь не найден',
        );
        expect(takeUserByIdResponseSchema[422].description).toBe(
            'Ответ API с ошибкой валидации',
        );
        expect(takeUserByIdResponseSchema[500].description).toBe(
            'Ответ API с внутренней ошибкой сервера',
        );
        expect(takeUserByIdResponseSchema[503].description).toBe(
            'Ответ API при временной недоступности сервиса или базы данных',
        );
    });

    test('field descriptions have no redundant brackets or length annotations', () => {
        expect(userBaseSchema.shape.lastName.description).toBe(
            'Фамилия пользователя',
        );
        expect(userBaseSchema.shape.firstName.description).toBe(
            'Имя пользователя',
        );
        expect(userBaseSchema.shape.avatarUrl.description).toBe(
            'Ссылка на аватар пользователя',
        );
        expect(userBaseSchema.shape.id.description).toBe(
            'Уникальный идентификатор пользователя',
        );
    });

    test('takeUsersQuerySchema applies defaults and validates valid sort fields', () => {
        const parsed = takeUsersQuerySchema.parse({});
        expect(parsed.page).toBe(1);
        expect(parsed.limit).toBe(20);
        expect(parsed.sortBy).toBe('createdAt');
        expect(parsed.sortOrder).toBe('desc');

        const custom = takeUsersQuerySchema.parse({
            page: '2',
            limit: '10',
            sortBy: 'firstName',
            sortOrder: 'asc',
            search: 'Алекс',
        });
        expect(custom.page).toBe(2);
        expect(custom.limit).toBe(10);
        expect(custom.sortBy).toBe('firstName');
        expect(custom.sortOrder).toBe('asc');
        expect(custom.search).toBe('Алекс');

        expect(
            takeUsersQuerySchema.safeParse({ sortBy: 'unknownField' }).success,
        ).toBe(false);
    });

    test('createPaginatedPublicUsersResponse formats valid envelope with transformed DTOs', () => {
        const rawUsers = [
            {
                id: '018f2780-2396-7a8e-a9d5-7389a0f69a53',
                firstName: 'Иван',
                lastName: null,
                userName: null,
            },
        ];

        const response = createPaginatedPublicUsersResponse({
            items: rawUsers,
            total: 1,
            page: 1,
            limit: 20,
        });

        expect(response.success).toBe(true);
        expect(response.data.items[0].firstName).toBe('Иван');
        expect(response.data.items[0].lastName).toBeUndefined();
        expect(response.data.meta.total).toBe(1);
        expect(response.data.meta.totalPages).toBe(1);
        expect(response.data.meta.hasNextPage).toBe(false);
        expect(response.data.meta.hasPrevPage).toBe(false);
    });

    test('takeUsersEndpoint defines 200, 422, 500, 501, 503 schemas and detail tags', () => {
        expect(takeUsersResponseSchema[200]).toBe(
            paginatedPublicUsersResponseSchema,
        );
        expect(takeUsersResponseSchema[422]).toBeDefined();
        expect(takeUsersResponseSchema[500]).toBeDefined();
        expect(takeUsersResponseSchema[501]).toBeDefined();
        expect(takeUsersResponseSchema[503]).toBeDefined();
        expect(takeUsersEndpoint.detail?.tags).toEqual(['Users']);
    });
});
