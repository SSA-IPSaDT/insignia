import { describe, expect, test } from 'bun:test';

import type { BotContext } from '#telegram/context';
import formsHandle from '#telegram/handlers/forms.handle';

describe('formsHandle', () => {
    test('replies with the mock forms list', async () => {
        const sent: string[] = [];
        const ctx = {
            reply: async (text: string): Promise<void> => {
                sent.push(text);
            },
        } as unknown as BotContext;

        await formsHandle(ctx);

        expect(sent[0]).toContain('Мои формы');
        expect(sent[0]).toContain('Заявка в волонтёрский корпус');
        expect(sent[0]).toContain('демонстрационные');
    });
});
