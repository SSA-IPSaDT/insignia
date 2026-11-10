import { createSubscriber } from 'svelte/reactivity';

import { detectPlatform, type DetectPlatformOptions } from './detector.js';
import type {
    PlatformAdapter,
    PlatformTheme,
    PlatformType,
    PlatformUser,
} from './types.d.ts';

export class PlatformManager {
    #adapter: PlatformAdapter | null = null;
    #isInitializing = false;
    #notify?: () => void;
    #subscribe = createSubscriber((update) => {
        this.#notify = update;
        return (): void => {
            this.#notify = undefined;
        };
    });

    get adapter(): PlatformAdapter | null {
        this.#subscribe();
        return this.#adapter;
    }

    get isReady(): boolean {
        this.#subscribe();
        return this.#adapter?.isReady ?? false;
    }

    get isInitializing(): boolean {
        this.#subscribe();
        return this.#isInitializing;
    }

    get type(): PlatformType {
        this.#subscribe();
        return this.#adapter?.type ?? 'standalone';
    }

    get user(): PlatformUser | undefined {
        this.#subscribe();
        return this.#adapter?.user;
    }

    get theme(): PlatformTheme {
        this.#subscribe();
        return this.#adapter?.theme ?? { isDark: false };
    }

    get isDark(): boolean {
        return this.theme.isDark;
    }

    get viewport() {
        this.#subscribe();
        return this.#adapter?.viewport;
    }

    get isFullscreen(): boolean {
        this.#subscribe();
        return this.#adapter?.viewport.isFullscreen ?? false;
    }

    get safeAreaInsets() {
        this.#subscribe();
        return (
            this.#adapter?.viewport.safeAreaInsets ?? {
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
            }
        );
    }

    get contentSafeAreaInsets() {
        this.#subscribe();
        return (
            this.#adapter?.viewport.contentSafeAreaInsets ?? {
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
            }
        );
    }

    init = async (
        options?: DetectPlatformOptions,
    ): Promise<PlatformAdapter> => {
        if (this.#adapter) {
            return this.#adapter;
        }

        this.#isInitializing = true;
        this.#notify?.();
        try {
            const platformType = detectPlatform(options);

            switch (platformType) {
                case 'telegram': {
                    if (
                        typeof window !== 'undefined' &&
                        (window.location.search.includes('mock=tg') ||
                            (!window.location.hash.includes('tgWebAppData=') &&
                                !window.location.search.includes(
                                    'tgWebAppData=',
                                )))
                    ) {
                        const { setupTelegramMock } = await import('./mock.js');
                        setupTelegramMock();
                    }
                    const { TelegramAdapter } =
                        await import('./adapter/telegram.svelte.js');
                    const adapter = new TelegramAdapter();
                    await adapter.init();
                    this.#adapter = adapter;
                    this.#notify?.();
                    return adapter;
                }
                case 'standalone':
                default: {
                    const { StandaloneAdapter } =
                        await import('./adapter/standalone.svelte.js');
                    const adapter = new StandaloneAdapter();
                    await adapter.init();
                    this.#adapter = adapter;
                    this.#notify?.();
                    return adapter;
                }
            }
        } finally {
            this.#isInitializing = false;
            this.#notify?.();
        }
    };

    setAdapterForTesting = (adapter: PlatformAdapter | null): void => {
        this.#adapter = adapter;
        this.#notify?.();
    };
}

export const platform = new PlatformManager();

export const getPlatformAdapter = async (
    options?: DetectPlatformOptions,
): Promise<PlatformAdapter> => {
    return platform.init(options);
};

export const initPlatform = getPlatformAdapter;

export const setPlatformAdapterForTesting = (
    adapter: PlatformAdapter | null,
): void => {
    platform.setAdapterForTesting(adapter);
};
