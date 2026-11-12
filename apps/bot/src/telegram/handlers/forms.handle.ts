import type { Middleware } from 'grammy';

import { MOCK_FORMS } from '#core';
import type { BotContext } from '#telegram/context';
import { renderFormsView } from '#telegram/views/forms.view';

export const formsHandle = (async (ctx) => {
    const view = renderFormsView({ forms: MOCK_FORMS });

    await ctx.reply(view.text, {
        parse_mode: view.parseMode,
        reply_markup: view.keyboard,
    });
}) satisfies Middleware<BotContext>;

export default formsHandle;
