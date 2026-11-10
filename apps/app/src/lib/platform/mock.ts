import { mockTelegramEnv } from '@tma.js/sdk-svelte';

export interface MockTelegramOptions {
    userId?: number;
    firstName?: string;
    lastName?: string;
    username?: string;
    theme?: 'light' | 'dark';
}

/**
 * Mocks the Telegram Mini App environment in a regular browser for local development
 * without requiring the native Telegram mobile app.
 */
export const setupTelegramMock = (options?: MockTelegramOptions): void => {
    if (typeof window === 'undefined') {
        return;
    }

    const isDark =
        options?.theme === 'dark' ||
        (options?.theme === undefined &&
            window.matchMedia?.('(prefers-color-scheme: dark)').matches);
    const userId = options?.userId ?? 99281932;
    const firstName = options?.firstName ?? 'Naylour';
    const lastName = options?.lastName ?? 'Developer';
    const username = options?.username ?? 'naylour';

    const user = {
        id: userId,
        first_name: firstName,
        last_name: lastName,
        username,
        language_code: 'ru',
        is_premium: true,
    };

    const themeParams = isDark
        ? {
              accent_text_color: '#6ab2f2' as const,
              bg_color: '#17212b' as const,
              button_color: '#5288c1' as const,
              button_text_color: '#ffffff' as const,
              destructive_text_color: '#ec3942' as const,
              header_bg_color: '#17212b' as const,
              hint_color: '#708499' as const,
              link_color: '#6ab3f3' as const,
              secondary_bg_color: '#232e3c' as const,
              section_bg_color: '#17212b' as const,
              section_header_text_color: '#6ab3f3' as const,
              subtitle_text_color: '#708499' as const,
              text_color: '#f5f5f5' as const,
          }
        : {
              accent_text_color: '#2481cc' as const,
              bg_color: '#ffffff' as const,
              button_color: '#2481cc' as const,
              button_text_color: '#ffffff' as const,
              destructive_text_color: '#ff3b30' as const,
              header_bg_color: '#ffffff' as const,
              hint_color: '#999999' as const,
              link_color: '#2481cc' as const,
              secondary_bg_color: '#f1f1f1' as const,
              section_bg_color: '#ffffff' as const,
              section_header_text_color: '#2481cc' as const,
              subtitle_text_color: '#999999' as const,
              text_color: '#000000' as const,
          };

    const initDataRaw = new URLSearchParams([
        ['user', JSON.stringify(user)],
        ['hash', 'mock_hash_for_dev_environment'],
        ['auth_date', String(Math.floor(Date.now() / 1000))],
        ['signature', 'mock_signature_for_dev_environment'],
    ]).toString();

    mockTelegramEnv({
        launchParams: {
            tgWebAppThemeParams: themeParams,
            tgWebAppData: initDataRaw,
            tgWebAppVersion: '8.0',
            tgWebAppPlatform: 'tdesktop',
        },
    });
};
