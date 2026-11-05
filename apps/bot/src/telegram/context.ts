import type { Conversation, ConversationFlavor } from '@grammyjs/conversations';
import type { HydrateFlavor } from '@grammyjs/hydrate';
import type { Context, SessionFlavor } from 'grammy';

export interface SessionData {
    lastActionAt?: number;
    currentFormId?: string | null;
    authDraft?: {
        code?: string;
    } | null;
}

export const initialSessionData = (): SessionData => ({
    lastActionAt: undefined,
    currentFormId: null,
    authDraft: null,
});

export type BotContext = HydrateFlavor<Context> &
    SessionFlavor<SessionData> &
    ConversationFlavor<Context>;

export type BotConversation = Conversation<BotContext>;
