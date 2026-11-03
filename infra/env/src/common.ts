import { z } from 'zod';

const getEnvSource = (): Record<string, string | undefined> =>
    typeof Bun !== 'undefined' ? Bun.env : process.env;

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

export const createLazyEnv = <T extends z.ZodType<object>>(
    schema: T,
): z.infer<T> => {
    let cached: z.infer<T> | undefined;

    return new Proxy({} as object, {
        get: (_, prop: string | symbol) => {
            if (!cached) {
                cached = parseEnv(schema, getEnvSource());
            }
            return (cached as Record<string | symbol, unknown>)[prop];
        },
    }) as z.infer<T>;
};
