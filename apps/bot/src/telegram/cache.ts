import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import type { UserFromGetMe } from 'grammy/types';

import { logger } from '#utils/logger';

export const DEFAULT_BOT_INFO_CACHE_PATH = '.cache/telegram-bot-info.json';

interface CachedBotInfoPayload {
    tokenHash: string;
    botInfo: UserFromGetMe;
}

/**
 * Читает закешированный botInfo из локального файла.
 * Проверяет соответствие хэша токена, чтобы инвалидировать кэш при смене токена.
 */
export const loadCachedBotInfoSync = (
    token: string,
    filePath = DEFAULT_BOT_INFO_CACHE_PATH,
): UserFromGetMe | null => {
    try {
        if (!existsSync(filePath)) {
            return null;
        }

        const raw = readFileSync(filePath, 'utf-8');
        const data = JSON.parse(raw) as CachedBotInfoPayload;
        const currentHash = Bun.hash(token).toString();

        if (data.tokenHash !== currentHash || !data.botInfo?.id) {
            return null;
        }

        logger.debug('Telegram botInfo loaded from cache');
        return data.botInfo;
    } catch {
        return null;
    }
};

/**
 * Сохраняет результат bot.api.getMe() в локальный файл.
 */
export const saveCachedBotInfoSync = (
    token: string,
    botInfo: UserFromGetMe,
    filePath = DEFAULT_BOT_INFO_CACHE_PATH,
): void => {
    try {
        const payload: CachedBotInfoPayload = {
            tokenHash: Bun.hash(token).toString(),
            botInfo,
        };

        const dir = dirname(filePath);
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }

        writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
        logger.debug('Telegram botInfo saved to cache');
    } catch (error) {
        logger.warn('Failed to save Telegram botInfo cache', error);
    }
};
