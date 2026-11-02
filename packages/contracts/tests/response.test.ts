import { describe, expect, test } from 'bun:test';

import { z } from 'zod';

import {
    apiErrorResponseSchema,
    COMMON_ERROR_MESSAGES,
    createApiErrorResponseSchema,
    createApiResponseSchema,
    createErrorResponse,
    createSuccessResponse,
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
