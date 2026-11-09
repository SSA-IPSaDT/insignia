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
            success: false,
            error: {
                code: 'NOT_FOUND',
                message: 'Entity not found',
                details: { id: '123' },
            },
        };

        const result = apiErrorResponseSchema.safeParse(payload);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.error.code).toBe('NOT_FOUND');
            expect(result.data.error.details).toEqual({ id: '123' });
        }
    });

    test('apiErrorResponseSchema rejects unknown common error code', () => {
        const payload = {
            success: false,
            error: {
                code: 'RANDOM_UNKNOWN_CODE',
                message: 'Some message',
            },
        };

        const result = apiErrorResponseSchema.safeParse(payload);
        expect(result.success).toBe(false);
    });

    test('createApiErrorResponseSchema allows custom error codes schema', () => {
        const customCodeSchema = z.enum(['EVENT_CLOSED', 'SLOTS_FULL']);
        const customErrorSchema =
            createApiErrorResponseSchema(customCodeSchema);

        const validPayload = {
            success: false,
            error: {
                code: 'EVENT_CLOSED',
                message: 'Registration closed',
            },
        };
        expect(customErrorSchema.safeParse(validPayload).success).toBe(true);

        const invalidPayload = {
            success: false,
            error: {
                code: 'NOT_FOUND', // not in customCodeSchema
                message: 'Registration closed',
            },
        };
        expect(customErrorSchema.safeParse(invalidPayload).success).toBe(false);
    });

    test('createApiErrorResponseSchema supports custom description and simplified success description', () => {
        const customError = createApiErrorResponseSchema(
            undefined,
            undefined,
            'Кастомное описание ошибки',
        );
        expect(customError.description).toBe('Кастомное описание ошибки');
        expect(customError.shape.success.description).toBe(
            'Флаг успешности ответа',
        );
    });

    test('createErrorResponse uses default message from registry when omitted', () => {
        const response = createErrorResponse('NOT_FOUND');

        expect(response).toEqual({
            success: false,
            error: {
                code: 'NOT_FOUND',
                message: COMMON_ERROR_MESSAGES.NOT_FOUND,
            },
        });
    });

    test('createErrorResponse allows custom message to override default message', () => {
        const customMessage = 'Пользователь не найден в системе';
        const response = createErrorResponse('NOT_FOUND', customMessage);

        expect(response.error.message).toBe(customMessage);
    });

    test('createErrorResponse includes details when provided', () => {
        const details = { field: 'email', reason: 'invalid_format' };
        const response = createErrorResponse(
            'VALIDATION_ERROR',
            undefined,
            details,
        );

        expect(response.error.details).toEqual(details);
        expect(response.error.message).toBe(
            COMMON_ERROR_MESSAGES.VALIDATION_ERROR,
        );
    });

    test('createErrorResponse falls back to formatted code for custom unknown codes', () => {
        const response = createErrorResponse('CUSTOM_NEW_ERROR');

        expect(response.error.message).toBe('Ошибка: CUSTOM_NEW_ERROR');
    });
});

