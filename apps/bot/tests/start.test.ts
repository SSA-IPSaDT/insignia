import { describe, expect, test } from 'bun:test';

import { handleStart } from '../src/start';

describe('handleStart', () => {
    test('replies with a greeting and payload', async () => {
        const replies: string[] = [];

        await handleStart(
            async (text) => {
                replies.push(text);
            },
            'Вадим',
            '/start promo',
        );

        expect(replies).toHaveLength(1);
        expect(replies[0]).toContain('Привет, Вадим!');
        expect(replies[0]).toContain('Код: promo');
    });

    test('replies without a payload block', async () => {
        const replies: string[] = [];

        await handleStart(
            async (text) => {
                replies.push(text);
            },
            'Вадим',
            '/start',
        );

        expect(replies[0]).not.toContain('Код:');
    });
});
