import { describe, expect, mock, test } from 'bun:test';

import type { Context } from 'grammy';

import {
    autoChatAction,
    chatAction,
    createChatActionLoop,
} from '#telegram/plugins/auto-chat-action';

describe('createChatActionLoop', () => {
    test('triggers action immediately and stops on stop() call', async () => {
        let callCount = 0;
        const fakeAction = mock(async () => {
            callCount++;
        });

        const stop = createChatActionLoop(fakeAction, 50);
        expect(callCount).toBe(1);

        await new Promise((resolve) => setTimeout(resolve, 120));
        expect(callCount).toBeGreaterThanOrEqual(2);

        stop();
        const currentCount = callCount;
        await new Promise((resolve) => setTimeout(resolve, 80));
        expect(callCount).toBe(currentCount);
    });

    test('stops automatically if sendAction rejects', async () => {
        let callCount = 0;
        const failingAction = mock(async () => {
            callCount++;
            throw new Error('Telegram API error');
        });

        createChatActionLoop(failingAction, 50);
        expect(callCount).toBe(1);

        await new Promise((resolve) => setTimeout(resolve, 120));
        expect(callCount).toBe(1);
    });
});

describe('autoChatAction middleware', () => {
    test('attaches chatAction getter/setter and sends action on set', async () => {
        const sendChatActionMock = mock(async () => true);

        const fakeCtx = {
            chat: { id: 12345 },
            msg: { message_thread_id: 42 },
            api: {
                sendChatAction: sendChatActionMock,
            },
        } as unknown as Context;

        const middleware = autoChatAction();
        let wasActionActiveInsideNext = false;

        await middleware(fakeCtx as never, async () => {
            const contextWithAction = fakeCtx as unknown as {
                chatAction: string | null;
            };
            expect(contextWithAction.chatAction).toBeNull();

            contextWithAction.chatAction = 'typing';
            expect(contextWithAction.chatAction).toBe('typing');
            expect(sendChatActionMock).toHaveBeenCalledWith(12345, 'typing', {
                message_thread_id: 42,
            });

            wasActionActiveInsideNext = true;
            contextWithAction.chatAction = null;
            expect(contextWithAction.chatAction).toBeNull();
        });

        expect(wasActionActiveInsideNext).toBe(true);
    });

    test('cleans up active action in finally if error thrown in next()', async () => {
        const sendChatActionMock = mock(async () => true);

        const fakeCtx = {
            chat: { id: 12345 },
            api: {
                sendChatAction: sendChatActionMock,
            },
        } as unknown as Context;

        const middleware = autoChatAction();

        expect(async () => {
            await middleware(fakeCtx as never, async () => {
                const contextWithAction = fakeCtx as unknown as {
                    chatAction: string | null;
                };
                contextWithAction.chatAction = 'upload_document';
                throw new Error('Handler failure');
            });
        }).toThrow('Handler failure');
    });

    test('does not throw when ctx.chat is undefined', async () => {
        const fakeCtx = {
            api: {
                sendChatAction: mock(async () => true),
            },
        } as unknown as Context;

        const middleware = autoChatAction();

        await middleware(fakeCtx as never, async () => {
            const contextWithAction = fakeCtx as unknown as {
                chatAction: string | null;
            };
            contextWithAction.chatAction = 'typing';
            expect(contextWithAction.chatAction).toBe('typing');
        });
    });
});

describe('chatAction route middleware', () => {
    test('sends specified chat action and cleans up afterwards', async () => {
        const sendChatActionMock = mock(async () => true);

        const fakeCtx = {
            chat: { id: 98765 },
            api: {
                sendChatAction: sendChatActionMock,
            },
        } as unknown as Context;

        const middleware = chatAction('upload_photo');
        let executed = false;

        await middleware(fakeCtx, async () => {
            executed = true;
            expect(sendChatActionMock).toHaveBeenCalledWith(
                98765,
                'upload_photo',
                undefined,
            );
        });

        expect(executed).toBe(true);
    });

    test('gracefully proceeds when chat is absent', async () => {
        const fakeCtx = {
            api: {
                sendChatAction: mock(async () => true),
            },
        } as unknown as Context;

        const middleware = chatAction('record_video');
        let executed = false;

        await middleware(fakeCtx, async () => {
            executed = true;
        });

        expect(executed).toBe(true);
    });
});
