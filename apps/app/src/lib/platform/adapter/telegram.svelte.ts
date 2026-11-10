import {
    backButton,
    hapticFeedback,
    init,
    initData,
    miniApp,
    openLink,
    postEvent,
    settingsButton,
    themeParams,
    viewport,
} from '@tma.js/sdk-svelte';
import { createSubscriber } from 'svelte/reactivity';

import type {
    HapticImpactStyle,
    HapticNotificationType,
    PlatformAdapter,
    PlatformBackButton,
    PlatformHaptics,
    PlatformSafeAreaInsets,
    PlatformSettingsButton,
    PlatformTheme,
    PlatformUser,
    PlatformViewport,
} from '../types.d.ts';

class TelegramBackButton implements PlatformBackButton {
    #subscribe = createSubscriber((update) => {
        if (!backButton.isMounted()) {
            return;
        }
        return backButton.isVisible.sub(update);
    });

    get isVisible(): boolean {
        this.#subscribe();
        return backButton.isMounted() ? backButton.isVisible() : false;
    }

    show = (): void => {
        if (backButton.isMounted()) {
            backButton.show();
        }
    };

    hide = (): void => {
        if (backButton.isMounted()) {
            backButton.hide();
        }
    };

    onClick = (callback: () => void): (() => void) => {
        if (!backButton.isMounted()) {
            return (): void => {};
        }
        backButton.onClick(callback);
        return (): void => {
            backButton.offClick(callback);
        };
    };
}

class TelegramSettingsButton implements PlatformSettingsButton {
    #subscribe = createSubscriber((update) => {
        if (!settingsButton.isMounted()) {
            return;
        }
        return settingsButton.isVisible.sub(update);
    });

    get isVisible(): boolean {
        this.#subscribe();
        return settingsButton.isMounted() ? settingsButton.isVisible() : false;
    }

    show = (): void => {
        if (settingsButton.isMounted()) {
            settingsButton.show();
        }
    };

    hide = (): void => {
        if (settingsButton.isMounted()) {
            settingsButton.hide();
        }
    };

    onClick = (callback: () => void): (() => void) => {
        if (!settingsButton.isMounted()) {
            return (): void => {};
        }
        settingsButton.onClick(callback);
        return (): void => {
            settingsButton.offClick(callback);
        };
    };
}

class TelegramViewport implements PlatformViewport {
    #subscribe = createSubscriber((update) => {
        if (!viewport.isMounted()) {
            return;
        }
        const u1 = viewport.isFullscreen.sub(update);
        const u2 = viewport.isExpanded.sub(update);
        const u3 = viewport.height.sub(update);
        const u4 = viewport.width.sub(update);
        const u5 = viewport.safeAreaInsets.sub(update);
        const u6 = viewport.contentSafeAreaInsets.sub(update);

        return (): void => {
            u1();
            u2();
            u3();
            u4();
            u5();
            u6();
        };
    });

    get isFullscreen(): boolean {
        this.#subscribe();
        return viewport.isMounted() ? viewport.isFullscreen() : false;
    }

    get isExpanded(): boolean {
        this.#subscribe();
        return viewport.isMounted() ? viewport.isExpanded() : true;
    }

    get height(): number {
        this.#subscribe();
        return viewport.isMounted() ? viewport.height() : 0;
    }

    get width(): number {
        this.#subscribe();
        return viewport.isMounted() ? viewport.width() : 0;
    }

    get safeAreaInsets(): PlatformSafeAreaInsets {
        this.#subscribe();
        if (!viewport.isMounted()) {
            return { top: 0, bottom: 0, left: 0, right: 0 };
        }
        const insets = viewport.safeAreaInsets();
        return {
            top: insets.top,
            bottom: insets.bottom,
            left: insets.left,
            right: insets.right,
        };
    }

    get contentSafeAreaInsets(): PlatformSafeAreaInsets {
        this.#subscribe();
        if (!viewport.isMounted()) {
            return { top: 0, bottom: 0, left: 0, right: 0 };
        }
        const insets = viewport.contentSafeAreaInsets();
        return {
            top: insets.top,
            bottom: insets.bottom,
            left: insets.left,
            right: insets.right,
        };
    }

    requestFullscreen = async (): Promise<void> => {
        if (viewport.isMounted() && viewport.requestFullscreen.isAvailable()) {
            await viewport.requestFullscreen().catch(() => {});
        }
    };

    exitFullscreen = async (): Promise<void> => {
        if (viewport.isMounted() && viewport.exitFullscreen.isAvailable()) {
            await viewport.exitFullscreen().catch(() => {});
        }
    };

    expand = (): void => {
        if (viewport.isMounted()) {
            viewport.expand();
        }
    };
}

