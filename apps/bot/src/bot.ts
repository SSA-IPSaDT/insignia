import { createLogger } from '@insignia/logger';
import { Bot } from 'grammy';

import { handleStart } from './start.js';

const logger = createLogger('bot');

export const createBot = (token: string): Bot => {
    const bot = new Bot(token);

    bot.command('start', async (ctx) => {
        await handleStart(
            (text) => ctx.reply(text),
            ctx.from?.first_name,
            ctx.message?.text,
        );
    });

    bot.catch((error) => {
        logger.error('Ошибка при обработке обновления', error.error);
    });

    return bot;
};
