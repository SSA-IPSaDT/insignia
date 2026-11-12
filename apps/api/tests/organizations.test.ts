import { describe, expect, it } from 'bun:test';

import { notImplementedResponseSchema } from '@insignia/contracts/response';

import { app } from '#/app';

describe('Organizations API Endpoints', () => {
    const validId = '018f2780-2396-7a8e-a9d5-7389a0f69a53';

    it('GET /v1/organizations returns 501 NOT_IMPLEMENTED', async () => {
        const response = await app.handle(
            new Request('http://localhost/v1/organizations'),
        );

        expect(response.status).toBe(501);
        const body = notImplementedResponseSchema.parse(await response.json());
        expect(body.code).toBe('NOT_IMPLEMENTED');
        expect(body.status).toBe(501);
    });

    it('POST /v1/organizations returns 501 NOT_IMPLEMENTED', async () => {
        const response = await app.handle(
            new Request('http://localhost/v1/organizations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Тестовая Организация',
                }),
            }),
        );

        expect(response.status).toBe(501);
        const body = notImplementedResponseSchema.parse(await response.json());
        expect(body.code).toBe('NOT_IMPLEMENTED');
        expect(body.status).toBe(501);
    });

    it('GET /v1/organizations/:id returns 501 NOT_IMPLEMENTED', async () => {
        const response = await app.handle(
            new Request(`http://localhost/v1/organizations/${validId}`),
        );

        expect(response.status).toBe(501);
        const body = notImplementedResponseSchema.parse(await response.json());
        expect(body.code).toBe('NOT_IMPLEMENTED');
        expect(body.status).toBe(501);
    });

    it('PATCH /v1/organizations/:id returns 501 NOT_IMPLEMENTED', async () => {
        const response = await app.handle(
            new Request(`http://localhost/v1/organizations/${validId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: 'Новое описание',
                }),
            }),
        );

        expect(response.status).toBe(501);
        const body = notImplementedResponseSchema.parse(await response.json());
        expect(body.code).toBe('NOT_IMPLEMENTED');
        expect(body.status).toBe(501);
    });

    it('DELETE /v1/organizations/:id returns 501 NOT_IMPLEMENTED', async () => {
        const response = await app.handle(
            new Request(`http://localhost/v1/organizations/${validId}`, {
                method: 'DELETE',
            }),
        );

        expect(response.status).toBe(501);
        const body = notImplementedResponseSchema.parse(await response.json());
        expect(body.code).toBe('NOT_IMPLEMENTED');
        expect(body.status).toBe(501);
    });
});
