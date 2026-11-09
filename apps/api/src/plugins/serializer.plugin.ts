import { Elysia } from 'elysia';

/**
 * Плагин стандартизированной сериализации JSON-ответов API:
 * 1. Исключает поля со значением `null` (ADR-0007 — Zero Payload Bloat).
 * 2. Безопасно преобразует `BigInt` в строковый wire-формат (ADR-0008).
 * 3. Сохраняет HTTP-статусы и сформированные заголовки ответа.
 */
export const serializerPlugin = new Elysia({ name: 'serializer' }).mapResponse(
    ({ response, set }) => {
        if (
            response !== null &&
            typeof response === 'object' &&
            !(response instanceof Response)
        ) {
            const headers = new Headers();
            for (const [key, value] of Object.entries(set.headers)) {
                if (value !== undefined) {
                    headers.set(key, String(value));
                }
            }
            headers.set('content-type', 'application/json; charset=utf-8');

            return new Response(
                JSON.stringify(response, (_key: string, value: unknown) => {
                    if (value === null) {
                        return undefined;
                    }
                    if (typeof value === 'bigint') {
                        return value.toString();
                    }
                    return value;
                }),
                {
                    status: typeof set.status === 'number' ? set.status : 200,
                    headers,
                },
            );
        }
    },
);
