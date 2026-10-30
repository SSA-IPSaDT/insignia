import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

import winston from 'winston';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LoggerOptions {
    namespace: string;
    logDir?: string;
    minLevel?: LogLevel;
}

export interface AppLogger {
    readonly namespace: string;
    debug: (message: string, data?: unknown) => void;
    info: (message: string, data?: unknown) => void;
    warn: (message: string, data?: unknown) => void;
    error: (message: string, data?: unknown) => void;
    child: (subNamespace: string) => AppLogger;
}

// -----------------------------------------------------------------------------
// Форматтеры Winston
// -----------------------------------------------------------------------------

// Терминальный вывод с цветами и скобками: [2026-10-30 23:45:00] [INFO] [api] сообщение
const terminalFormat = winston.format.printf((info) => {
    const { level, message, timestamp, namespace, ...meta } = info;
    const ts = `\x1b[2m[${String(timestamp)}]\x1b[0m`;
    const ns = `\x1b[35m[${String(namespace ?? 'app')}]\x1b[0m`;

    let metaString = '';
    const metaKeys = Object.keys(meta);
    if (metaKeys.length > 0) {
        if (meta.stack) {
            metaString = `\n\x1b[31m${String(meta.stack)}\x1b[0m`;
        } else {
            metaString = `\n${JSON.stringify(meta, null, 2)}`;
        }
    }

    return `${ts} [${level}] ${ns} ${String(message)}${metaString}`;
});

// Файловый вывод (чистый текст без ANSI-цветов)
const fileFormat = winston.format.printf((info) => {
    const { level, message, timestamp, namespace, ...meta } = info;
    const ts = String(timestamp);
    const lvl = level.toUpperCase().padEnd(5);
    const ns = String(namespace ?? 'app');

    let metaString = '';
    const metaKeys = Object.keys(meta);
    if (metaKeys.length > 0) {
        if (meta.stack) {
            metaString = ` | Stack: ${String(meta.stack)}`;
        } else {
            metaString = ` | Data: ${JSON.stringify(meta)}`;
        }
    }

    return `[${ts}] [${lvl.trim()}] [${ns}] ${String(message)}${metaString}`;
});

// -----------------------------------------------------------------------------
// Создание экземпляра логгера
// -----------------------------------------------------------------------------
export const createLogger = (options: LoggerOptions | string): AppLogger => {
    const config: LoggerOptions =
        typeof options === 'string' ? { namespace: options } : options;
    const { namespace } = config;
    const logDir = config.logDir ?? join(process.cwd(), 'logs');
    const minLevel =
        config.minLevel ??
        (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
    const rootNamespace = namespace.split(':')[0] ?? 'app';

    if (!existsSync(logDir)) {
        try {
            mkdirSync(logDir, { recursive: true });
        } catch {
            // Игнорируем ошибку при параллельном создании папки
        }
    }

    const instance = winston.createLogger({
        level: minLevel,
        defaultMeta: { namespace },
        transports: [
            // 1. Вывод в консоль с цветными бейджами
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                    winston.format.colorize({ all: false, level: true }),
                    terminalFormat,
                ),
            }),
            // 2. Единый общий лог-файл для всей системы: logs/combined.log
            new winston.transports.File({
                filename: join(logDir, 'combined.log'),
                format: winston.format.combine(
                    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                    fileFormat,
                ),
            }),
            // 3. Лог-файл конкретного сервиса/неймспейса: logs/api.log
            new winston.transports.File({
                filename: join(logDir, `${rootNamespace}.log`),
                format: winston.format.combine(
                    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                    fileFormat,
                ),
            }),
            // 4. Лог-файл только для ошибок сервиса: logs/api.error.log
            new winston.transports.File({
                filename: join(logDir, `${rootNamespace}.error.log`),
                level: 'error',
                format: winston.format.combine(
                    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                    fileFormat,
                ),
            }),
        ],
    });

    const formatData = (data?: unknown): Record<string, unknown> => {
        if (data === undefined) return {};
        if (data instanceof Error) {
            return { error: data.message, stack: data.stack };
        }
        if (typeof data === 'object' && data !== null) {
            return data as Record<string, unknown>;
        }
        return { value: data };
    };

    return {
        namespace,
        debug: (message: string, data?: unknown): void => {
            instance.debug(message, formatData(data));
        },
        info: (message: string, data?: unknown): void => {
            instance.info(message, formatData(data));
        },
        warn: (message: string, data?: unknown): void => {
            instance.warn(message, formatData(data));
        },
        error: (message: string, data?: unknown): void => {
            instance.error(message, formatData(data));
        },
        child: (subNamespace: string): AppLogger => {
            return createLogger({
                namespace: `${namespace}:${subNamespace}`,
                logDir,
                minLevel,
            });
        },
    };
};
