import type { Middleware } from 'grammy';

import type { BotContext } from '#telegram/context';
import { renderStartView } from '#telegram/views/start.view';
import { takePayload } from '#utils/take-payload';

export default (async (ctx) => {
    const payload = takePayload(ctx.message?.text ?? '');
    const view = renderStartView({
        firstName: ctx.from?.first_name,
        payload,
    });

    await ctx.reply(view.text, {
        parse_mode: view.parseMode,
        reply_markup: view.keyboard,
    });
}) satisfies Middleware<BotContext>;
