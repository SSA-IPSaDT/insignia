import {
    buildProfileFromDraft,
    PROFILE_CANCEL_CALLBACK,
    PROFILE_SKIP_CALLBACK,
    PROFILE_STEPS,
    type ProfileStep,
} from '#core';
import type { BotConversation, ConversationContext } from '#telegram/context';
import {
    renderProfileSkipKeyboard,
    renderProfileStepView,
    renderProfileView,
} from '#telegram/views/profile.view';
import type { ProfileDraft } from '#types/models';
import { logger } from '#utils/logger';

export const PROFILE_CONVERSATION_ID = 'profile-form';

type StepOutcome =
    { type: 'value'; value: string } | { type: 'skip' } | { type: 'cancel' };

const waitForStepOutcome = async (
    conversation: BotConversation,
    step: ProfileStep,
): Promise<StepOutcome> => {
    while (true) {
        const update = await conversation.waitFor([
            'message:text',
            'callback_query:data',
        ]);

        if (update.callbackQuery !== undefined) {
            await update.answerCallbackQuery();

            if (update.callbackQuery.data === PROFILE_SKIP_CALLBACK) {
                return { type: 'skip' };
            }

            if (update.callbackQuery.data === PROFILE_CANCEL_CALLBACK) {
                return { type: 'cancel' };
            }

            continue;
        }

        const text = update.message?.text?.trim() ?? '';

        if (text === '') {
            continue;
        }

        if (text === '/cancel') {
            return { type: 'cancel' };
        }

        const error = step.validate(text);

        if (error !== null) {
            await update.reply(`⚠️ ${error}`, {
                reply_markup: renderProfileSkipKeyboard(),
            });
            continue;
        }

        return { type: 'value', value: text };
    }
};

export const profileConversation = async (
    conversation: BotConversation,
    ctx: ConversationContext,
): Promise<void> => {
    await ctx.reply(
        [
            '📝 <b>Заполняем профиль</b>',
            '',
            'Пять коротких вопросов. Любой шаг можно пропустить кнопкой ниже, а весь диалог — командой /cancel.',
        ].join('\n'),
        {
            parse_mode: 'HTML',
            reply_markup: renderProfileSkipKeyboard(),
        },
    );

    const draft: ProfileDraft = {};

    for (const [index, step] of PROFILE_STEPS.entries()) {
        const stepView = renderProfileStepView({
            step,
            index: index + 1,
            total: PROFILE_STEPS.length,
        });

        await ctx.reply(stepView.text, {
            parse_mode: stepView.parseMode,
            reply_markup: renderProfileSkipKeyboard(),
        });

        const outcome = await waitForStepOutcome(conversation, step);

        if (outcome.type === 'cancel') {
            await ctx.reply(
                'Ок, остановились. Ответы не сохранены — вернуться можно командой /profile.',
            );
            return;
        }

        if (outcome.type === 'value') {
            draft[step.id] = outcome.value;
        }
    }

    const profile = buildProfileFromDraft(draft);

    await conversation.external((outside) => {
        outside.session.profile = profile;
        outside.session.onboarded = true;
    });

    const view = renderProfileView({
        profile,
        telegramUsername: ctx.from?.username,
        savedRecently: true,
    });

    await ctx.reply(view.text, {
        parse_mode: view.parseMode,
        reply_markup: view.keyboard,
    });

    logger.info(
        `Профиль студента сохранён (моковые данные), Telegram ID: ${ctx.from?.id ?? 'unknown'}`,
    );
};
