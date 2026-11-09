import { describe, expect, test } from 'bun:test';

import {
    createOrganizationDtoSchema,
    createOrganizationEndpoint,
    deleteOrganizationDtoSchema,
    deleteOrganizationEndpoint,
    ORGANIZATION_ERROR_MESSAGES,
    organizationBaseSchema,
    organizationDtoSchema,
    organizationErrors,
    organizationStatusSchema,
    publicOrganizationDtoSchema,
    takeOrganizationByIdEndpoint,
    takeOrganizationsEndpoint,
    takeOrganizationsQuerySchema,
    updateOrganizationDtoSchema,
    updateOrganizationEndpoint,
} from '../src/organizations';

describe('Organizations Contracts Validation', () => {
    const validOrgId = '018f2780-2396-7a8e-a9d5-7389a0f69a53';
    const validOwnerId = '018f2780-2396-7a8e-a9d5-7389a0f69a54';
    const nowIso = '2026-11-08T12:00:00.000Z';

    const validOrgBase = {
        id: validOrgId,
        logoUrl: 'https://example.com/logo.png',
        name: 'Insignia Foundation',
        slug: 'insignia-foundation',
        description: 'Платформа для мероприятий и сообществ',
        isVerified: true,
        ownerId: validOwnerId,
        status: 'active' as const,
        createdAt: nowIso,
        updatedAt: nowIso,
        deletedAt: null,
    };

    test('organizationBaseSchema validates complete valid organization', () => {
        const result = organizationBaseSchema.safeParse(validOrgBase);
        expect(result.success).toBe(true);
    });

    test('organizationBaseSchema allows nullable fields to be null', () => {
        const minimalOrg = {
            id: validOrgId,
            logoUrl: null,
            name: 'Insignia',
            slug: null,
            description: null,
            isVerified: false,
            ownerId: null,
            status: 'active' as const,
            createdAt: nowIso,
            updatedAt: nowIso,
            deletedAt: null,
        };

        const result = organizationBaseSchema.safeParse(minimalOrg);
        expect(result.success).toBe(true);
    });

    test('organizationBaseSchema rejects invalid slug format', () => {
        const invalid = {
            ...validOrgBase,
            slug: 'INVALID SLUG WITH SPACES!',
        };
        const result = organizationBaseSchema.safeParse(invalid);
        expect(result.success).toBe(false);
    });

    test('organizationBaseSchema rejects slug shorter than 3 characters', () => {
        const invalid = {
            ...validOrgBase,
            slug: 'ab',
        };
        const result = organizationBaseSchema.safeParse(invalid);
        expect(result.success).toBe(false);
    });

    test('organizationBaseSchema rejects name shorter than 2 characters', () => {
        const invalid = {
            ...validOrgBase,
            name: 'A',
        };
        const result = organizationBaseSchema.safeParse(invalid);
        expect(result.success).toBe(false);
    });

    test('publicOrganizationDtoSchema strips sensitive and null fields when serialized', () => {
        const rawDbOrg = {
            id: validOrgId,
            logoUrl: null,
            name: 'Insignia',
            slug: 'insignia',
            description: null,
            isVerified: false,
            status: 'active',
            createdAt: nowIso,
        };

        const parsed = publicOrganizationDtoSchema.parse(rawDbOrg);
        expect(parsed.logoUrl).toBeUndefined();
        expect(parsed.description).toBeUndefined();
        expect(parsed.name).toBe('Insignia');

        const json = JSON.parse(JSON.stringify(parsed));
        expect('logoUrl' in json).toBe(false);
        expect('description' in json).toBe(false);
    });

    test('createOrganizationDtoSchema validates creation input', () => {
        const valid = {
            name: 'Новое Сообщество',
            slug: 'new-community',
            description: 'Описание сообщества',
        };
        const parsed = createOrganizationDtoSchema.safeParse(valid);
        expect(parsed.success).toBe(true);
    });

    test('updateOrganizationDtoSchema allows partial updates', () => {
        const valid = {
            description: 'Обновленное описание',
            status: 'archived' as const,
        };
        const parsed = updateOrganizationDtoSchema.safeParse(valid);
        expect(parsed.success).toBe(true);
    });

    test('organizationErrors generates correct codes and messages', () => {
        expect(organizationErrors.codeSchema.description).toBe(
            'Код ошибки организации',
        );
        expect(organizationErrors.notFoundSchema?.description).toBe(
            'Конверт ответа с ошибкой: организация не найдена',
        );

        const error = organizationErrors.createError('ORGANIZATION_NOT_FOUND');
        expect(error.error.message).toBe(
            ORGANIZATION_ERROR_MESSAGES.ORGANIZATION_NOT_FOUND,
        );

        const notFound = organizationErrors.createNotFound!();
        expect(notFound.error.code).toBe('ORGANIZATION_NOT_FOUND');
    });

    test('takeOrganizationsEndpoint defines standard response codes and 501', () => {
        expect(takeOrganizationsEndpoint.response[200]).toBeDefined();
        expect(takeOrganizationsEndpoint.response[422]).toBeDefined();
        expect(takeOrganizationsEndpoint.response[500]).toBeDefined();
        expect(takeOrganizationsEndpoint.response[501]).toBeDefined();
        expect(takeOrganizationsEndpoint.response[503]).toBeDefined();
    });

    test('createOrganizationEndpoint defines 201, 409, and standard response codes', () => {
        expect(createOrganizationEndpoint.response[201]).toBeDefined();
        expect(createOrganizationEndpoint.response[409]).toBeDefined();
        expect(createOrganizationEndpoint.response[501]).toBeDefined();
    });

    test('updateOrganizationEndpoint and deleteOrganizationEndpoint define 404, 200, and 501', () => {
        expect(updateOrganizationEndpoint.response[200]).toBeDefined();
        expect(updateOrganizationEndpoint.response[404]).toBeDefined();
        expect(updateOrganizationEndpoint.response[501]).toBeDefined();

        expect(deleteOrganizationEndpoint.response[200]).toBeDefined();
        expect(deleteOrganizationEndpoint.response[404]).toBeDefined();
        expect(deleteOrganizationEndpoint.response[501]).toBeDefined();
    });

    test('takeOrganizationsQuerySchema applies defaults', () => {
        const parsed = takeOrganizationsQuerySchema.parse({});
        expect(parsed.page).toBe(1);
        expect(parsed.limit).toBe(20);
        expect(parsed.sortBy).toBe('createdAt');
    });
});
