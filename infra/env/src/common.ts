import { z } from 'zod';

const getEnvSource = (): Record<string, string | undefined> => {
    if (typeof Bun !== 'undefined') return Bun.env;
    if (typeof process !== 'undefined') return process.env;
    return {};
};

export const parseEnv = <T extends z.ZodType>(
    schema: T,
    source: Record<string, string | undefined> = getEnvSource(),
): z.infer<T> => {
    const result = schema.safeParse(source);

    if (!result.success) {
        const errorMessages = result.error.issues.map((err) => {
            const field = err.path.map((segment) => String(segment)).join('.');
            return `  ❌ [${field}]: ${err.message}`;
        });

        console.error('\n💥 Ошибка валидации переменных окружения:');
        console.error(errorMessages.join('\n'));
        console.error(
            '\nПожалуйста, проверьте файл .env или настройки системы перед запуском.\n',
        );

        throw new Error(
            `Некорректная конфигурация окружения: ${result.error.issues.length} ошибок.`,
        );
    }

    return result.data;
};

export const populateProcessEnv = (source: Record<string, unknown>): void => {
    if (typeof process !== 'undefined' && process.env) {
        for (const [key, val] of Object.entries(source)) {
            if (val !== undefined && val !== null && typeof val !== 'object') {
                process.env[key] = String(val);
            }
        }
    }
    if (typeof Bun !== 'undefined' && Bun.env) {
        for (const [key, val] of Object.entries(source)) {
            if (val !== undefined && val !== null && typeof val !== 'object') {
                Bun.env[key] = String(val);
            }
        }
    }
};

export const createLazyEnv = <T extends z.ZodType<object>>(
    schema: T,
): z.infer<T> => {
    let cached: z.infer<T> | undefined;
    const target = {} as Record<string | symbol, unknown>;

    const getCached = (): z.infer<T> => {
        if (!cached) {
            cached = parseEnv(schema, getEnvSource());
            Object.assign(target, cached);
            populateProcessEnv(cached as Record<string, unknown>);
        }
        return cached;
    };

    return new Proxy(target, {
        get: (_, prop: string | symbol) => {
            if (
                (typeof Bun !== 'undefined' && prop === Bun.inspect?.custom) ||
                prop === Symbol.for('nodejs.util.inspect.custom')
            ) {
                return () => getCached();
            }

            return (getCached() as Record<string | symbol, unknown>)[prop];
        },
        has: (_, prop: string | symbol) => {
            getCached();
            return prop in target;
        },
        ownKeys: () => {
            getCached();
            return Reflect.ownKeys(target);
        },
        getOwnPropertyDescriptor: (_, prop: string | symbol) => {
            getCached();
            return Reflect.getOwnPropertyDescriptor(target, prop);
        },
    }) as z.infer<T>;
};
