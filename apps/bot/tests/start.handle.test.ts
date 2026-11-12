import { describe, expect, test } from 'bun:test';

import type { BotContext } from '#telegram/context';
import { initialSessionData } from '#telegram/context';
import startHandle from '#telegram/handlers/start.handle';

describe('startHandle', () => {
    test('replies to user with start view', async () => {
        let sentText = '';
        let sentOptions: Record<string, unknown> | undefined;

        const ctx = {
            from: { first_name: 'Дмитрий' },
            message: { text: '/start token123' },
            session: initialSessionData(),
            reply: async (text: string, options?: Record<string, unknown>) => {
                sentText = text;
                sentOptions = options;
            },
        } as unknown as BotContext;

        await startHandle(ctx);

        expect(sentText).toContain('Дмитрий');
        expect(sentText).toContain('token123');
        expect(sentOptions?.parse_mode).toBe('HTML');
        expect(sentOptions?.reply_markup).toBeDefined();
    });

    test('shows the short menu for an onboarded user', async () => {
        let sentText = '';
        let sentOptions: Record<string, unknown> | undefined;

        const ctx = {
            from: { first_name: 'Дмитрий' },
            message: { text: '/start' },
            session: { ...initialSessionData(), onboarded: true },
            reply: async (text: string, options?: Record<string, unknown>) => {
                sentText = text;
                sentOptions = options;
            },
        } as unknown as BotContext;

        await startHandle(ctx);

        expect(sentText).toContain('Снова привет');
        expect(sentText).not.toContain('Кто мы такие');
        expect(JSON.stringify(sentOptions?.reply_markup)).toContain(
            'menu:profile',
        );
    });
});
