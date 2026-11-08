import { Temporal } from 'temporal-polyfill';

const BIGINT_KEYS = new Set(['telegramId']);

/**
 * Быстрый легковесный парсер ответов Insignia API.
 * Автоматически гидрирует даты в объекты Temporal.PlainDate.
 */
export const parseInsigniaJson = <TOut = unknown>(text: string): TOut => {
    return JSON.parse(text, (key, value) => {
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
            try {
                return Temporal.PlainDate.from(value);
            } catch {
                return value;
            }
        }

        if (
            BIGINT_KEYS.has(key) &&
            (typeof value === 'string' || typeof value === 'number')
        ) {
            try {
                return BigInt(value);
            } catch {
                return value;
            }
        }
        return value;
    }) as TOut;
};

/**
 * Сериализатор тела запросов: безопасно преобразует BigInt в строку.
 */
export const stringifyInsigniaJson = (value: unknown): string => {
    return JSON.stringify(value, (_key, value) => {
        return typeof value === 'bigint' ? value.toString() : value;
    });
};
