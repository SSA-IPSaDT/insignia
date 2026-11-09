import { Temporal } from 'temporal-polyfill';

const BIGINT_KEYS = new Set(['telegramId']);

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATETIME_REGEX =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}(?::?\d{2})?)$/;

/**
 * Быстрый легковесный парсер ответов Insignia API.
 * Автоматически гидрирует:
 * - Календарные даты (YYYY-MM-DD) в объекты Temporal.PlainDate.
 * - Временные метки (ISO-8601) в объекты Temporal.Instant.
 * - BigInt-ключи (например, telegramId) в нативный тип bigint.
 */
export const parseInsigniaJson = <TOut = unknown>(text: string): TOut => {
    return JSON.parse(text, (key, value) => {
        if (typeof value === 'string') {
            if (ISO_DATE_REGEX.test(value)) {
                try {
                    return Temporal.PlainDate.from(value);
                } catch {
                    return value;
                }
            }

            if (ISO_DATETIME_REGEX.test(value)) {
                try {
                    return Temporal.Instant.from(value);
                } catch {
                    return value;
                }
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
