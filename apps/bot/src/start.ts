import type { CommandContext, Context, MiddlewareFn } from 'grammy';

import { buildStartMessage } from './messages.js';
import { getStartPayload } from './utils.js';

export const handleStart: MiddlewareFn<CommandContext<Context>> = async (
    ctx,
) => {
    const payload = getStartPayload(ctx.message?.text ?? '');
    const message = buildStartMessage(ctx.from?.first_name, payload);

    await ctx.reply(message);
};
