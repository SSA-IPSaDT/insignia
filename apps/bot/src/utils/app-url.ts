import env, { getLocalIp } from '@insignia/env';

export { getLocalIp };

/**
 * Преобразует URL для сетевой доступности:
 * - Если ссылка уже публичная (внешний домен, порт и т.д.), возвращает её в неизменном виде.
 * - Если хост локальный (localhost или 0.0.0.0), заменяет его на реальный локальный IP адрес хоста в сети (LAN IP).
 */
export const resolveNetworkUrl = (rawUrl: string): string => {
    try {
        const parsed = new URL(rawUrl);

        if (parsed.hostname === 'localhost' || parsed.hostname === '0.0.0.0') {
            parsed.hostname = getLocalIp();
            return parsed.toString().replace(/\/$/, '');
        }

        return rawUrl;
    } catch {
        return rawUrl;
    }
};

/**
 * Возвращает рабочий URL клиентского приложения для Telegram Mini App / Web-ссылок.
 * По умолчанию использует env.PUBLIC_APP_URL.
 */
export const resolveAppUrl = (rawUrl: string = env.PUBLIC_APP_URL): string => {
    return resolveNetworkUrl(rawUrl);
};

/**
 * Возвращает рабочий URL API сервиса для внешних или клиентских вызовов.
 * По умолчанию использует env.PUBLIC_API_URL.
 */
export const resolveApiUrl = (rawUrl: string = env.PUBLIC_API_URL): string => {
    return resolveNetworkUrl(rawUrl);
};

export const isWebAppUrl = (rawUrl: string): boolean => {
    try {
        return new URL(rawUrl).protocol === 'https:';
    } catch {
        return false;
    }
};
