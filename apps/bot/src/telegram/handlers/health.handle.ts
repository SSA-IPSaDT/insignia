import env from '@insignia/env';
import { createInsigniaClient } from '@insignia/sdk';
import type { Middleware } from 'grammy';

import type { BotContext } from '#telegram/context';

export const apiClient = createInsigniaClient({
    baseUrl: env.PUBLIC_API_URL,
});

export const healthHandle = (async (ctx) => {
    const result = await apiClient.health.check();
    const formattedJson = JSON.stringify(result, null, 2);

    await ctx.reply(
        `<b>Insignia API Health Status:</b>\n<pre><code class="language-json">${formattedJson}</code></pre>`,
        {
            parse_mode: 'HTML',
        },
    );
}) satisfies Middleware<BotContext>;

export default healthHandle;
