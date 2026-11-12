import { describe, expect, it } from 'bun:test';

import type { ValidationErrorResponse } from '@insignia/contracts/response';
import env from '@insignia/env';
import Elysia from 'elysia';
import { z } from 'zod';

import { errorPlugin } from '../src/plugins/error.plugin';

describe('Elysia Error Plugin Validation Handler', () => {
    const testApp = new Elysia().use(errorPlugin).post(
        '/test-validation',
        ({ body }) => {
            return { success: true, body };
        },
        {
            body: z.object({
                email: z.email('Некорректная почта'),
                age: z.number().min(18, 'Минимальный возраст 18 лет'),
            }),
        },
    );

    it('intercepts validation errors and formats into standard RFC 9457 problem details structure', async () => {
        const response = await testApp.handle(
            new Request('http://localhost/test-validation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: 'bad-email',
                    age: 15,
                }),
            }),
        );

        expect(response.status).toBe(422);
        expect(response.headers.get('content-type')).toContain(
            'application/problem+json',
        );

        const json = await response.json();

        expect(json).toEqual({
            type: `${env.PUBLIC_API_URL.replace(/\/+$/, '')}/problems/validation-error`,
            title: 'Ошибка валидации входящих данных.',
            status: 422,
            detail: 'Ошибка валидации входящих данных.',
            instance: '/test-validation',
            code: 'VALIDATION_ERROR',
            invalidParams: [
                { name: 'email', reason: 'Некорректная почта' },
                { name: 'age', reason: 'Минимальный возраст 18 лет' },
            ],
            details: {
                fields: {
                    email: 'Некорректная почта',
                    age: 'Минимальный возраст 18 лет',
                },
            },
        });
    });

    it('works across nested sub-controllers because of global scope', async () => {
        const childController = new Elysia({ prefix: '/child' }).post(
            '/create',
            ({ body }) => ({ success: true, body }),
            {
                body: z.object({
                    username: z
                        .string()
                        .min(3, 'Имя пользователя слишком короткое'),
                }),
            },
        );

        const rootApp = new Elysia().use(errorPlugin).use(childController);

        const response = await rootApp.handle(
            new Request('http://localhost/child/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'ab' }),
            }),
        );

        expect(response.status).toBe(422);
        const json = (await response.json()) as ValidationErrorResponse;
        expect(json.code).toBe('VALIDATION_ERROR');
        expect(json.status).toBe(422);
        expect(json.type).toBe(
            `${env.PUBLIC_API_URL.replace(/\/+$/, '')}/problems/validation-error`,
        );
        expect(json.details?.fields.username).toBe(
            'Имя пользователя слишком короткое',
        );
    });

    it('formats NOT_FOUND error as standard RFC 9457 Problem Details on missing routes', async () => {
        const rootApp = new Elysia().use(errorPlugin);
        const response = await rootApp.handle(
            new Request('http://localhost/non-existing-route'),
        );

        expect(response.status).toBe(404);
        expect(response.headers.get('content-type')).toContain(
            'application/problem+json',
        );
        const json = await response.json();
        expect(json).toEqual({
            type: `${env.PUBLIC_API_URL.replace(/\/+$/, '')}/problems/not-found`,
            title: 'Запрашиваемый ресурс не найден.',
            status: 404,
            detail: 'Запрашиваемый ресурс не найден.',
            instance: '/non-existing-route',
            code: 'NOT_FOUND',
        });
    });

    it('formats unhandled exceptions as standard INTERNAL_SERVER_ERROR 500 response', async () => {
        const brokenApp = new Elysia().use(errorPlugin).get('/boom', () => {
            throw new Error('Unexpected crash in business logic');
        });

        const response = await brokenApp.handle(
            new Request('http://localhost/boom'),
        );

        expect(response.status).toBe(500);
        expect(response.headers.get('content-type')).toContain(
            'application/problem+json',
        );
        const json = await response.json();
        expect(json).toEqual({
            type: `${env.PUBLIC_API_URL.replace(/\/+$/, '')}/problems/internal-server-error`,
            title: 'Внутренняя непредвиденная ошибка сервера.',
            status: 500,
            detail: 'Внутренняя непредвиденная ошибка сервера.',
            instance: '/boom',
            code: 'INTERNAL_SERVER_ERROR',
        });
    });
});
