import type { PlatformType } from './types.d.ts';

export interface DetectPlatformOptions {
    location?: {
        search?: string;
        hash?: string;
    };
    telegramGlobal?: unknown;
}

export const detectPlatform = (
    options?: DetectPlatformOptions,
): PlatformType => {
    const loc =
        options?.location ??
        (typeof window !== 'undefined'
            ? { search: window.location.search, hash: window.location.hash }
            : undefined);

    if (!loc) {
        return 'standalone';
    }

    const search = loc.search ?? '';
    const hash = loc.hash ?? '';

    const isTelegramUrl =
        search.includes('tgWebAppData=') ||
        search.includes('tgWebAppPlatform=') ||
        search.includes('tgWebAppVersion=') ||
        search.includes('platform=telegram') ||
        search.includes('mock=tg') ||
        hash.includes('tgWebAppData=') ||
        hash.includes('tgWebAppPlatform=') ||
        hash.includes('tgWebAppVersion=');

    const tgObj =
        options?.telegramGlobal ??
        (typeof window !== 'undefined'
            ? (
                  window as unknown as {
                      Telegram?: { WebApp?: { initData?: string } };
                  }
              ).Telegram?.WebApp
            : undefined);

    const hasTelegramData =
        typeof tgObj === 'object' &&
        tgObj !== null &&
        'initData' in tgObj &&
        typeof (tgObj as { initData?: unknown }).initData === 'string' &&
        (tgObj as { initData: string }).initData.trim().length > 0;

    if (isTelegramUrl || hasTelegramData) {
        return 'telegram';
    }

    if (search.includes('vk_user_id=') || search.includes('vk_app_id=')) {
        return 'vk';
    }

    if (search.includes('max_user_id=')) {
        return 'max';
    }

    return 'standalone';
};
