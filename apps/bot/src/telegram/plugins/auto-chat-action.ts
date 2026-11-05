import type { Context, MiddlewareFn } from 'grammy';

export type ChatAction =
    | 'typing'
    | 'upload_photo'
    | 'record_video'
    | 'upload_video'
    | 'record_voice'
    | 'upload_voice'
    | 'upload_document'
    | 'choose_sticker'
    | 'find_location'
    | 'record_video_note'
    | 'upload_video_note';

export interface AutoChatActionFlavor {
    chatAction: ChatAction | null;
}

const DEFAULT_ACTION_INTERVAL_MS = 4500;

export const createChatActionLoop = (
    sendAction: () => Promise<unknown>,
    intervalMs = DEFAULT_ACTION_INTERVAL_MS,
): (() => void) => {
    let isActive = true;
    let timer: ReturnType<typeof setInterval> | null = null;

    const execute = async (): Promise<void> => {
        if (!isActive) {
            return;
        }

        try {
            await sendAction();
        } catch {
            stop();
        }
    };

    const stop = (): void => {
        isActive = false;
        if (timer !== null) {
            clearInterval(timer);
            timer = null;
        }
    };

    void execute();
    timer = setInterval(() => {
        void execute();
    }, intervalMs);

    return stop;
};

/**
 * Глобальный middleware плагина autoChatAction.
 * Внедряет в контекст свойство ctx.chatAction (getter/setter).
 * При присваивании экшена (например, ctx.chatAction = 'typing')
 * бот начинает отправлять статус в чат с интервалом раз в 4.5 секунды,
 * а по завершении обработки хэндлера (в finally) автоматически завершает отправку.
 */
export const autoChatAction = <C extends Context>(): MiddlewareFn<
    C & AutoChatActionFlavor
> => {
    return async (ctx, next): Promise<void> => {
        let currentAction: ChatAction | null = null;
        let stopCurrentLoop: (() => void) | null = null;

        const stopCurrent = (): void => {
            if (stopCurrentLoop !== null) {
                stopCurrentLoop();
                stopCurrentLoop = null;
            }
        };

        const startAction = (action: ChatAction): void => {
            stopCurrent();

            const chatId = ctx.chat?.id;
            if (!chatId) {
                return;
            }

            const threadId = ctx.msg?.message_thread_id;
            stopCurrentLoop = createChatActionLoop(() =>
                ctx.api.sendChatAction(
                    chatId,
                    action,
                    threadId !== undefined
                        ? { message_thread_id: threadId }
                        : undefined,
                ),
            );
        };

        Object.defineProperty(ctx, 'chatAction', {
            get: (): ChatAction | null => currentAction,
            set: (newAction: ChatAction | null): void => {
                currentAction = newAction;
                if (newAction) {
                    startAction(newAction);
                } else {
                    stopCurrent();
                }
            },
            configurable: true,
            enumerable: true,
        });

        try {
            await next();
        } finally {
            stopCurrent();
            currentAction = null;
        }
    };
};

/**
 * Локальный middleware для конкретных маршрутов или команд.
 * Автоматически держит экшен активным на протяжении выполнения следующего middleware.
 *
 * Пример использования:
 * ```ts
 * bot.command('generate', chatAction('typing'), async (ctx) => {
 *     const data = await heavyTask();
 *     await ctx.reply(data);
 * });
 * ```
 */
export const chatAction = <C extends Context>(
    action: ChatAction,
): MiddlewareFn<C> => {
    return async (ctx, next): Promise<void> => {
        const chatId = ctx.chat?.id;
        if (!chatId) {
            await next();
            return;
        }

        const threadId = ctx.msg?.message_thread_id;
        const stop = createChatActionLoop(() =>
            ctx.api.sendChatAction(
                chatId,
                action,
                threadId !== undefined
                    ? { message_thread_id: threadId }
                    : undefined,
            ),
        );

        try {
            await next();
        } finally {
            stop();
        }
    };
};
