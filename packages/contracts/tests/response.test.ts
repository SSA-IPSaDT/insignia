import { describe, expect, test } from 'bun:test';

import { z } from 'zod';

import {
    apiErrorResponseSchema,
    calculatePaginationMeta,
    COMMON_ERROR_MESSAGES,
    createApiErrorResponseSchema,
    createApiResponseSchema,
    createDomainEndpoint,
    createDomainErrors,
    createDomainPaginatedResponse,
    createDomainResponse,
    createErrorResponse,
    createPaginatedResponse,
    createPaginatedResponseSchema,
    createSuccessResponse,
    createValidationErrorResponse,
    DEFAULT_VALIDATION_ERROR_MESSAGE,
    paginationMetaSchema,
    paginationQuerySchema,
    validationErrorDetailsSchema,
    validationErrorResponseSchema,
} from '../src/index';

describe('Response Contract - Success Envelope', () => {
    const userSchema = z.object({
        id: z.string(),
        name: z.string(),
    });

    const userResponseSchema = createApiResponseSchema(userSchema);

    test('createApiResponseSchema validates correct success payload', () => {
        const payload = {
            success: true,
            data: {
                id: 'user_1',
                name: 'Alex',
            },
        };

        const result = userResponseSchema.safeParse(payload);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.data.name).toBe('Alex');
        }
    });

    test('createApiResponseSchema rejects payload when success is false', () => {
        const payload = {
            success: false,
            data: { id: '1', name: 'Alex' },
        };

        const result = userResponseSchema.safeParse(payload);
        expect(result.success).toBe(false);
    });

    test('createApiResponseSchema rejects payload when inner data is invalid', () => {
        const payload = {
            success: true,
            data: { id: 123 }, // missing name, id is number
        };

        const result = userResponseSchema.safeParse(payload);
        expect(result.success).toBe(false);
    });

    test('createSuccessResponse helper formats payload correctly', () => {
        const data = { role: 'admin' };
        const response = createSuccessResponse(data);

        expect(response).toEqual({
            success: true,
            data: { role: 'admin' },
        });
    });

    test('createApiResponseSchema supports custom description and simplified success description', () => {
        const customSchema = createApiResponseSchema(
            userSchema,
            'Кастомное описание конверта',
        );
        expect(customSchema.description).toBe('Кастомное описание конверта');
        expect(customSchema.shape.success.description).toBe(
            'Флаг успешности выполнения запроса',
        );
    });
});

