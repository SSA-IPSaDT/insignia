import { z } from 'zod';

export const baseEnvSchema = z.object({
    NODE_ENV: z
        .enum(['development', 'staging', 'production'])
        .default('development'),
    MODE: z.enum(['development', 'production']).default('development'),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type BaseEnv = z.infer<typeof baseEnvSchema>;

export const parseEnv = <T extends z.ZodTypeAny>(
    schema: T,
    source: Record<string, string | undefined> = Bun.env,
): z.infer<T> => {
    const result = schema.safeParse(source);

    if (!result.success) {
        const errorMessages = result.error.errors.map((err) => {
            const field = err.path.join('.');
            return `  ❌ [${field}]: ${err.message}`;
        });

        console.error('\n💥 Ошибка валидации переменных окружения:');
        console.error(errorMessages.join('\n'));
        console.error(
            '\nПожалуйста, проверьте файл .env или настройки системы перед запуском.\n',
        );

        throw new Error(
            `Некорректная конфигурация окружения: ${result.error.errors.length} ошибок.`,
        );
    }

    return result.data;
};

export const createLazyEnv = <T extends z.ZodTypeAny>(
    schema: T,
): z.infer<T> => {
    let cached: z.infer<T> | undefined;

    return new Proxy({} as z.infer<T>, {
        get: (_, prop: string | symbol) => {
            if (!cached) {
                cached = parseEnv(schema, Bun.env);
            }
            return (cached as Record<string | symbol, unknown>)[prop];
        },
    });
};

export const env: BaseEnv = createLazyEnv(baseEnvSchema);
