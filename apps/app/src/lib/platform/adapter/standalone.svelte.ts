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

class StandaloneBackButton implements PlatformBackButton {
    #visible = false;
    #notify?: () => void;
    #subscribe = createSubscriber((update) => {
        this.#notify = update;
        return (): void => {
            this.#notify = undefined;
        };
    });
    #listeners = new Set<() => void>();

    get isVisible(): boolean {
        this.#subscribe();
        return this.#visible;
    }

    show = (): void => {
        this.#visible = true;
        this.#notify?.();
    };

    hide = (): void => {
        this.#visible = false;
        this.#notify?.();
    };

    onClick = (callback: () => void): (() => void) => {
        this.#listeners.add(callback);
        return (): void => {
            this.#listeners.delete(callback);
        };
    };

    triggerClick = (): void => {
        for (const listener of this.#listeners) {
            listener();
        }
    };
}

class StandaloneSettingsButton implements PlatformSettingsButton {
    #visible = false;
    #notify?: () => void;
    #subscribe = createSubscriber((update) => {
        this.#notify = update;
        return (): void => {
            this.#notify = undefined;
        };
    });
    #listeners = new Set<() => void>();

    get isVisible(): boolean {
        this.#subscribe();
        return this.#visible;
    }

    show = (): void => {
        this.#visible = true;
        this.#notify?.();
    };

    hide = (): void => {
        this.#visible = false;
        this.#notify?.();
    };

    onClick = (callback: () => void): (() => void) => {
        this.#listeners.add(callback);
        return (): void => {
            this.#listeners.delete(callback);
        };
    };

    triggerClick = (): void => {
        for (const listener of this.#listeners) {
            listener();
        }
    };
}

class StandaloneViewport implements PlatformViewport {
    #isExpanded = true;
    #notifyExpanded?: () => void;
    #subscribeExpanded = createSubscriber((update) => {
        this.#notifyExpanded = update;
        return (): void => {
            this.#notifyExpanded = undefined;
        };
    });

    #subscribeFullscreen = createSubscriber((update) => {
        if (typeof document === 'undefined') {
            return;
        }
        document.addEventListener('fullscreenchange', update);
        return (): void => {
            document.removeEventListener('fullscreenchange', update);
        };
    });

    #subscribeResize = createSubscriber((update) => {
        if (typeof window === 'undefined') {
            return;
        }
        window.addEventListener('resize', update);
        return (): void => {
            window.removeEventListener('resize', update);
        };
    });

    get isFullscreen(): boolean {
        this.#subscribeFullscreen();
        if (typeof document === 'undefined') {
            return false;
        }
        return document.fullscreenElement !== null;
    }

    get isExpanded(): boolean {
        this.#subscribeExpanded();
        return this.#isExpanded;
    }

    get height(): number {
        this.#subscribeResize();
        if (typeof window === 'undefined') {
            return 0;
        }
        return window.innerHeight;
    }

    get width(): number {
        this.#subscribeResize();
        if (typeof window === 'undefined') {
            return 0;
        }
        return window.innerWidth;
    }

    get safeAreaInsets(): PlatformSafeAreaInsets {
        return { top: 0, bottom: 0, left: 0, right: 0 };
    }

    get contentSafeAreaInsets(): PlatformSafeAreaInsets {
        return { top: 0, bottom: 0, left: 0, right: 0 };
    }

    requestFullscreen = async (): Promise<void> => {
        if (
            typeof document !== 'undefined' &&
            document.documentElement.requestFullscreen
        ) {
            await document.documentElement.requestFullscreen().catch(() => {});
        }
    };

    exitFullscreen = async (): Promise<void> => {
        if (typeof document !== 'undefined' && document.exitFullscreen) {
            await document.exitFullscreen().catch(() => {});
        }
    };

    expand = (): void => {
        this.#isExpanded = true;
        this.#notifyExpanded?.();
    };
}

class StandaloneThemeManager {
    #subscribe = createSubscriber((update) => {
        if (typeof window === 'undefined') {
            return;
        }
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        media.addEventListener('change', update);
        return (): void => {
            media.removeEventListener('change', update);
        };
    });

    get isDark(): boolean {
        this.#subscribe();
        if (typeof window === 'undefined') {
            return false;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
}

export class StandaloneAdapter implements PlatformAdapter {
    readonly type = 'standalone' as const;
    readonly platformName = 'Browser / PWA';

    #isReady = false;
    #notifyReady?: () => void;
    #subscribeReady = createSubscriber((update) => {
        this.#notifyReady = update;
        return (): void => {
            this.#notifyReady = undefined;
        };
    });

    #themeManager = new StandaloneThemeManager();

    readonly backButton: PlatformBackButton = new StandaloneBackButton();
    readonly settingsButton: PlatformSettingsButton =
        new StandaloneSettingsButton();
    readonly viewport: PlatformViewport = new StandaloneViewport();

    get isReady(): boolean {
        this.#subscribeReady();
        return this.#isReady;
    }

    get initDataRaw(): string | undefined {
        return undefined;
    }

    get user(): PlatformUser | undefined {
        return undefined;
    }

    get theme(): PlatformTheme {
        return {
            isDark: this.#themeManager.isDark,
        };
    }

    readonly haptics: PlatformHaptics = {
        impact: (_style: HapticImpactStyle): void => {
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                navigator.vibrate?.(15);
            }
        },
        notification: (_type: HapticNotificationType): void => {
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                navigator.vibrate?.([15, 30, 15]);
            }
        },
        selection: (): void => {
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                navigator.vibrate?.(10);
            }
        },
    };

    init = async (): Promise<void> => {
        this.#isReady = true;
        this.#notifyReady?.();
    };

    ready = (): void => {
        // No-op for standard browser
    };

    close = (): void => {
        if (typeof window !== 'undefined') {
            window.close();
        }
    };

    openLink = (url: string): void => {
        if (typeof window !== 'undefined') {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    syncTheme = (): void => {
        // No-op for standalone browser: mode-watcher manages the theme autonomously
    };
}
