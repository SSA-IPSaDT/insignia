import { describe, expect, it } from 'bun:test';

import { app } from '#/app';

describe('RFC 9457 Problem Details HTML & JSON Documentation Endpoint', () => {
    it('GET /problems returns 200 HTML with complete problems catalog', async () => {
        const response = await app.handle(
            new Request('http://localhost/problems'),
        );

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toBe(
            'text/html; charset=utf-8',
        );

        const html = await response.text();
        expect(html).toContain('Каталог спецификаций проблем API');
        expect(html).toContain('USER_NOT_FOUND');
        expect(html).toContain('VALIDATION_ERROR');
        expect(html).toContain('DATABASE_UNAVAILABLE');
        expect(html).toContain('/problems/user-not-found');
    });

    it('GET /problems with Accept: application/json returns 200 JSON catalog collection', async () => {
        const response = await app.handle(
            new Request('http://localhost/problems', {
                headers: { accept: 'application/json' },
            }),
        );

        expect(response.status).toBe(200);
        const data = (await response.json()) as Array<{ code: string }>;
        expect(Array.isArray(data)).toBe(true);
        expect(data.some((d) => d.code === 'USER_NOT_FOUND')).toBe(true);
    });

    it('GET /problems/user-not-found returns 200 HTML with detailed documentation', async () => {
        const response = await app.handle(
            new Request('http://localhost/problems/user-not-found'),
        );

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toBe(
            'text/html; charset=utf-8',
        );

        const html = await response.text();
        expect(html).toContain('USER_NOT_FOUND');
        expect(html).toContain('HTTP 404');
        expect(html).toContain('Пользователь не найден');
        expect(html).toContain('Причины возникновения');
        expect(html).toContain('Как устранить ошибку (Remediation)');
        expect(html).toContain('Особенности архитектуры Insignia');
        expect(html).toContain('UUIDv7');
    });

    it('GET /problems/user-not-found with Accept: application/problem+json returns 200 JSON document', async () => {
        const response = await app.handle(
            new Request('http://localhost/problems/user-not-found', {
                headers: { accept: 'application/problem+json' },
            }),
        );

        expect(response.status).toBe(200);
        const doc = (await response.json()) as { code: string; status: number };
        expect(doc.code).toBe('USER_NOT_FOUND');
        expect(doc.status).toBe(404);
    });

    it('GET /problems/unknown-slug returns 404 HTML with helpful redirection to catalog', async () => {
        const response = await app.handle(
            new Request('http://localhost/problems/unknown-slug'),
        );

        expect(response.status).toBe(404);
        expect(response.headers.get('content-type')).toBe(
            'text/html; charset=utf-8',
        );

        const html = await response.text();
        expect(html).toContain('Тип проблемы не найден в спецификации');
        expect(html).toContain('href="/problems"');
    });
});