describe('Response Contract - Validation Error Envelope', () => {
    test('validationErrorResponseSchema validates correct validation error format', () => {
        const payload = {
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Ошибка валидации входящих данных.',
                details: {
                    fields: {
                        email: 'Некорректный адрес электронной почты',
                        firstName: 'Имя не может быть пустым',
                    },
                },
            },
        };

        const result = validationErrorResponseSchema.safeParse(payload);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.error.code).toBe('VALIDATION_ERROR');
            expect(result.data.error.details.fields.email).toBe(
                'Некорректный адрес электронной почты',
            );
        }
    });

    test('validationErrorResponseSchema rejects error code other than VALIDATION_ERROR', () => {
        const payload = {
            success: false,
            error: {
                code: 'BAD_REQUEST',
                message: 'Ошибка валидации',
                details: {
                    fields: { name: 'Ошибка' },
                },
            },
        };

        const result = validationErrorResponseSchema.safeParse(payload);
        expect(result.success).toBe(false);
    });

    test('createValidationErrorResponse creates properly formatted payload with default message', () => {
        const fields = { username: 'Слишком короткое имя' };
        const response = createValidationErrorResponse(fields);

        expect(response).toEqual({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: DEFAULT_VALIDATION_ERROR_MESSAGE,
                details: { fields },
            },
        });
    });

    test('createApiErrorResponseSchema infers details as optional and matches ApiErrorResponse', () => {
        const customErrorSchema = createApiErrorResponseSchema(
            z.literal('CUSTOM_NOT_FOUND'),
            'Кастомная ошибка',
        );

        type Inferred = z.infer<typeof customErrorSchema>;

        const errorPayload: Inferred = {
            success: false,
            error: {
                code: 'CUSTOM_NOT_FOUND',
                message: 'Объект не найден',
            },
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
            'Конверт ответа с ошибкой: организации не найден',
        );

        const messageDesc =
            testErrors.errorResponseSchema.shape.error.shape.message
                .description;
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

        expect(
            testErrors.notFoundSchema?.shape.error.shape.message.description,
        ).toBe('Организация не найдена.');

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
            success: false,
            error: {
                code: 'ORGANIZATION_NOT_FOUND',
                message: 'Организация не найдена.',
            },
        });

        const customError = testErrors.createError(
            'ORGANIZATION_SUSPENDED',
            undefined,
            { reason: 'payment' },
        );
        expect(customError).toEqual({
            success: false,
            error: {
                code: 'ORGANIZATION_SUSPENDED',
                message: 'Деятельность организации приостановлена.',
                details: { reason: 'payment' },
            },
        });
    });

    test('createDomainErrors createSpecificErrorSchema produces targeted error schema', () => {
        const conflictSchema = testErrors.createSpecificErrorSchema(
            'ORGANIZATION_ALREADY_EXISTS',
            'Конфликт имени организации',
        );

        expect(conflictSchema.description).toBe('Конфликт имени организации');
        expect(conflictSchema.shape.error.shape.message.description).toBe(
            'Организация с таким именем уже существует.',
        );
        const parsed = conflictSchema.safeParse({
            success: false,
            error: {
                code: 'ORGANIZATION_ALREADY_EXISTS',
                message: 'Организация с таким именем уже существует.',
            },
        });
        expect(parsed.success).toBe(true);
    });

    test('createDomainResponse generates envelope schema and safe constructor', () => {
        const orgDtoSchema = z.object({
            id: z.string().uuid(),
            name: z.string(),
            slug: z
                .string()
                .nullable()
                .transform((v) => v ?? undefined),
        });

        const orgResponse = createDomainResponse(orgDtoSchema, 'организацией');

        expect(orgResponse.schema.description).toBe(
            'Конверт успешного ответа с организацией',
        );

        const rawDbOrg = {
            id: '018f2780-2396-7a8e-a9d5-7389a0f69a53',
            name: 'Insignia Org',
            slug: null,
        };

        const result = orgResponse.create(rawDbOrg);
        expect(result.success).toBe(true);
        expect(result.data.name).toBe('Insignia Org');
        expect(result.data.slug).toBeUndefined();

        const json = JSON.parse(JSON.stringify(result));
        expect('slug' in json.data).toBe(false);
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
        expect(res.success).toBe(true);
        expect(res.data.items).toEqual(['item1', 'item2']);
        expect(res.data.meta.total).toBe(2);
        expect(res.data.meta.totalPages).toBe(1);
    });

    test('createDomainPaginatedResponse transforms items and produces valid envelope', () => {
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
            'Конверт успешного ответа со списком элементов',
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

        expect(response.success).toBe(true);
        expect(response.data.items[0].note).toBeUndefined();
        expect(response.data.items[1].note).toBe('Important');
        expect(response.data.meta.total).toBe(2);
    });
});
