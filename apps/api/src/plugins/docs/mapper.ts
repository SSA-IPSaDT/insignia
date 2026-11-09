import type { ElysiaOpenAPIConfig } from '@elysia/openapi';
import z from 'zod';

export type JsonSchemaMapper = NonNullable<
    ElysiaOpenAPIConfig['mapJsonSchema']
>;

export const jsonSchemaMapper: JsonSchemaMapper = {
    zod: (schema: unknown) =>
        z.toJSONSchema(schema as z.ZodType, {
            io: 'input',
            unrepresentable: ({ message }) => {
                if (message.includes('BigInt')) {
                    return { type: 'integer', format: 'int64' };
                }
                if (message.includes('Custom')) {
                    return { type: 'string', format: 'date-time' };
                }
                return {};
            },
        }),
};
