import type { Conversation, ConversationFlavor } from '@grammyjs/conversations';
import type { HydrateFlavor } from '@grammyjs/hydrate';
import type { Context, SessionFlavor } from 'grammy';

import type { AutoChatActionFlavor } from '#telegram/plugins';
import type { StudentProfile } from '#types/models';

export interface SessionData {
    lastActionAt?: number;
    currentFormId?: string | null;
    authDraft?: {
        code?: string;
    } | null;
    onboarded: boolean;
    profile: StudentProfile | null;
}

export const initialSessionData = (): SessionData => ({
    lastActionAt: undefined,
    currentFormId: null,
    authDraft: null,
    onboarded: false,
    profile: null,
});

export type BotContext = HydrateFlavor<Context> &
    SessionFlavor<SessionData> &
    ConversationFlavor<Context> &
    AutoChatActionFlavor;

/**
 * Контекст внутри conversation: те же плагины, но без `conversation`-флейвора —
 * плагин conversations запрещает вложенные диалоги.
 */
export type ConversationContext = HydrateFlavor<Context> &
    SessionFlavor<SessionData> &
    AutoChatActionFlavor;

export type BotConversation = Conversation<BotContext, ConversationContext>;
