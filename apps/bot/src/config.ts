import env, { type Env } from '@insignia/env';

export type BotEnv = Pick<
    Env,
    | 'TELEGRAM_BOT_TOKEN'
    | 'TELEGRAM_BOT_USERNAME'
    | 'BOT_WEBHOOK_ENABLED'
    | 'BOT_WEBHOOK_HOST'
    | 'BOT_WEBHOOK_PORT'
    | 'TELEGRAM_WEBHOOK_SECRET'
    | 'TELEGRAM_WEBHOOK_URL'
>;

export type BotConfig = {
    token: string;
    username: string;
    webhookEnabled: boolean;
    webhookHost: string;
    webhookPort: number;
    webhookSecret: string;
    webhookUrl: string;
};

export const readBotConfig = (source: BotEnv = env): BotConfig => {
    const token = source.TELEGRAM_BOT_TOKEN.trim();

    if (token === '') {
        throw new Error('TELEGRAM_BOT_TOKEN не задан');
    }

    const webhookSecret = source.TELEGRAM_WEBHOOK_SECRET.trim();

    if (source.BOT_WEBHOOK_ENABLED && webhookSecret === '') {
        throw new Error(
            'TELEGRAM_WEBHOOK_SECRET не задан при включённом вебхуке',
        );
    }

    return {
        token,
        username: source.TELEGRAM_BOT_USERNAME.trim(),
        webhookEnabled: source.BOT_WEBHOOK_ENABLED,
        webhookHost: source.BOT_WEBHOOK_HOST,
        webhookPort: source.BOT_WEBHOOK_PORT,
        webhookSecret,
        webhookUrl: source.TELEGRAM_WEBHOOK_URL,
    };
};
