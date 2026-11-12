import { describe, expect, test } from 'bun:test';

import type { BotContext } from '#telegram/context';
import { initialSessionData } from '#telegram/context';
import { PROFILE_CONVERSATION_ID } from '#telegram/conversations';
import { callbacksHandle } from '#telegram/handlers/callbacks.handle';

interface Harness {
    ctx: BotContext;
    replies: string[];
    edits: string[];
    entered: string[];
}

const createHarness = (data: string, activeConversations = 0): Harness => {
    const replies: string[] = [];
    const edits: string[] = [];
    const entered: string[] = [];

    const ctx = {
        from: { id: 42, first_name: 'Иван', username: 'ivan' },
        session: initialSessionData(),
        callbackQuery: { data },
        answerCallbackQuery: async (): Promise<void> => undefined,
        reply: async (text: string): Promise<void> => {
            replies.push(text);
        },
        editMessageText: async (text: string): Promise<void> => {
            edits.push(text);
        },
        conversation: {
            active: (): number => activeConversations,
            enter: async (id: string): Promise<void> => {
                entered.push(id);
            },
        },
    };

    return {
        ctx: ctx as unknown as BotContext,
        replies,
        edits,
        entered,
    };
};

describe('callbacksHandle', () => {
    test('enters the profile dialog from "start:chat_flow"', async () => {
        const harness = createHarness('start:chat_flow');

        await callbacksHandle(harness.ctx);

        expect(harness.entered).toEqual([PROFILE_CONVERSATION_ID]);
    });

    test('enters the profile dialog from the onboarding button', async () => {
        const harness = createHarness('onboarding:fill_profile');

        await callbacksHandle(harness.ctx);

        expect(harness.entered).toEqual([PROFILE_CONVERSATION_ID]);
    });

    test('does not start a second dialog while one is active', async () => {
        const harness = createHarness('start:chat_flow', 1);

        await callbacksHandle(harness.ctx);

        expect(harness.entered).toEqual([]);
        expect(harness.replies[0]).toContain('Диалог уже запущен');
    });

    test('edits the same message when switching onboarding slides', async () => {
        const harness = createHarness('onboarding:about');

        await callbacksHandle(harness.ctx);

        expect(harness.edits[0]).toContain('Кто мы такие');
        expect(harness.replies).toEqual([]);
    });

    test('sends the profile card as a new message', async () => {
        const harness = createHarness('menu:profile');

        await callbacksHandle(harness.ctx);

        expect(harness.replies[0]).toContain('Мой профиль');
        expect(harness.edits).toEqual([]);
    });

    test('sends the forms list as a new message', async () => {
        const harness = createHarness('menu:forms');

        await callbacksHandle(harness.ctx);

        expect(harness.replies[0]).toContain('Мои формы');
    });

    test('ignores unknown callback data', async () => {
        const harness = createHarness('unknown:action');

        await callbacksHandle(harness.ctx);

        expect(harness.replies).toEqual([]);
        expect(harness.edits).toEqual([]);
        expect(harness.entered).toEqual([]);
    });
});
