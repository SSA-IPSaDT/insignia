import { describe, expect, test } from 'bun:test';

import { type BotEnv, readBotConfig } from '../src/config';

const baseEnv: BotEnv = {
    TELEGRAM_BOT_TOKEN: '123456:ABC-DEF_ghi',
    TELEGRAM_BOT_USERNAME: 'insignia_dev_bot',
    BOT_WEBHOOK_ENABLED: false,
    BOT_WEBHOOK_HOST: 'localhost',
    BOT_WEBHOOK_PORT: 51004,
    TELEGRAM_WEBHOOK_SECRET: '',
    TELEGRAM_WEBHOOK_URL: 'http://localhost:51004/webhooks/telegram',
};

describe('readBotConfig', () => {
    test('reads polling configuration', () => {
        const config = readBotConfig(baseEnv);

        expect(config.token).toBe('123456:ABC-DEF_ghi');
        expect(config.username).toBe('insignia_dev_bot');
        expect(config.webhookEnabled).toBe(false);
    });

    test('throws when webhook is enabled without a secret', () => {
        expect(() =>
            readBotConfig({
                ...baseEnv,
                BOT_WEBHOOK_ENABLED: true,
            }),
        ).toThrow('TELEGRAM_WEBHOOK_SECRET');
    });

    test('reads webhook configuration', () => {
        const config = readBotConfig({
            ...baseEnv,
            BOT_WEBHOOK_ENABLED: true,
            TELEGRAM_WEBHOOK_SECRET: 'secret',
        });

        expect(config.webhookEnabled).toBe(true);
        expect(config.webhookSecret).toBe('secret');
        expect(config.webhookUrl).toBe(
            'http://localhost:51004/webhooks/telegram',
        );
    });
});
