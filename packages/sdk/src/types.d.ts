export interface BaseClientOptions {
    /** Кастомный fetch (например, event.fetch из SvelteKit SSR, или Bun.fetch) */
    fetch?: typeof fetch;

    /** Токен авторизации или функция его получения */
    auth?: string | (() => string | null | Promise<string | null>);

    /** Таймаут в миллисекундах */
    timeout?: number;

    /** Дополнительные постоянные заголовки */
    headers?: Record<string, string>;
}

export interface BaseUrlOptions extends BaseClientOptions {
    /** Явный базовый URL (если задан, переопределяет автоопределение) */
    baseUrl?: string;

    host?: never;
    port?: never;
    protocol?: never;
}

export interface HostPortOptions extends BaseClientOptions {
    /** Хост API (если не передан baseUrl) */
    host: string;

    /** Порт API (если не передан baseUrl) */
    port: number;

    /** Протокол соединения ('http' | 'https') */
    protocol?: 'http' | 'https';

    baseUrl?: never;
}

export interface AutoResolveOptions extends BaseClientOptions {
    baseUrl?: never;
    host?: never;
    port?: never;
    protocol?: never;
}

export type InsigniaClientOptions =
    BaseUrlOptions | HostPortOptions | AutoResolveOptions;
