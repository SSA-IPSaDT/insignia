import { beforeAll, describe, expect, it, spyOn } from 'bun:test';

import { notImplementedResponseSchema } from '@insignia/contracts/response';
import {
    takeMeResponseSchema,
    takeUserByIdResponseSchema,
    takeUsersResponseSchema,
    USER_ERROR_MESSAGES,
} from '@insignia/contracts/users';
import { seedUsers } from '@insignia/database/seed';

import { app } from '#/app';
import * as usersService from '#modules/v1/users/users.service';

describe('Users API Endpoints', () => {
    const validUserId = '018f2780-2396-7a8e-a9d5-7389a0f69a53';

    beforeAll(async () => {
        await seedUsers();
    });

    it('GET /v1/users/me returns 404 when no user identifier is provided in headers', async () => {
        const response = await app.handle(
            new Request('http://localhost/v1/users/me'),
        );

        expect(response.status).toBe(404);

        const body = await response.json();
        const parsed = takeMeResponseSchema[404].parse(body);

        expect(parsed.success).toBe(false);
        expect(parsed.error.code).toBe('USER_NOT_FOUND');
    });

    it('GET /v1/users/me returns 404 with USER_NOT_FOUND when user does not exist in database', async () => {
        const meSpy = spyOn(usersService, 'takeMeById').mockResolvedValue(null);

        const response = await app.handle(
            new Request('http://localhost/v1/users/me', {
                headers: { 'x-user-id': validUserId },
            }),
        );

        expect(response.status).toBe(404);

        const body = await response.json();
        const parsed = takeMeResponseSchema[404].parse(body);

        expect(parsed.success).toBe(false);
        expect(parsed.error.code).toBe('USER_NOT_FOUND');
        expect(parsed.error.message).toBe(USER_ERROR_MESSAGES.USER_NOT_FOUND);

        meSpy.mockRestore();
    });

    it('GET /v1/users/me returns 200 with UserProfileDTO and strips null fields to undefined', async () => {
        const mockRawDbUser = {
            id: validUserId,
            firstName: 'Александр',
            lastName: 'Смирнов',
            patronymic: null,
            avatarUrl: null,
            userName: 'alex_smirnov',
            email: 'alex.smirnov@insignia.dev',
            phone: '+79991234567',
            birthDate: '1990-05-15',
            maxOrganizationCanCreate: 3,
            createdAt: '2026-11-09T00:00:00.000Z',
            updatedAt: '2026-11-09T00:00:00.000Z',
            deletedAt: null,
        };

        const meSpy = spyOn(usersService, 'takeMeById').mockResolvedValue(
            mockRawDbUser as any,
        );

        const response = await app.handle(
            new Request('http://localhost/v1/users/me', {
                headers: { 'x-user-id': validUserId },
            }),
        );

        expect(response.status).toBe(200);

        const body = await response.json();
        const parsed = takeMeResponseSchema[200].parse(body);

        expect(parsed.success).toBe(true);
        expect(parsed.data.id).toBe(validUserId);
        expect(parsed.data.firstName).toBe('Александр');
        expect(parsed.data.lastName).toBe('Смирнов');
        expect(parsed.data.email).toBe('alex.smirnov@insignia.dev');
        expect('patronymic' in parsed.data).toBe(false);
        expect('avatarUrl' in parsed.data).toBe(false);

        meSpy.mockRestore();
    });

    it('GET /v1/users/:id returns 422 when id is not a valid UUIDv7', async () => {
        const response = await app.handle(
            new Request('http://localhost/v1/users/invalid-id'),
        );

        expect(response.status).toBe(422);

        const body = await response.json();
        const parsed = takeUserByIdResponseSchema[422].parse(body);

        expect(parsed.success).toBe(false);
        expect(parsed.error.code).toBe('VALIDATION_ERROR');
        expect(parsed.error.details.fields.id).toBeDefined();
    });

    it('GET /v1/users/:id returns 404 with USER_NOT_FOUND when user does not exist', async () => {
        const userSpy = spyOn(
            usersService,
            'takePublicUserById',
        ).mockResolvedValue(null);

        const response = await app.handle(
            new Request(`http://localhost/v1/users/${validUserId}`),
        );

        expect(response.status).toBe(404);

        const body = await response.json();
        const parsed = takeUserByIdResponseSchema[404].parse(body);

        expect(parsed.success).toBe(false);
        expect(parsed.error.code).toBe('USER_NOT_FOUND');
        expect(parsed.error.message).toBe(USER_ERROR_MESSAGES.USER_NOT_FOUND);

        userSpy.mockRestore();
    });

    it('GET /v1/users/:id returns 200 with PublicUserDto and strips null fields to undefined', async () => {
        const mockRawDbUser = {
            id: validUserId,
            firstName: 'Ольга',
            lastName: null,
            patronymic: null,
            avatarUrl: null,
            userName: null,
        };

        const userSpy = spyOn(
            usersService,
            'takePublicUserById',
        ).mockResolvedValue(mockRawDbUser);

        const response = await app.handle(
            new Request(`http://localhost/v1/users/${validUserId}`),
        );

        expect(response.status).toBe(200);

        const body = await response.json();
        const parsed = takeUserByIdResponseSchema[200].parse(body);

        expect(parsed.success).toBe(true);
        expect(parsed.data.id).toBe(validUserId);
        expect(parsed.data.firstName).toBe('Ольга');
        expect('lastName' in parsed.data).toBe(false);
        expect('avatarUrl' in parsed.data).toBe(false);

        userSpy.mockRestore();
    });

    it('GET /v1/users returns 200 with paginated list and default meta', async () => {
        const response = await app.handle(
            new Request('http://localhost/v1/users'),
        );

        expect(response.status).toBe(200);

        const body = await response.json();
        const parsed = takeUsersResponseSchema[200].parse(body);

        expect(parsed.success).toBe(true);
        expect(Array.isArray(parsed.data.items)).toBe(true);
        expect(parsed.data.meta.page).toBe(1);
        expect(parsed.data.meta.limit).toBe(20);
        expect(parsed.data.meta.total).toBeGreaterThanOrEqual(25);
        expect(parsed.data.meta.totalPages).toBeGreaterThanOrEqual(2);
        expect(parsed.data.meta.hasNextPage).toBe(true);
        expect(parsed.data.meta.hasPrevPage).toBe(false);
    });

    it('GET /v1/users?page=2&limit=20 returns next page with hasPrevPage=true', async () => {
        const response = await app.handle(
            new Request('http://localhost/v1/users?page=2&limit=20'),
        );

        expect(response.status).toBe(200);

        const body = await response.json();
        const parsed = takeUsersResponseSchema[200].parse(body);

        expect(parsed.success).toBe(true);
        expect(parsed.data.meta.page).toBe(2);
        expect(parsed.data.meta.hasPrevPage).toBe(true);
    });

    it('GET /v1/users?search=Александр filters users by FTS across first name, last name, and patronymic', async () => {
        const response = await app.handle(
            new Request(
                'http://localhost/v1/users?search=' +
                    encodeURIComponent('Александр'),
            ),
        );

        expect(response.status).toBe(200);

        const body = await response.json();
        const parsed = takeUsersResponseSchema[200].parse(body);

        expect(parsed.success).toBe(true);
        expect(parsed.data.items.length).toBeGreaterThan(0);
        for (const user of parsed.data.items) {
            expect(
                user.firstName.includes('Александр') ||
                    (user.lastName && user.lastName.includes('Александр')) ||
                    (user.patronymic && user.patronymic.includes('Александр')),
            ).toBe(true);
        }
    });

    it('GET /v1/users?search=Смирнов filters users by last name using FTS', async () => {
        const response = await app.handle(
            new Request(
                'http://localhost/v1/users?search=' +
                    encodeURIComponent('Смирнов'),
            ),
        );

        expect(response.status).toBe(200);

        const body = await response.json();
        const parsed = takeUsersResponseSchema[200].parse(body);

        expect(parsed.success).toBe(true);
        expect(parsed.data.items.length).toBe(1);
        expect(parsed.data.items[0]?.lastName).toBe('Смирнов');
    });

    it('GET /v1/users?search=alex.smirnov@insignia.dev filters users by email using FTS', async () => {
        const response = await app.handle(
            new Request(
                'http://localhost/v1/users?search=' +
                    encodeURIComponent('alex.smirnov@insignia.dev'),
            ),
        );

        expect(response.status).toBe(200);

        const body = await response.json();
        const parsed = takeUsersResponseSchema[200].parse(body);

        expect(parsed.success).toBe(true);
        expect(parsed.data.items.length).toBe(1);
        expect(parsed.data.items[0]?.firstName).toBe('Александр');
    });

    it('GET /v1/users?page=0 returns 422 with validation error for page', async () => {
        const response = await app.handle(
            new Request('http://localhost/v1/users?page=0'),
        );

        expect(response.status).toBe(422);

        const body = await response.json();
        const parsed = takeUsersResponseSchema[422].parse(body);

        expect(parsed.success).toBe(false);
        expect(parsed.error.code).toBe('VALIDATION_ERROR');
    });

    it('GET /v1/users?limit=150 returns 422 with validation error for limit exceeding max', async () => {
        const response = await app.handle(
            new Request('http://localhost/v1/users?limit=150'),
        );

        expect(response.status).toBe(422);

        const body = await response.json();
        const parsed = takeUsersResponseSchema[422].parse(body);

        expect(parsed.success).toBe(false);
        expect(parsed.error.code).toBe('VALIDATION_ERROR');
    });

    it('GET /docs/json includes /v1/users and /v1/users/{id} OpenAPI documentation', async () => {
        const response = await app.handle(
            new Request('http://localhost/docs/json'),
        );

        expect(response.status).toBe(200);

        const schema = (await response.json()) as {
            paths: Record<
                string,
                { get: { responses: Record<string, unknown> } }
            >;
            components?: {
                schemas?: Record<string, unknown>;
            };
        };
        const usersListEndpoint = schema.paths['/v1/users'];
        const userEndpoint = schema.paths['/v1/users/{id}'];
        const meEndpoint = schema.paths['/v1/users/me'];

        expect(meEndpoint).toBeDefined();
        expect(meEndpoint?.get).toBeDefined();
        expect(meEndpoint?.get?.responses['200']).toBeDefined();
        expect(meEndpoint?.get?.responses['404']).toBeDefined();

        expect(usersListEndpoint).toBeDefined();
        expect(usersListEndpoint?.get).toBeDefined();
        expect(usersListEndpoint?.get?.responses['200']).toBeDefined();
        expect(usersListEndpoint?.get?.responses['422']).toBeDefined();
        expect(usersListEndpoint?.get?.responses['500']).toBeDefined();
        expect(usersListEndpoint?.get?.responses['503']).toBeDefined();

        expect(userEndpoint).toBeDefined();
        expect(userEndpoint?.get).toBeDefined();
        expect(userEndpoint?.get?.responses['200']).toBeDefined();
        expect(userEndpoint?.get?.responses['404']).toBeDefined();
        expect(userEndpoint?.get?.responses['422']).toBeDefined();
        expect(userEndpoint?.get?.responses['500']).toBeDefined();
        expect(userEndpoint?.get?.responses['503']).toBeDefined();

        const res200 = userEndpoint?.get?.responses['200'] as {
            description: string;
        };
        expect(res200.description).toBe(
            'Конверт успешного ответа с публичным профилем пользователя',
        );

        const res404 = userEndpoint?.get?.responses['404'] as {
            description: string;
        };
        expect(res404.description).toBe(
            'Конверт ответа с ошибкой: пользователь не найден',
        );

        const schemas = schema.components?.schemas ?? {};
        expect(schemas.ApiResponse).toBeDefined();
        expect(schemas.ApiErrorResponse).toBeDefined();
        expect(schemas.PaginationMeta).toBeDefined();
        expect(schemas.PaginationQuery).toBeDefined();
        expect(schemas.TakeUsersQuery).toBeDefined();
        expect(schemas.PaginatedPublicUsersResponse).toBeDefined();
        expect(schemas.PublicUserDTO).toBeDefined();
        expect(schemas.PublicUserResponse).toBeDefined();
        expect(schemas.UserProfileDTO).toBeDefined();
        expect(schemas.UserProfileResponse).toBeDefined();
        expect(schemas.UserErrorCode).toBeDefined();
        expect(schemas.UserErrorResponse).toBeDefined();
        expect(schemas.UserNotFoundErrorResponse).toBeDefined();
        expect(schemas.InternalServerErrorResponse).toBeDefined();
        expect(schemas.ServiceUnavailableResponse).toBeDefined();
        expect(schemas.TakeUserByIdParams).toBeDefined();
        expect(schemas.TakeUserByIdResponse).toBeUndefined();
        expect(schemas.UserBase).toBeUndefined();
        expect(schemas.TelegramAccountBase).toBeUndefined();
    });

    it('PATCH /v1/users/:id returns 501 NOT_IMPLEMENTED', async () => {
        const response = await app.handle(
            new Request(`http://localhost/v1/users/${validUserId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName: 'Иван' }),
            }),
        );

        expect(response.status).toBe(501);
        const body = notImplementedResponseSchema.parse(await response.json());
        expect(body.success).toBe(false);
        expect(body.error.code).toBe('NOT_IMPLEMENTED');
    });

    it('DELETE /v1/users/:id returns 501 NOT_IMPLEMENTED', async () => {
        const response = await app.handle(
            new Request(`http://localhost/v1/users/${validUserId}`, {
                method: 'DELETE',
            }),
        );

        expect(response.status).toBe(501);
        const body = notImplementedResponseSchema.parse(await response.json());
        expect(body.success).toBe(false);
        expect(body.error.code).toBe('NOT_IMPLEMENTED');
    });
});
