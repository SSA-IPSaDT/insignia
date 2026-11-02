import { z } from 'zod';

export const baseEnvSchema = z.object({
    NODE_ENV: z
        .enum(['development', 'staging', 'production', 'test'])
        .default('development'),
    MODE: z.enum(['development', 'production', 'test']).default('development'),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type BaseEnv = z.infer<typeof baseEnvSchema>;

export const apiEnvSchema = baseEnvSchema.extend({
    API_PORT: z.coerce.number().default(3000),
    API_HOST: z.string().default('0.0.0.0'),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;

export const parseEnv = <T extends z.ZodType>(
    schema: T,
    source: Record<string, string | undefined> = Bun.env,
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
                cached = parseEnv(schema, Bun.env);
            }
            return (cached as Record<string | symbol, unknown>)[prop];
        },
    }) as z.infer<T>;
};

export const env: BaseEnv = createLazyEnv(baseEnvSchema);

export const apiEnv: ApiEnv = createLazyEnv(apiEnvSchema);
