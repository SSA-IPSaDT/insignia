import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import type { UserFromGetMe } from 'grammy/types';

import { logger } from '#utils/logger';

export const DEFAULT_BOT_INFO_CACHE_PATH = '.cache/telegram-bot-info.json';

export type TelegramEnvironment = 'test' | 'prod';

export interface CachedBotInfoEntry {
    tokenHash: string;
    environment: TelegramEnvironment;
    updatedAt: string;
    botInfo: UserFromGetMe;
}

export interface MultiEnvBotInfoCache {
    test?: CachedBotInfoEntry;
    prod?: CachedBotInfoEntry;
    [key: string]: CachedBotInfoEntry | undefined;
}

const readCacheFile = (filePath: string): MultiEnvBotInfoCache => {
    try {
        if (!existsSync(filePath)) {
            return {};
        }

        const raw = readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw) as Record<string, unknown>;

        // Обратная совместимость с однофайловым плоским форматом
        if (
            parsed &&
            typeof parsed === 'object' &&
            'tokenHash' in parsed &&
            'botInfo' in parsed
        ) {
            const legacy = parsed as {
                tokenHash: string;
                botInfo: UserFromGetMe;
            };
            return {
                prod: {
                    tokenHash: legacy.tokenHash,
                    environment: 'prod',
                    updatedAt: new Date().toISOString(),
                    botInfo: legacy.botInfo,
                },
            };
        }

        return parsed as MultiEnvBotInfoCache;
    } catch {
        return {};
    }
};

/**
 * Читает закешированный botInfo из локального файла по окружению ('test' | 'prod').
 * Проверяет соответствие хэша токена, чтобы инвалидировать кэш при смене токена.
 */
export const loadCachedBotInfoSync = (
    token: string,
    environmentOrPath: TelegramEnvironment | string = 'prod',
    filePath = DEFAULT_BOT_INFO_CACHE_PATH,
): UserFromGetMe | null => {
    let environment: TelegramEnvironment = 'prod';
    let path = filePath;

    if (environmentOrPath === 'test' || environmentOrPath === 'prod') {
        environment = environmentOrPath;
    } else if (typeof environmentOrPath === 'string') {
        path = environmentOrPath;
    }

    try {
        const cache = readCacheFile(path);
        const entry = cache[environment];

        if (!entry) {
            return null;
        }

        const currentHash = Bun.hash(token).toString();

        if (entry.tokenHash !== currentHash || !entry.botInfo?.id) {
            return null;
        }

        logger.debug(
            `Telegram botInfo for [${environment}] loaded from cache (@${entry.botInfo.username})`,
        );
        return entry.botInfo;
    } catch {
        return null;
    }
};

/**
 * Сохраняет результат bot.api.getMe() в локальный файл с разбивкой по окружению.
 */
export const saveCachedBotInfoSync = (
    token: string,
    botInfo: UserFromGetMe,
    environmentOrPath: TelegramEnvironment | string = 'prod',
    filePath = DEFAULT_BOT_INFO_CACHE_PATH,
): void => {
    let environment: TelegramEnvironment = 'prod';
    let path = filePath;

    if (environmentOrPath === 'test' || environmentOrPath === 'prod') {
        environment = environmentOrPath;
    } else if (typeof environmentOrPath === 'string') {
        path = environmentOrPath;
    }

    try {
        const cache = readCacheFile(path);

        cache[environment] = {
            tokenHash: Bun.hash(token).toString(),
            environment,
            updatedAt: new Date().toISOString(),
            botInfo,
        };

        const dir = dirname(path);
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }

        writeFileSync(path, JSON.stringify(cache, null, 2), 'utf-8');
        logger.debug(
            `Telegram botInfo for [${environment}] saved to cache (@${botInfo.username})`,
        );
    } catch (error) {
        logger.warn(
            `Failed to save Telegram botInfo cache for [${environment}]`,
            error,
        );
    }
};
