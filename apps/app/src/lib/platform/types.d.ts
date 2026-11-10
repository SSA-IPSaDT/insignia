export type PlatformType = 'standalone' | 'telegram' | 'vk' | 'max';

export interface PlatformUser {
    id: string | number | bigint;

    lastName?: string;
    firstName: string;

    username?: string;

    languageCode?: string;
    isPremium?: boolean;
}

export interface PlatformTheme {
    isDark: boolean;
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
    secondaryBackgroundColor?: string;
}

export type HapticImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
export type HapticNotificationType = 'error' | 'success' | 'warning';

export interface PlatformHaptics {
    impact: (style: HapticImpactStyle) => void;
    notification: (type: HapticNotificationType) => void;
    selection: () => void;
}

export interface PlatformBackButton {
    readonly isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => () => void;
}

export interface PlatformSettingsButton {
    readonly isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => () => void;
}

export interface PlatformSafeAreaInsets {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

export interface PlatformViewport {
    readonly isFullscreen: boolean;
    readonly isExpanded: boolean;
    readonly height: number;
    readonly width: number;
    readonly safeAreaInsets: PlatformSafeAreaInsets;
    readonly contentSafeAreaInsets: PlatformSafeAreaInsets;
    requestFullscreen: () => Promise<void>;
    exitFullscreen: () => Promise<void>;
    expand: () => void;
}

export interface PlatformAdapter {
    readonly type: PlatformType;
    readonly platformName: string;
    readonly isReady: boolean;
    readonly initDataRaw?: string;
    readonly user?: PlatformUser;
    readonly theme: PlatformTheme;
    readonly backButton: PlatformBackButton;
    readonly settingsButton: PlatformSettingsButton;
    readonly viewport: PlatformViewport;
    readonly haptics: PlatformHaptics;
    init: () => Promise<void>;
    ready: () => void;
    close: () => void;
    openLink: (url: string, options?: { tryInstantView?: boolean }) => void;
    syncTheme?: () => Promise<void> | void;
    destroy?: () => void;
    rawSdk?: unknown;
}