describe('Response Contract - Error Envelope', () => {
    test('apiErrorResponseSchema parses standard common error', () => {
        const payload = {
            type: '/problems/not-found',
            title: 'Запрашиваемый ресурс не найден.',
            status: 404,
            detail: 'Entity not found',
            instance: '/test',
            code: 'NOT_FOUND',
            details: { id: '123' },
        };

        const result = apiErrorResponseSchema.safeParse(payload);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.code).toBe('NOT_FOUND');
            expect(result.data.status).toBe(404);
            expect(result.data.details).toEqual({ id: '123' });
        }
    });

    test('apiErrorResponseSchema rejects unknown common error code', () => {
        const payload = {
            type: '/problems/unknown',
            title: 'Unknown error',
            status: 400,
            detail: 'Some message',
            instance: '/test',
            code: 'RANDOM_UNKNOWN_CODE',
        };

        const result = apiErrorResponseSchema.safeParse(payload);
        expect(result.success).toBe(false);
    });

    test('createApiErrorResponseSchema allows custom error codes schema', () => {
        const customCodeSchema = z.enum(['EVENT_CLOSED', 'SLOTS_FULL']);
        const customErrorSchema = createApiErrorResponseSchema(
            customCodeSchema,
            'Кастомная ошибка',
        );

        const validPayload = {
            type: '/problems/event-closed',
            title: 'Регистрация закрыта',
            status: 400,
            detail: 'Registration closed',
            instance: '/events/1',
            code: 'EVENT_CLOSED',
        };
        expect(customErrorSchema.safeParse(validPayload).success).toBe(true);

        const invalidPayload = {
            type: '/problems/not-found',
            title: 'Not found',
            status: 404,
            detail: 'Registration closed',
            instance: '/events/1',
            code: 'NOT_FOUND', // not in customCodeSchema
        };
        expect(customErrorSchema.safeParse(invalidPayload).success).toBe(false);
    });

    test('createApiErrorResponseSchema supports custom description and simplified success description', () => {
        const customError = createApiErrorResponseSchema({
            description: 'Кастомное описание ошибки',
            slug: 'custom-error',
            title: 'Кастомная ошибка',
        });
        expect(customError.description).toBe('Кастомное описание ошибки');
        expect(customError.shape.type.description).toContain('Каноничный URI');
    });

    test('createErrorResponse uses default message from registry when omitted', () => {
        const response = createErrorResponse('NOT_FOUND');

        expect(response).toEqual({
            type: '/problems/not-found',
            title: COMMON_ERROR_MESSAGES.NOT_FOUND,
            status: 404,
            detail: COMMON_ERROR_MESSAGES.NOT_FOUND,
            instance: '/',
            code: 'NOT_FOUND',
        });
    });

    test('createErrorResponse allows custom message to override default message', () => {
        const customMessage = 'Пользователь не найден в системе';
        const response = createErrorResponse('NOT_FOUND', customMessage);

        expect(response.detail).toBe(customMessage);
        expect(response.title).toBe(COMMON_ERROR_MESSAGES.NOT_FOUND);
        expect(response.status).toBe(404);
    });

    test('createErrorResponse includes details when provided', () => {
        const details = { field: 'email', reason: 'invalid_format' };
        const response = createErrorResponse(
            'VALIDATION_ERROR',
            undefined,
            details,
        );

        expect(response.details).toEqual(details);
        expect(response.detail).toBe(COMMON_ERROR_MESSAGES.VALIDATION_ERROR);
        expect(response.status).toBe(422);
    });

    test('createErrorResponse falls back to formatted code for custom unknown codes', () => {
        const response = createErrorResponse('CUSTOM_NEW_ERROR' as any);

        expect(response.detail).toBe('CUSTOM_NEW_ERROR');
        expect(response.status).toBe(500);
        expect(response.type).toBe('/problems/custom-new-error');
    });
});

describe('Response Contract - Validation Error Envelope', () => {
    test('validationErrorResponseSchema validates correct validation error format', () => {
        const payload = {
            type: '/problems/validation-error',
            title: 'Ошибка валидации входящих данных.',
            status: 422,
            detail: 'Ошибка валидации входящих данных.',
            instance: '/test',
            code: 'VALIDATION_ERROR',
            invalidParams: [
                {
                    name: 'email',
                    reason: 'Некорректный адрес электронной почты',
                },
                { name: 'firstName', reason: 'Имя не может быть пустым' },
            ],
            details: {
                fields: {
                    email: 'Некорректный адрес электронной почты',
                    firstName: 'Имя не может быть пустым',
                },
            },
        };

        const result = validationErrorResponseSchema.safeParse(payload);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.code).toBe('VALIDATION_ERROR');
            expect(result.data.invalidParams?.[0]?.name).toBe('email');
            expect(result.data.details?.fields.email).toBe(
                'Некорректный адрес электронной почты',
            );
        }
    });

    test('validationErrorResponseSchema rejects error code other than VALIDATION_ERROR', () => {
        const payload = {
            type: '/problems/validation-error',
            title: 'Ошибка валидации',
            status: 422,
            detail: 'Ошибка валидации',
            instance: '/test',
            code: 'BAD_REQUEST',
            invalidParams: [{ name: 'name', reason: 'Ошибка' }],
        };

        const result = validationErrorResponseSchema.safeParse(payload);
        expect(result.success).toBe(false);
    });

    test('createValidationErrorResponse creates properly formatted payload with default message', () => {
        const fields = { username: 'Слишком короткое имя' };
        const response = createValidationErrorResponse(fields, undefined, {
            instance: '/users/create',
        });

        expect(response).toEqual({
            type: '/problems/validation-error',
            title: DEFAULT_VALIDATION_ERROR_MESSAGE,
            status: 422,
            detail: DEFAULT_VALIDATION_ERROR_MESSAGE,
            instance: '/users/create',
            code: 'VALIDATION_ERROR',
            invalidParams: [
                { name: 'username', reason: 'Слишком короткое имя' },
            ],
            details: { fields },
        });
    });

    test('createApiErrorResponseSchema infers details as optional and matches ApiErrorResponse', () => {
        const customErrorSchema = createApiErrorResponseSchema(
            z.literal('CUSTOM_NOT_FOUND'),
            'Кастомная ошибка',
        );

        type Inferred = z.infer<typeof customErrorSchema>;

        const errorPayload: Inferred = {
            type: '/problems/custom-not-found',
            title: 'Объект не найден',
            status: 404,
            detail: 'Объект не найден',
            instance: '/custom/1',
            code: 'CUSTOM_NOT_FOUND',
        };

        const parsed = customErrorSchema.safeParse(errorPayload);
        expect(parsed.success).toBe(true);
    });
});

