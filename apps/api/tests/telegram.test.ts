import { describe, expect, it } from 'bun:test';

import { notImplementedResponseSchema } from '@insignia/contracts/response';

import { app } from '#/app';

describe('Telegram Accounts API Endpoints', () => {
    const validId = '018f2780-2396-7a8e-a9d5-7389a0f69a53';

    it('POST /v1/users/accounts/telegram/sync returns 501 NOT_IMPLEMENTED', async () => {
        const response = await app.handle(
            new Request('http://localhost/v1/users/accounts/telegram/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    initData: 'query_id=123&user=%7B%22id%22%3A12345%7D',
                }),
            }),
        );

        expect(response.status).toBe(501);
        const body = notImplementedResponseSchema.parse(await response.json());
        expect(body.success).toBe(false);
        expect(body.error.code).toBe('NOT_IMPLEMENTED');
    });

    it('GET /v1/users/accounts/telegram/:id returns 501 NOT_IMPLEMENTED', async () => {
        const response = await app.handle(
            new Request(
                `http://localhost/v1/users/accounts/telegram/${validId}`,
            ),
        );

        expect(response.status).toBe(501);
        const body = notImplementedResponseSchema.parse(await response.json());
        expect(body.success).toBe(false);
        expect(body.error.code).toBe('NOT_IMPLEMENTED');
    });

    it('PATCH /v1/users/accounts/telegram/:id returns 501 NOT_IMPLEMENTED', async () => {
        const response = await app.handle(
            new Request(
                `http://localhost/v1/users/accounts/telegram/${validId}`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ allowsWriteToPm: true }),
                },
            ),
        );

        expect(response.status).toBe(501);
        const body = notImplementedResponseSchema.parse(await response.json());
        expect(body.success).toBe(false);
        expect(body.error.code).toBe('NOT_IMPLEMENTED');
    });

    it('DELETE /v1/users/accounts/telegram/:id returns 501 NOT_IMPLEMENTED', async () => {
        const response = await app.handle(
            new Request(
                `http://localhost/v1/users/accounts/telegram/${validId}`,
                {
                    method: 'DELETE',
                },
            ),
        );

        expect(response.status).toBe(501);
        const body = notImplementedResponseSchema.parse(await response.json());
        expect(body.success).toBe(false);
        expect(body.error.code).toBe('NOT_IMPLEMENTED');
    });
});
