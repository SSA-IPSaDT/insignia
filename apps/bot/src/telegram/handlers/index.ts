import { CommandGroup } from '@grammyjs/commands';
import type { Bot } from 'grammy';

import type { BotContext } from '#telegram/context';
import { logger } from '#utils/logger';

import formsHandle from './forms.handle';
import healthHandle from './health.handle';
import profileHandle from './profile.handle';
import startHandle from './start.handle';

export const commands = new CommandGroup<BotContext>({
    ignoreCase: true,
});
commands.command('start', 'Начать работу / Перезапустить', startHandle);
commands.command('profile', 'Мой профиль', profileHandle);
commands.command('forms', 'Мои формы и мероприятия', formsHandle);
commands.command('health', 'Проверить состояние API сервисов', healthHandle);

export default commands;

export const setTelegramCommands = async (bot: Bot<BotContext>) => {
    try {
        await commands.setCommands(bot);
        logger.info('Telegram bot commands menu synchronized');
    } catch (error) {
        logger.warn('Failed to sync bot commands with Telegram API', error);
    }
};
