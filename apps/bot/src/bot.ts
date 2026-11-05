import { Bot } from 'grammy';

import { botLogger } from './logger.js';
import { handleStart } from './start.js';

export const createBot = (token: string): Bot => {
    const bot = new Bot(token);

    bot.command('start', handleStart);

    bot.catch((error) => {
        botLogger.error('Ошибка при обработке обновления', error.error);
    });

    return bot;
};