describe('Domain Response & Endpoint Factories', () => {
    const testErrors = createDomainErrors({
        domain: 'организации',
        notFoundCode: 'ORGANIZATION_NOT_FOUND',
        messages: {
            ORGANIZATION_NOT_FOUND: 'Организация не найдена.',
            ORGANIZATION_ALREADY_EXISTS:
                'Организация с таким именем уже существует.',
            ORGANIZATION_SUSPENDED: 'Деятельность организации приостановлена.',
        } as const,
    });

    test('createDomainErrors generates correct codeSchema, messages, and schemas', () => {
        expect(testErrors.codeSchema.description).toBe(
            'Код ошибки организации',
        );
        expect(testErrors.errorResponseSchema.description).toBe(
            'Ответ API с ошибкой организации',
        );
        expect(testErrors.notFoundSchema?.description).toBe(
            'Ответ API: организации не найден(а)',
        );

        const messageDesc =
            testErrors.errorResponseSchema.shape.detail.description;
        expect(messageDesc).toContain('**Стандартные сообщения по кодам:**');
        expect(messageDesc).toContain(
            '- `ORGANIZATION_NOT_FOUND`: *«Организация не найдена.»*',
        );
        expect(messageDesc).toContain(
            '- `ORGANIZATION_ALREADY_EXISTS`: *«Организация с таким именем уже существует.»*',
        );
        expect(messageDesc).toContain(
            '- `ORGANIZATION_SUSPENDED`: *«Деятельность организации приостановлена.»*',
        );

        expect(testErrors.notFoundSchema?.shape.detail.description).toBe(
            'Организация не найдена.',
        );

        const validParsed = testErrors.codeSchema.safeParse(
            'ORGANIZATION_SUSPENDED',
        );
        expect(validParsed.success).toBe(true);

        const invalidParsed = testErrors.codeSchema.safeParse('UNKNOWN_CODE');
        expect(invalidParsed.success).toBe(false);
    });

    test('createDomainErrors creates typed error responses and not found responses', () => {
        const notFound = testErrors.createNotFound!();
        expect(notFound).toEqual({
            type: '/problems/organization-not-found',
            title: 'Организация не найдена.',
            status: 404,
            detail: 'Организация не найдена.',
            instance: '/',
            code: 'ORGANIZATION_NOT_FOUND',
        });

        const customError = testErrors.createError(
            'ORGANIZATION_SUSPENDED',
            undefined,
            { reason: 'payment' },
        );
        expect(customError).toEqual({
            type: '/problems/organization-suspended',
            title: 'Деятельность организации приостановлена.',
            status: 500,
            detail: 'Деятельность организации приостановлена.',
            instance: '/',
            code: 'ORGANIZATION_SUSPENDED',
            details: { reason: 'payment' },
        });
    });

    test('createDomainErrors createSpecificErrorSchema produces targeted error schema', () => {
        const conflictSchema = testErrors.createSpecificErrorSchema(
            'ORGANIZATION_ALREADY_EXISTS',
            'Конфликт имени организации',
        );

        expect(conflictSchema.description).toBe('Конфликт имени организации');
        expect(conflictSchema.shape.detail.description).toBe(
            'Организация с таким именем уже существует.',
        );
        const parsed = conflictSchema.safeParse({
            type: '/problems/organization-already-exists',
            title: 'Организация с таким именем уже существует.',
            status: 400,
            detail: 'Организация с таким именем уже существует.',
            instance: '/',
            code: 'ORGANIZATION_ALREADY_EXISTS',
        });
        expect(parsed.success).toBe(true);
    });

    test('createDomainResponse generates pure DTO schema and safe constructor', () => {
        const orgDtoSchema = z.object({
            id: z.string().uuid(),
            name: z.string(),
            slug: z
                .string()
                .nullable()
                .transform((v) => v ?? undefined),
        });

        const orgResponse = createDomainResponse(orgDtoSchema, 'организацией');

        expect(orgResponse.schema.description).toBe('Ответ API с организацией');

        const rawDbOrg = {
            id: '018f2780-2396-7a8e-a9d5-7389a0f69a53',
            name: 'Insignia Org',
            slug: null,
        };

        const result = orgResponse.create(rawDbOrg);
        expect(result.name).toBe('Insignia Org');
        expect(result.slug).toBeUndefined();

        const json = JSON.parse(JSON.stringify(result));
        expect('slug' in json).toBe(false);
    });

    test('createDomainEndpoint injects standard error schemas (422, 500, 501, 503) and assembles route contract', () => {
        const paramsSchema = z.object({ id: z.string().uuid() });
        const successSchema = createApiResponseSchema(
            z.object({ ok: z.boolean() }),
        );

        const endpoint = createDomainEndpoint({
            params: paramsSchema,
            response: {
                200: successSchema,
                404: testErrors.notFoundSchema!,
            },
            detail: {
                summary: 'Тестовый эндпоинт',
            },
        });

        expect(endpoint.params).toBe(paramsSchema);
        expect(endpoint.response[200]).toBe(successSchema);
        expect(endpoint.response[404]).toBe(testErrors.notFoundSchema);
        expect(endpoint.response[422]).toBeDefined();
        expect(endpoint.response[500]).toBeDefined();
        expect(endpoint.response[501]).toBeDefined();
        expect(endpoint.response[503]).toBeDefined();
        expect(endpoint.detail?.summary).toBe('Тестовый эндпоинт');
    });
});

