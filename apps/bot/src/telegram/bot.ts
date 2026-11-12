import { conversations, createConversation } from '@grammyjs/conversations';
import { hydrate } from '@grammyjs/hydrate';
import { limit } from '@grammyjs/ratelimiter';
import { apiThrottler } from '@grammyjs/transformer-throttler';
import env from '@insignia/env';
import { type AnyElysia, Elysia } from 'elysia';
import { Bot, session, webhookCallback } from 'grammy';

import { loadCachedBotInfoSync, saveCachedBotInfoSync } from '#telegram/cache';
import type {
    BotContext,
    ConversationContext,
    SessionData,
} from '#telegram/context';
import { initialSessionData } from '#telegram/context';
import {
    PROFILE_CONVERSATION_ID,
    profileConversation,
} from '#telegram/conversations';
import commands, { setTelegramCommands } from '#telegram/handlers';
import callbacksHandle from '#telegram/handlers/callbacks.handle';
import { autoChatAction } from '#telegram/plugins';
import { isWebAppUrl, resolveAppUrl } from '#utils/app-url';
import { logger } from '#utils/logger';

export const createTelegramBot = (): Bot<BotContext> => {
    const token = env.TELEGRAM_BOT_TOKEN;
    const isTestEnv = env.TELEGRAM_TEST_ENVIRONMENT;
    const dcTag = isTestEnv ? 'Test DC' : 'Production DC';
    const envKey = isTestEnv ? 'test' : 'prod';
    const botInfo = loadCachedBotInfoSync(token, envKey) ?? undefined;

    if (botInfo) {
        logger.info(
            `Loaded cached Telegram bot info for @${botInfo.username} (ID: ${botInfo.id}) [${dcTag}]`,
        );
    }

    const bot = new Bot<BotContext>(token, {
        ...(botInfo ? { botInfo } : {}),
        client: {
            environment: isTestEnv ? 'test' : 'prod',
            fetch: Bun.fetch,
        },
    });

    bot.api.config.use(apiThrottler());

    bot.use(hydrate());
    bot.use(autoChatAction());

    bot.use(
        session<SessionData, BotContext>({
            initial: initialSessionData,
        }),
    );

    bot.use(conversations());

    bot.use(
        limit({
            timeFrame: 2000,
            limit: 3,
            onLimitExceeded: async (ctx) => {
                await ctx.reply(
                    'Слишком много запросов. Пожалуйста, подождите пару секунд.',
                );
            },
            keyGenerator: (ctx) => ctx.from?.id.toString(),
        }),
    );

    // Debug-трейс входящих апдейтов: без него живой прогон в Telegram
    // невозможно сопоставить с логами сервиса.
    bot.use(async (ctx, next) => {
        if (ctx.callbackQuery?.data !== undefined) {
            logger.debug(`callback: ${ctx.callbackQuery.data}`);
        } else if (ctx.message?.text !== undefined) {
            logger.debug(
                `message: ${ctx.message.text.slice(0, 80)}${ctx.message.text.length > 80 ? '…' : ''}`,
            );
        }

        await next();
    });

    bot.use(
        createConversation<BotContext, ConversationContext>(
            profileConversation,
            { id: PROFILE_CONVERSATION_ID },
        ),
    );

    bot.use(commands);
    bot.on('callback_query:data', callbacksHandle);

    bot.catch((err) => {
        logger.error('Ошибка в обработке обновления Telegram:', err.error);
    });

    return bot;
};

export const createTelegramWebhookHandler = (
    bot: Bot<BotContext>,
): AnyElysia => {
    const handleUpdate = webhookCallback(bot, 'bun', {
        secretToken: env.TELEGRAM_WEBHOOK_SECRET,
    });

    return new Elysia({ prefix: '/webhooks' }).post(
        '/telegram',
        ({ request }) => handleUpdate(request),
    );
};

export const startTelegramBot = async (bot: Bot<BotContext>): Promise<void> => {
    const token = bot.token;
    const isTestEnv = env.TELEGRAM_TEST_ENVIRONMENT;
    const dcLabel = isTestEnv
        ? 'Telegram Test Environment (Test DC)'
        : 'Telegram Production (Production DC)';

    logger.info(`Starting Telegram bot in ${dcLabel}...`);

    if (!bot.isInited()) {
        try {
            await bot.init();
            const envKey = isTestEnv ? 'test' : 'prod';
            saveCachedBotInfoSync(token, bot.botInfo, envKey);
            logger.info(
                `Telegram bot @${bot.botInfo.username} (ID: ${bot.botInfo.id}) initialized successfully [${dcLabel}]`,
            );
        } catch (error) {
            logger.error(
                `Failed to initialize Telegram bot (${dcLabel}). Please check TELEGRAM_BOT_TOKEN and verify it matches the environment.`,
                error,
            );
            throw error;
        }
    }

    await setTelegramCommands(bot);

    const appUrl = resolveAppUrl();

    // Telegram принимает Web App-кнопку только по HTTPS. Локальный HTTP-адрес
    // заведомо отклонится, поэтому не шумим в логах.
    if (!isWebAppUrl(appUrl)) {
        logger.info(
            `Skipping Telegram chat menu button: ${appUrl} is not HTTPS (локальный режим) [${dcLabel}]`,
        );
    } else {
        try {
            await bot.api.setChatMenuButton({
                menu_button: {
                    type: 'web_app',
                    text: 'Открыть App',
                    web_app: {
                        url: appUrl,
                    },
                },
            });
            logger.info(
                `Telegram chat menu button synchronized with URL: ${appUrl} [${dcLabel}]`,
            );
        } catch (error) {
            logger.warn('Failed to sync Telegram chat menu button', error);
        }
    }

    if (env.BOT_WEBHOOK_ENABLED) {
        const webhookUrl = `${env.PUBLIC_BOT_URL}/webhooks/telegram`;
        await bot.api.setWebhook(webhookUrl, {
            secret_token: env.TELEGRAM_WEBHOOK_SECRET,
        });
        logger.info(`Telegram webhook set to: ${webhookUrl} [${dcLabel}]`);
    } else {
        await bot.api.deleteWebhook();
        logger.info(
            `Starting Telegram bot in Long Polling mode [${dcLabel}]...`,
        );
        void bot.start({
            onStart: (info) =>
                logger.info(
                    `Bot @${info.username} (ID: ${info.id}) started successfully in ${dcLabel} mode (Long Polling)`,
                ),
        });
    }
};

export const stopTelegramBot = async (bot: Bot<BotContext>): Promise<void> => {
    const isTestEnv = env.TELEGRAM_TEST_ENVIRONMENT;
    const dcLabel = isTestEnv ? 'Test DC' : 'Production DC';
    logger.info(`Stopping Telegram bot [${dcLabel}]...`);
    if (!env.BOT_WEBHOOK_ENABLED) {
        await bot.stop();
    }
};
