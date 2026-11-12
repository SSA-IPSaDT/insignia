import type { Middleware } from 'grammy';

import type { BotContext } from '#telegram/context';
import { renderProfileView } from '#telegram/views/profile.view';

export const profileHandle = (async (ctx) => {
    const view = renderProfileView({
        profile: ctx.session.profile,
        telegramUsername: ctx.from?.username,
    });

    await ctx.reply(view.text, {
        parse_mode: view.parseMode,
        reply_markup: view.keyboard,
    });
}) satisfies Middleware<BotContext>;

export default profileHandle;