describe('Pagination & Paginated Envelope', () => {
    test('paginationQuerySchema applies default values', () => {
        const parsed = paginationQuerySchema.parse({});
        expect(parsed.page).toBe(1);
        expect(parsed.limit).toBe(20);
        expect(parsed.sortOrder).toBe('desc');
        expect(parsed.search).toBeUndefined();
    });

    test('paginationQuerySchema coerces string numbers and validates bounds', () => {
        const parsed = paginationQuerySchema.parse({
            page: '3',
            limit: '50',
            search: '  тест  ',
            sortOrder: 'asc',
        });
        expect(parsed.page).toBe(3);
        expect(parsed.limit).toBe(50);
        expect(parsed.search).toBe('тест');
        expect(parsed.sortOrder).toBe('asc');

        expect(paginationQuerySchema.safeParse({ page: 0 }).success).toBe(
            false,
        );
        expect(paginationQuerySchema.safeParse({ limit: 101 }).success).toBe(
            false,
        );
    });

    test('calculatePaginationMeta correctly computes totalPages, hasNextPage, and hasPrevPage', () => {
        // total = 0
        const empty = calculatePaginationMeta({ total: 0, page: 1, limit: 10 });
        expect(empty.total).toBe(0);
        expect(empty.totalPages).toBe(0);
        expect(empty.hasNextPage).toBe(false);
        expect(empty.hasPrevPage).toBe(false);

        // total = 25, limit = 10, page = 1
        const page1 = calculatePaginationMeta({
            total: 25,
            page: 1,
            limit: 10,
        });
        expect(page1.totalPages).toBe(3);
        expect(page1.hasNextPage).toBe(true);
        expect(page1.hasPrevPage).toBe(false);

        // page = 2
        const page2 = calculatePaginationMeta({
            total: 25,
            page: 2,
            limit: 10,
        });
        expect(page2.hasNextPage).toBe(true);
        expect(page2.hasPrevPage).toBe(true);

        // page = 3 (last page)
        const page3 = calculatePaginationMeta({
            total: 25,
            page: 3,
            limit: 10,
        });
        expect(page3.hasNextPage).toBe(false);
        expect(page3.hasPrevPage).toBe(true);
    });

    test('createPaginatedResponse wraps items and calculated meta', () => {
        const res = createPaginatedResponse({
            items: ['item1', 'item2'],
            total: 2,
            page: 1,
            limit: 10,
        });
        expect(res.items).toEqual(['item1', 'item2']);
        expect(res.meta.total).toBe(2);
        expect(res.meta.totalPages).toBe(1);
    });

    test('createDomainPaginatedResponse transforms items and produces valid PaginatedData', () => {
        const itemDtoSchema = z.object({
            id: z.string(),
            title: z.string(),
            note: z
                .string()
                .nullable()
                .transform((v) => v ?? undefined),
        });

        const paginatedFactory = createDomainPaginatedResponse(
            itemDtoSchema,
            'списком элементов',
        );

        expect(paginatedFactory.schema.description).toBe(
            'Пагинированный ответ со списком элементов',
        );

        const rawItems = [
            { id: '1', title: 'First', note: null },
            { id: '2', title: 'Second', note: 'Important' },
        ];

        const response = paginatedFactory.create({
            items: rawItems,
            total: 2,
            page: 1,
            limit: 10,
        });

        expect(response.items[0].note).toBeUndefined();
        expect(response.items[1].note).toBe('Important');
        expect(response.meta.total).toBe(2);
    });

    test('createDomainResponse.wrap and createDomainPaginatedResponse.wrap wrap data without calling Zod parse', () => {
        let parseCallCount = 0;
        const testSchema = z.object({
            id: z.string(),
            name: z.string().transform((v) => {
                parseCallCount++;
                return v.toUpperCase();
            }),
        });

        const singleFactory = createDomainResponse(testSchema, 'тестом');
        const paginatedFactory = createDomainPaginatedResponse(
            testSchema,
            'списком тестов',
        );

        // .wrap не вызывает dtoSchema.parse()
        const rawSingle = { id: 'test-1', name: 'alice' };
        const wrappedSingle = singleFactory.wrap(rawSingle);

        expect(wrappedSingle).toBe(
            rawSingle as unknown as { id: string; name: string },
        );
        expect(parseCallCount).toBe(0);

        // .wrap для пагинации не вызывает dtoSchema.parse() для элементов
        const rawItems = [
            { id: 'test-1', name: 'bob' },
            { id: 'test-2', name: 'charlie' },
        ];
        const wrappedPaginated = paginatedFactory.wrap({
            items: rawItems,
            total: 2,
            page: 1,
            limit: 10,
        });

        expect(wrappedPaginated.items).toBe(
            rawItems as unknown as { id: string; name: string }[],
        );
        expect(wrappedPaginated.meta.total).toBe(2);
        expect(parseCallCount).toBe(0);
    });
});
