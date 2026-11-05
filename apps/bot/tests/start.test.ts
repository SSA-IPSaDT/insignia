import { describe, expect, test } from 'bun:test';

import type { CommandContext, Context } from 'grammy';

import { handleStart } from '../src/start';

const createContext = (text: string, firstName?: string) => {
    const replies: string[] = [];

    const ctx = {
        from: firstName ? { first_name: firstName } : undefined,
        message: { text },
        reply: async (message: string) => {
            replies.push(message);
        },
    } as unknown as CommandContext<Context>;

    return { ctx, replies };
};

describe('handleStart', () => {
    test('replies with a greeting and payload', async () => {
        const { ctx, replies } = createContext('/start promo', 'Вадим');

        await handleStart(ctx, async () => {});

        expect(replies).toHaveLength(1);
        expect(replies[0]).toContain('Привет, Вадим!');
        expect(replies[0]).toContain('Код: promo');
    });

    test('replies without a payload block', async () => {
        const { ctx, replies } = createContext('/start', 'Вадим');

        await handleStart(ctx, async () => {});

        expect(replies[0]).not.toContain('Код:');
    });
});
