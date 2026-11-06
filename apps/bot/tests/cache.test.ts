import { afterEach, describe, expect, test } from 'bun:test';
import { existsSync, unlinkSync } from 'node:fs';

import type { UserFromGetMe } from 'grammy/types';

import { loadCachedBotInfoSync, saveCachedBotInfoSync } from '#telegram/cache';

const TEST_CACHE_PATH = '.cache/test-telegram-bot-info.json';
const TEST_TOKEN = '1234567890:AAFakeTestTokenForDevAndTestingOnly';

const mockBotInfo: UserFromGetMe = {
    id: 123456789,
    is_bot: true,
    first_name: 'Insignia Bot',
    username: 'insignia_bot',
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

describe('Telegram BotInfo Cache', () => {
    afterEach(() => {
        if (existsSync(TEST_CACHE_PATH)) {
            unlinkSync(TEST_CACHE_PATH);
        }
    });

    test('returns null when cache file does not exist', () => {
        const loaded = loadCachedBotInfoSync(TEST_TOKEN, TEST_CACHE_PATH);
        expect(loaded).toBeNull();
    });

    test('saves and successfully loads botInfo from disk cache', () => {
        saveCachedBotInfoSync(TEST_TOKEN, mockBotInfo, TEST_CACHE_PATH);

        const loaded = loadCachedBotInfoSync(TEST_TOKEN, TEST_CACHE_PATH);
        expect(loaded).not.toBeNull();
        expect(loaded?.id).toBe(123456789);
        expect(loaded?.username).toBe('insignia_bot');
    });

    test('invalidates cache if token changes', () => {
        saveCachedBotInfoSync(TEST_TOKEN, mockBotInfo, TEST_CACHE_PATH);

        const loadedWithDifferentToken = loadCachedBotInfoSync(
            '9876543210:AABDifferentTokenForDevAndTesting0',
            TEST_CACHE_PATH,
        );
        expect(loadedWithDifferentToken).toBeNull();
    });
});