class TelegramThemeManager {
    #subscribe = createSubscriber((update) => {
        const unsubs: Array<() => void> = [];
        if (miniApp.isMounted()) {
            unsubs.push(miniApp.isDark.sub(update));
        }
        if (themeParams.isMounted()) {
            unsubs.push(themeParams.state.sub(update));
        }
        return (): void => {
            for (const unsub of unsubs) {
                unsub();
            }
        };
    });

    get theme(): PlatformTheme {
        this.#subscribe();

        const isDark = miniApp.isMounted()
            ? miniApp.isDark()
            : themeParams.isMounted()
              ? themeParams.isDark()
              : false;

        return {
            isDark,
            backgroundColor: miniApp.isMounted()
                ? miniApp.bgColor()
                : themeParams.isMounted()
                  ? themeParams.bgColor()
                  : undefined,
            textColor: themeParams.isMounted()
                ? themeParams.textColor()
                : undefined,
            accentColor: themeParams.isMounted()
                ? themeParams.buttonColor()
                : undefined,
            secondaryBackgroundColor: themeParams.isMounted()
                ? themeParams.secondaryBgColor()
                : undefined,
        };
    }
}

export class TelegramAdapter implements PlatformAdapter {
    readonly type = 'telegram' as const;
    readonly platformName = 'Telegram Mini Apps';

    #isReady = false;
    #notifyReady?: () => void;
    #subscribeReady = createSubscriber((update) => {
        this.#notifyReady = update;
        return (): void => {
            this.#notifyReady = undefined;
        };
    });

    #cleanup?: () => void;
    #themeManager = new TelegramThemeManager();

    readonly backButton: PlatformBackButton = new TelegramBackButton();
    readonly settingsButton: PlatformSettingsButton =
        new TelegramSettingsButton();
    readonly viewport: PlatformViewport = new TelegramViewport();

    get isReady(): boolean {
        this.#subscribeReady();
        return this.#isReady;
    }

    get initDataRaw(): string | undefined {
        return initData.raw();
    }

    get user(): PlatformUser | undefined {
        const u = initData.user();
        if (!u) {
            return undefined;
        }
        return {
            id: u.id,
            firstName: u.first_name,
            lastName: u.last_name,
            username: u.username,
            languageCode: u.language_code,
            isPremium: u.is_premium,
        };
    }

    get theme(): PlatformTheme {
        return this.#themeManager.theme;
    }

    readonly haptics: PlatformHaptics = {
        impact: (style: HapticImpactStyle): void => {
            if (hapticFeedback.isSupported()) {
                hapticFeedback.impactOccurred(style);
            }
        },
        notification: (type: HapticNotificationType): void => {
            if (hapticFeedback.isSupported()) {
                hapticFeedback.notificationOccurred(type);
            }
        },
        selection: (): void => {
            if (hapticFeedback.isSupported()) {
                hapticFeedback.selectionChanged();
            }
        },
    };

    init = async (): Promise<void> => {
        if (this.#isReady) {
            return;
        }

        try {
            this.#cleanup = init();
        } catch {
            // Silently ignore if not in native Telegram WebApp environment
        }

        if (miniApp.mount.isAvailable() && !miniApp.isMounted()) {
            try {
                miniApp.mount();
            } catch {}
        }
        if (themeParams.mount.isAvailable() && !themeParams.isMounted()) {
            try {
                themeParams.mount();
            } catch {}
        }
        if (viewport.mount.isAvailable() && !viewport.isMounted()) {
            try {
                await viewport.mount();
            } catch {}
        }
        if (viewport.bindCssVars.isAvailable()) {
            try {
                viewport.bindCssVars();
            } catch {}
        }
        if (backButton.mount.isAvailable() && !backButton.isMounted()) {
            try {
                backButton.mount();
            } catch {}
        }
        if (settingsButton.mount.isAvailable() && !settingsButton.isMounted()) {
            try {
                settingsButton.mount();
            } catch {}
        }

        // Fullscreen by default for Insignia client Mini App
        if (viewport.requestFullscreen.isAvailable()) {
            try {
                await viewport.requestFullscreen();
            } catch {}
        } else if (viewport.expand.isAvailable()) {
            try {
                viewport.expand();
            } catch {}
        }

        await this.syncTheme().catch(() => {});

        this.ready();

        this.#isReady = true;
        this.#notifyReady?.();
    };

    syncTheme = async (): Promise<void> => {
        if (typeof window === 'undefined') {
            return;
        }

        const isDark = this.theme.isDark;

        try {
            const { setMode } = await import('mode-watcher');
            setMode(isDark ? 'dark' : 'light');
        } catch {
            const root = document.documentElement;
            if (isDark) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        }
    };

    ready = (): void => {
        try {
            postEvent('web_app_ready');
        } catch {}

        if (miniApp.isMounted()) {
            try {
                miniApp.ready();
            } catch {}
        }

        if (typeof window !== 'undefined') {
            try {
                (
                    window as unknown as {
                        Telegram?: { WebApp?: { ready: () => void } };
                    }
                ).Telegram?.WebApp?.ready?.();
            } catch {}
        }
    };

    close = (): void => {
        if (miniApp.isMounted()) {
            miniApp.close();
        }
    };

    openLink = (url: string, options?: { tryInstantView?: boolean }): void => {
        openLink(url, options);
    };

    destroy = (): void => {
        if (backButton.isMounted()) {
            backButton.unmount();
        }
        if (settingsButton.isMounted()) {
            settingsButton.unmount();
        }
        if (miniApp.isMounted()) {
            miniApp.unmount();
        }
        if (themeParams.isMounted()) {
            themeParams.unmount();
        }
        this.#cleanup?.();
        this.#isReady = false;
        this.#notifyReady?.();
    };
}
