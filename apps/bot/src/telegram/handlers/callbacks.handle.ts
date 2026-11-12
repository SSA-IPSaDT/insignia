import type { Middleware } from 'grammy';

import { MOCK_FORMS } from '#core';
import type { BotContext } from '#telegram/context';
import { PROFILE_CONVERSATION_ID } from '#telegram/conversations';
import { renderFormsView } from '#telegram/views/forms.view';
import { renderOnboardingSlide } from '#telegram/views/onboarding.view';
import { renderProfileView } from '#telegram/views/profile.view';
import { renderStartView } from '#telegram/views/start.view';
import type { OnboardingSlide } from '#types/views';

const ONBOARDING_SLIDES: Record<string, OnboardingSlide> = {
    'onboarding:about': 'about',
    'onboarding:features': 'features',
    'onboarding:profile': 'profile',
};

const FILL_PROFILE_CALLBACKS = new Set([
    'onboarding:fill_profile',
    'start:chat_flow',
]);

const editToStartView = async (ctx: BotContext): Promise<void> => {
    const view = renderStartView({
        firstName: ctx.from?.first_name,
        isOnboarded: ctx.session.onboarded,
    });

    await ctx.editMessageText(view.text, {
        parse_mode: view.parseMode,
        reply_markup: view.keyboard,
    });
};

export const callbacksHandle = (async (ctx) => {
    const data = ctx.callbackQuery?.data;

    if (data === undefined) {
        return;
    }

    await ctx.answerCallbackQuery();

    if (FILL_PROFILE_CALLBACKS.has(data)) {
        if (ctx.conversation.active(PROFILE_CONVERSATION_ID) > 0) {
            await ctx.reply(
                'Диалог уже запущен — продолжим в сообщениях ниже. Чтобы прервать, отправь /cancel.',
            );
            return;
        }

        await ctx.conversation.enter(PROFILE_CONVERSATION_ID);
        return;
    }

    if (data === 'onboarding:start') {
        await editToStartView(ctx);
        return;
    }

    const slide = ONBOARDING_SLIDES[data];

    if (slide !== undefined) {
        const view = renderOnboardingSlide({ slide });

        await ctx.editMessageText(view.text, {
            parse_mode: view.parseMode,
            reply_markup: view.keyboard,
        });
        return;
    }

    if (data === 'menu:profile') {
        const view = renderProfileView({
            profile: ctx.session.profile,
            telegramUsername: ctx.from?.username,
        });

        await ctx.reply(view.text, {
            parse_mode: view.parseMode,
            reply_markup: view.keyboard,
        });
        return;
    }

    if (data === 'menu:forms') {
        const view = renderFormsView({ forms: MOCK_FORMS });

        await ctx.reply(view.text, {
            parse_mode: view.parseMode,
            reply_markup: view.keyboard,
        });
    }
}) satisfies Middleware<BotContext>;

export default callbacksHandle;
