import { afterEach, describe, expect, test } from 'bun:test';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';

import type { UserFromGetMe } from 'grammy/types';

import { loadCachedBotInfoSync, saveCachedBotInfoSync } from '#telegram/cache';

const TEST_CACHE_PATH = '.cache/test-telegram-bot-info.json';
const TEST_TOKEN_PROD = '1234567890:AAFakeTestTokenForDevAndTestingOnly';
const TEST_TOKEN_TEST = '5002440130:AAHATaabt-qhNHmQk70MrmMBZ0dqqoP2yM4';

const mockProdBotInfo: UserFromGetMe = {
    id: 123456789,
    is_bot: true,
    first_name: 'Insignia Bot Prod',
    username: 'insignia_prod_bot',
    can_join_groups: true,
    can_read_all_group_messages: false,
    supports_inline_queries: false,
    can_connect_to_business: false,
    has_main_web_app: false,
    has_topics_enabled: false,
    allows_users_to_create_topics: false,
    can_manage_bots: false,
    supports_join_request_queries: false,
};

const mockTestBotInfo: UserFromGetMe = {
    id: 5002440130,
    is_bot: true,
    first_name: 'Insignia Bot Test',
    username: 'insignia_test_bot',
    can_join_groups: true,
    can_read_all_group_messages: false,
    supports_inline_queries: false,
    can_connect_to_business: false,
    has_main_web_app: false,
    has_topics_enabled: false,
    allows_users_to_create_topics: false,
    can_manage_bots: false,
    supports_join_request_queries: false,
};

describe('Telegram BotInfo Cache (Multi-Environment)', () => {
    afterEach(() => {
        if (existsSync(TEST_CACHE_PATH)) {
            unlinkSync(TEST_CACHE_PATH);
        }
    });

    test('returns null when cache file does not exist', () => {
        const loaded = loadCachedBotInfoSync(
            TEST_TOKEN_PROD,
            'prod',
            TEST_CACHE_PATH,
        );
        expect(loaded).toBeNull();
    });

    test('saves and loads botInfo for prod and test environments independently in one file', () => {
        // 1. Сохраняем prod
        saveCachedBotInfoSync(
            TEST_TOKEN_PROD,
            mockProdBotInfo,
            'prod',
            TEST_CACHE_PATH,
        );

        // 2. Сохраняем test
        saveCachedBotInfoSync(
            TEST_TOKEN_TEST,
            mockTestBotInfo,
            'test',
            TEST_CACHE_PATH,
        );

        // 3. Загружаем оба окружения
        const loadedProd = loadCachedBotInfoSync(
            TEST_TOKEN_PROD,
            'prod',
            TEST_CACHE_PATH,
        );
        const loadedTest = loadCachedBotInfoSync(
            TEST_TOKEN_TEST,
            'test',
            TEST_CACHE_PATH,
        );

        expect(loadedProd).not.toBeNull();
        expect(loadedProd?.id).toBe(123456789);
        expect(loadedProd?.username).toBe('insignia_prod_bot');

        expect(loadedTest).not.toBeNull();
        expect(loadedTest?.id).toBe(5002440130);
        expect(loadedTest?.username).toBe('insignia_test_bot');

        // 4. Проверяем структуру файла на диске: оба ключа присутствуют
        const fileContent = JSON.parse(
            readFileSync(TEST_CACHE_PATH, 'utf-8'),
        ) as Record<string, unknown>;
        expect(fileContent.prod).toBeDefined();
        expect(fileContent.test).toBeDefined();
    });

    test('invalidates cache if token changes for specific environment', () => {
        saveCachedBotInfoSync(
            TEST_TOKEN_TEST,
            mockTestBotInfo,
            'test',
            TEST_CACHE_PATH,
        );

        const loadedWithDifferentToken = loadCachedBotInfoSync(
            '9876543210:AABDifferentTokenForDevAndTesting0',
            'test',
            TEST_CACHE_PATH,
        );
        expect(loadedWithDifferentToken).toBeNull();
    });

    test('supports backwards compatibility with legacy flat format', () => {
        const legacyData = {
            tokenHash: Bun.hash(TEST_TOKEN_PROD).toString(),
            botInfo: mockProdBotInfo,
        };
        writeFileSync(
            TEST_CACHE_PATH,
            JSON.stringify(legacyData, null, 2),
            'utf-8',
        );

        const loaded = loadCachedBotInfoSync(
            TEST_TOKEN_PROD,
            'prod',
            TEST_CACHE_PATH,
        );
        expect(loaded).not.toBeNull();
        expect(loaded?.id).toBe(123456789);
    });
});
