import { describe, expect, test } from 'bun:test';

import type { BotContext } from '#telegram/context';
import { initialSessionData } from '#telegram/context';
import profileHandle from '#telegram/handlers/profile.handle';

const createContext = (): { ctx: BotContext; sent: string[] } => {
    const sent: string[] = [];
    const session = initialSessionData();

    const ctx = {
        from: { id: 42, username: 'ivan' },
        session,
        reply: async (text: string): Promise<void> => {
            sent.push(text);
        },
    };

    return { ctx: ctx as unknown as BotContext, sent };
};

describe('profileHandle', () => {
    test('shows the empty state for a new user', async () => {
        const { ctx, sent } = createContext();

        await profileHandle(ctx);

        expect(sent[0]).toContain('Профиль пока пуст');
    });

    test('shows the collected profile from the session', async () => {
        const { ctx, sent } = createContext();
        ctx.session.profile = {
            lastName: 'Иванов',
            firstName: 'Иван',
            patronymic: 'Иванович',
            age: 19,
            contacts: '@ivanov',
        };
        ctx.session.onboarded = true;

        await profileHandle(ctx);

        expect(sent[0]).toContain('Иванов');
        expect(sent[0]).toContain('19');
        expect(sent[0]).toContain('@ivan');
    });
});
