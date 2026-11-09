import { describe, expect, test } from 'bun:test';

import type {
    ApiErrorResponse,
    ApiResponse,
    PaginatedApiResponse,
} from '@insignia/contracts/common';
import type { PublicUserDto, UserDto } from '@insignia/contracts/users';
import { Temporal } from 'temporal-polyfill';

import { createInsigniaClient } from '#';

describe('SDK UsersModule (Result Pattern & Cursor Paginator)', () => {
    const mockUser: PublicUserDto = {
        id: '01931234-5678-7000-8000-123456789abc',
        firstName: 'Иван',
        lastName: 'Иванов',
        patronymic: undefined,
        userName: 'ivanov',
        avatarUrl: undefined,
    };

    const mockMeUser: UserDto = {
        id: '01931234-5678-7000-8000-123456789abc',
        firstName: 'Иван',
        lastName: 'Иванов',
        patronymic: undefined,
        userName: 'ivanov',
        avatarUrl: undefined,
        email: 'ivan@example.com',
        phone: undefined,
        birthDate: undefined,
        maxOrganizationCanCreate: 3,
        createdAt: Temporal.Instant.from('2026-11-09T00:00:00.000Z'),
        updatedAt: Temporal.Instant.from('2026-11-09T00:00:00.000Z'),
    };

    test('takeMe returns UserDto on 200', async () => {
        const mockResponse: ApiResponse<UserDto> = {
            success: true,
            data: mockMeUser,
        };

        let capturedUrl = '';
        const mockFetch = (async (input: RequestInfo | URL) => {
            capturedUrl = input instanceof Request ? input.url : String(input);
            return new Response(JSON.stringify(mockResponse), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }) as unknown as typeof fetch;

        const client = createInsigniaClient({
            baseUrl: 'http://api.insignia.local',
            fetch: mockFetch,
        });

        const res = await client.users.takeMe();

        expect(capturedUrl).toBe('http://api.insignia.local/v1/users/me');
        expect(res.success).toBe(true);
        if (res.success) {
            expect(res.data.id).toBe(mockMeUser.id);
            expect(res.data.email).toBe('ivan@example.com');
            expect(res.data.maxOrganizationCanCreate).toBe(3);
            expect(res.data.createdAt).toBeInstanceOf(Temporal.Instant);
            expect(res.data.updatedAt).toBeInstanceOf(Temporal.Instant);
        }

        // Тестируем алиас me()
        const aliasRes = await client.users.me();
        expect(aliasRes.success).toBe(true);
    });

    test('takeUserById returns PublicUserDto on 200', async () => {
        const mockResponse: ApiResponse<PublicUserDto> = {
            success: true,
            data: mockUser,
        };

        let capturedUrl = '';
        const mockFetch = (async (input: RequestInfo | URL) => {
            capturedUrl = input instanceof Request ? input.url : String(input);
            return new Response(JSON.stringify(mockResponse), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }) as unknown as typeof fetch;

        const client = createInsigniaClient({
            baseUrl: 'http://api.insignia.local',
            fetch: mockFetch,
        });

        const res = await client.users.takeUserById(mockUser.id);

        expect(capturedUrl).toBe(
            `http://api.insignia.local/v1/users/${mockUser.id}`,
        );
        expect(res.success).toBe(true);
        if (res.success) {
            expect(res.data.id).toBe(mockUser.id);
            expect(res.data.firstName).toBe('Иван');
        }
    });

    test('takeUserById returns SdkApiError on 404 NOT_FOUND', async () => {
        const mockErrorResponse: ApiErrorResponse<'USER_NOT_FOUND'> = {
            success: false,
            error: {
                code: 'USER_NOT_FOUND',
                message: 'Пользователь не найден.',
            },
        };

        const mockFetch = (async () => {
            return new Response(JSON.stringify(mockErrorResponse), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }) as unknown as typeof fetch;

        const client = createInsigniaClient({
            baseUrl: 'http://api.insignia.local',
            fetch: mockFetch,
        });

        const res = await client.users.takeUserById('non-existent-id');

        expect(res.success).toBe(false);
        if (!res.success) {
            expect(res.error.type).toBe('api');
            expect(res.error.status).toBe(404);
            expect(res.error.code).toBe('USER_NOT_FOUND');
            expect(res.error.message).toBe('Пользователь не найден.');
        }
    });

    test('takeUsers serializes searchParams and returns PaginatedData', async () => {
        const mockResponse: PaginatedApiResponse<PublicUserDto> = {
            success: true,
            data: {
                items: [mockUser],
                meta: {
                    page: 2,
                    limit: 10,
                    total: 25,
                    totalPages: 3,
                    hasNextPage: true,
                    hasPrevPage: true,
                },
            },
        };

        let capturedUrl = '';
        const mockFetch = (async (input: RequestInfo | URL) => {
            capturedUrl = input instanceof Request ? input.url : String(input);
            return new Response(JSON.stringify(mockResponse), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }) as unknown as typeof fetch;

        const client = createInsigniaClient({
            baseUrl: 'http://api.insignia.local',
            fetch: mockFetch,
        });

        const res = await client.users.takeUsers({
            page: 2,
            limit: 10,
            search: 'Иван',
            sortBy: 'firstName',
            sortOrder: 'asc',
        });

        const parsedUrl = new URL(capturedUrl);
        expect(parsedUrl.pathname).toBe('/v1/users');
        expect(parsedUrl.searchParams.get('page')).toBe('2');
        expect(parsedUrl.searchParams.get('limit')).toBe('10');
        expect(parsedUrl.searchParams.get('search')).toBe('Иван');
        expect(parsedUrl.searchParams.get('sortBy')).toBe('firstName');
        expect(parsedUrl.searchParams.get('sortOrder')).toBe('asc');

        expect(res.success).toBe(true);
        if (res.success) {
            expect(res.data.items.length).toBe(1);
            expect(res.data.meta.page).toBe(2);
            expect(res.data.meta.totalPages).toBe(3);
        }
    });

    test('cursor creates lazy paginator with state and advances pages via next()', async () => {
        const requestedPages: number[] = [];

        const mockFetch = (async (input: RequestInfo | URL) => {
            const url = new URL(
                input instanceof Request ? input.url : String(input),
            );
            const page = Number(url.searchParams.get('page') ?? 1);
            const limit = Number(url.searchParams.get('limit') ?? 10);
            requestedPages.push(page);

            const mockResponse: PaginatedApiResponse<PublicUserDto> = {
                success: true,
                data: {
                    items: [{ ...mockUser, id: `user-${page}` }],
                    meta: {
                        page,
                        limit,
                        total: 30,
                        totalPages: 3,
                        hasNextPage: page < 3,
                        hasPrevPage: page > 1,
                    },
                },
            };

            return new Response(JSON.stringify(mockResponse), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }) as unknown as typeof fetch;

        const client = createInsigniaClient({
            baseUrl: 'http://api.insignia.local',
            fetch: mockFetch,
        });

        // 1. Создаем курсор — запросов еще не должно быть
        const cursor = client.users.cursor({ search: 'Иван' }, 10);
        expect(requestedPages.length).toBe(0);
        expect(cursor.page).toBe(0);

        // 2. Первая страница
        const p1 = await cursor.next();
        expect(requestedPages).toEqual([1]);
        expect(p1.success).toBe(true);
        if (p1.success) {
            expect(p1.data.items[0]?.id).toBe('user-1');
            expect(p1.data.meta.page).toBe(1);
            expect(p1.data.meta.hasNextPage).toBe(true);
        }
        expect(cursor.page).toBe(1);
        expect(cursor.current.meta.page).toBe(1);

        // 3. Вторая страница
        const p2 = await cursor.next();
        expect(requestedPages).toEqual([1, 2]);
        expect(p2.success).toBe(true);
        if (p2.success) {
            expect(p2.data.items[0]?.id).toBe('user-2');
            expect(p2.data.meta.page).toBe(2);
        }
        expect(cursor.page).toBe(2);
        expect(cursor.current.meta.page).toBe(2);

        // 4. Проверяем алиас paginate
        const paginatorAlias = client.users.paginate({ search: 'Иван' });
        expect(typeof paginatorAlias.next).toBe('function');
    });
});
