import { platform } from './state.svelte.js';

/**
 * Svelte 5 rune-based hook for the platform BackButton.
 * Automatically shows the back button, registers the click listener,
 * and cleans up / hides the button when the component unmounts.
 */
export const useBackButton = (
    onClick: () => void,
    isVisible: boolean = true,
): void => {
    $effect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const adapter = platform.adapter;
        if (!adapter || !isVisible) {
            return;
        }

        adapter.backButton.show();
        const unsubscribe = adapter.backButton.onClick(onClick);

        return (): void => {
            unsubscribe();
            adapter.backButton.hide();
        };
    });
};

/**
 * Svelte 5 rune-based hook for the platform SettingsButton.
 * Automatically shows the settings button in header/menu, registers the click listener,
 * and cleans up / hides the button when the component unmounts.
 */
export const useSettingsButton = (
    onClick: () => void,
    isVisible: boolean = true,
): void => {
    $effect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const adapter = platform.adapter;
        if (!adapter || !isVisible) {
            return;
        }

        adapter.settingsButton.show();
        const unsubscribe = adapter.settingsButton.onClick(onClick);

        return (): void => {
            unsubscribe();
            adapter.settingsButton.hide();
        };
    });
};

/**
 * Svelte 5 rune-based hook for Fullscreen mode.
 * Automatically requests fullscreen on component mount if supported.
 */
export const useFullscreen = (autoRequest: boolean = true): void => {
    $effect(() => {
        if (typeof window === 'undefined' || !autoRequest) {
            return;
        }

        const adapter = platform.adapter;
        if (!adapter || adapter.viewport.isFullscreen) {
            return;
        }

        adapter.viewport.requestFullscreen().catch(() => {});
    });
};

export const usePlatform = (): typeof platform => {
    return platform;
};

/**
 * Svelte 5 hook for platform theme synchronization with mode-watcher.
 * In Telegram Mini Apps, keeps mode-watcher in sync with Telegram client's dark/light mode.
 * In Standalone, lets mode-watcher manage light/dark mode autonomously.
 */
export const useThemeSync = (): void => {
    $effect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const adapter = platform.adapter;
        if (adapter && adapter.type === 'telegram') {
            adapter.syncTheme?.();
        }
    });
};
