import { describe, expect, it } from 'bun:test';

import { StandaloneAdapter } from '../src/lib/platform/adapter/standalone.svelte.js';
import { detectPlatform } from '../src/lib/platform/detector.js';
import {
    getPlatformAdapter,
    platform,
    setPlatformAdapterForTesting,
    usePlatform,
} from '../src/lib/platform/index.js';

describe('Platform Detector', () => {
    it('detects standalone by default when no platform parameters are passed', () => {
        const detected = detectPlatform({
            location: { search: '', hash: '' },
        });
        expect(detected).toBe('standalone');
    });

    it('detects telegram when tgWebAppData is in query search', () => {
        const detected = detectPlatform({
            location: { search: '?tgWebAppData=user%3D123', hash: '' },
        });
        expect(detected).toBe('telegram');
    });

    it('detects telegram when tgWebAppData is in URL hash', () => {
        const detected = detectPlatform({
            location: { search: '', hash: '#tgWebAppData=query_id%3Dxyz' },
        });
        expect(detected).toBe('telegram');
    });

    it('detects telegram when tgWebAppPlatform is present', () => {
        const detected = detectPlatform({
            location: { search: '?tgWebAppPlatform=tdesktop', hash: '' },
        });
        expect(detected).toBe('telegram');
    });

    it('detects telegram when Telegram.WebApp global object exists with initData', () => {
        const detected = detectPlatform({
            location: { search: '', hash: '' },
            telegramGlobal: { initData: 'mock' },
        });
        expect(detected).toBe('telegram');
    });

    it('detects standalone when Telegram.WebApp global exists but has empty initData', () => {
        const detected = detectPlatform({
            location: { search: '', hash: '' },
            telegramGlobal: { initData: '' },
        });
        expect(detected).toBe('standalone');
    });

    it('detects telegram when mock=tg is in query search', () => {
        const detected = detectPlatform({
            location: { search: '?mock=tg', hash: '' },
        });
        expect(detected).toBe('telegram');
    });

    it('detects vk when vk_user_id is in query search', () => {
        const detected = detectPlatform({
            location: { search: '?vk_user_id=123456', hash: '' },
        });
        expect(detected).toBe('vk');
    });

    it('detects max when max_user_id is in query search', () => {
        const detected = detectPlatform({
            location: { search: '?max_user_id=789', hash: '' },
        });
        expect(detected).toBe('max');
    });
});

describe('Standalone Platform Adapter (Svelte 5 Reactivity)', () => {
    it('initializes with standalone properties and ready state', async () => {
        const adapter = new StandaloneAdapter();
        expect(adapter.type).toBe('standalone');
        expect(adapter.platformName).toBe('Browser / PWA');
        expect(adapter.isReady).toBe(false);

        await adapter.init();
        expect(adapter.isReady).toBe(true);
        expect(adapter.initDataRaw).toBeUndefined();
        expect(adapter.user).toBeUndefined();
    });

    it('manages back button state and event listeners', () => {
        const adapter = new StandaloneAdapter();
        expect(adapter.backButton.isVisible).toBe(false);

        adapter.backButton.show();
        expect(adapter.backButton.isVisible).toBe(true);

        adapter.backButton.hide();
        expect(adapter.backButton.isVisible).toBe(false);

        let clicked = false;
        const unsubscribe = adapter.backButton.onClick(() => {
            clicked = true;
        });

        unsubscribe();
        expect(clicked).toBe(false);
    });

    it('manages settings button state and event listeners', () => {
        const adapter = new StandaloneAdapter();
        expect(adapter.settingsButton.isVisible).toBe(false);

        adapter.settingsButton.show();
        expect(adapter.settingsButton.isVisible).toBe(true);

        adapter.settingsButton.hide();
        expect(adapter.settingsButton.isVisible).toBe(false);

        let clicked = false;
        const unsubscribe = adapter.settingsButton.onClick(() => {
            clicked = true;
        });

        unsubscribe();
        expect(clicked).toBe(false);
    });

    it('manages fullscreen viewport state and insets', async () => {
        const adapter = new StandaloneAdapter();
        expect(adapter.viewport.isFullscreen).toBe(false);
        expect(adapter.viewport.isExpanded).toBe(true);
        expect(adapter.viewport.safeAreaInsets).toEqual({
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
        });
        expect(adapter.viewport.contentSafeAreaInsets).toEqual({
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
        });

        await expect(
            adapter.viewport.requestFullscreen(),
        ).resolves.toBeUndefined();
        await expect(
            adapter.viewport.exitFullscreen(),
        ).resolves.toBeUndefined();
    });

    it('safely invokes haptics and lifecycle methods without crashing', () => {
        const adapter = new StandaloneAdapter();
        expect(() => adapter.haptics.impact('light')).not.toThrow();
        expect(() => adapter.haptics.notification('success')).not.toThrow();
        expect(() => adapter.haptics.selection()).not.toThrow();
        expect(() => adapter.ready()).not.toThrow();
        expect(() => adapter.viewport.expand()).not.toThrow();
    });
});

describe('Platform Manager (Svelte 5 Reactive Singleton)', () => {
    it('manages adapter lifecycle and updates reactive state and viewport', async () => {
        setPlatformAdapterForTesting(null);

        expect(platform.isReady).toBe(false);
        expect(platform.adapter).toBeNull();
        expect(platform.type).toBe('standalone');
        expect(platform.isFullscreen).toBe(false);
        expect(platform.safeAreaInsets).toEqual({
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
        });

        const adapter = await getPlatformAdapter({
            location: { search: '', hash: '' },
        });

        expect(adapter.type).toBe('standalone');
        expect(platform.isReady).toBe(true);
        expect(platform.adapter).toBe(adapter);
        expect(platform.type).toBe('standalone');
        expect(platform.viewport).toBe(adapter.viewport);

        setPlatformAdapterForTesting(null);
    });
});

describe('Svelte 5 Platform Integration', () => {
    it('usePlatform returns reactive platform manager', () => {
        expect(usePlatform()).toBe(platform);
    });
});
