import { z, ZodNullable, ZodOptional } from 'zod';

/**
 * Опциональное поле DTO:
 * - На входе (от БД или клиента) принимает `T | null | undefined`.
 * - На выходе (`z.infer`) выдаёт чистый `T | undefined`, исключая `null` и сохраняя строгие типы ключей.
 * - В JSON Schema / OpenAPI (Scalar UI) поле отображается как опциональное (без null и без конфликтов с transform).
 */
export const optionalField = <TOutput, TInput = TOutput>(
    schema: z.ZodType<TOutput, TInput>,
): z.ZodType<
    Exclude<TOutput, null> | undefined,
    Exclude<TInput, null> | null | undefined
> => {
    let inner: unknown = schema;
    while (inner instanceof ZodNullable || inner instanceof ZodOptional) {
        inner = inner.unwrap();
    }

    const unwrappedSchema = inner as z.ZodType;
    const description = schema.description ?? unwrappedSchema.description;

    let result: z.ZodType = z.preprocess(
        (val) => (val === null ? undefined : val),
        unwrappedSchema.optional(),
    );

    if (description) {
        result = result.describe(description);
    }

    return result as unknown as z.ZodType<
        Exclude<TOutput, null> | undefined,
        Exclude<TInput, null> | null | undefined
    >;
};

export type NullToUndefinedShape<T extends z.ZodRawShape> = {
    [K in keyof T]: null extends z.infer<T[K]>
        ? z.ZodType<
              Exclude<z.infer<T[K]>, null> | undefined,
              Exclude<z.input<T[K]>, null> | null | undefined
          >
        : T[K];
};

/**
 * Преобразует nullable-поля схемы объекта (например, полученной через .pick(...) или .omit(...))
 * в опциональные поля со значениями T | undefined (исключая null и приводя null от БД к undefined).
 * Если передано отдельное поле, оборачивает его аналогично optionalField.
 */
export function nullToUndefined<T extends z.ZodRawShape>(
    schema: z.ZodObject<T>,
): z.ZodObject<NullToUndefinedShape<T>>;
export function nullToUndefined<TOutput, TInput = TOutput>(
    schema: z.ZodType<TOutput, TInput>,
): z.ZodType<
    Exclude<TOutput, null> | undefined,
    Exclude<TInput, null> | null | undefined
>;
export function nullToUndefined(schema: unknown): unknown {
    if (schema instanceof z.ZodObject) {
        const shape = schema.shape;
        const newShape: Record<string, z.ZodType> = {};

        for (const [key, field] of Object.entries(shape)) {
            let isNullable = false;
            let curr: unknown = field;
            while (curr instanceof ZodNullable || curr instanceof ZodOptional) {
                if (curr instanceof ZodNullable) {
                    isNullable = true;
                }
                curr = curr.unwrap();
            }

            if (isNullable) {
                newShape[key] = optionalField(field as z.ZodType);
            } else {
                newShape[key] = field as z.ZodType;
            }
        }

        let result = z.object(newShape as unknown as z.ZodRawShape);
        if (schema.description) {
            result = result.describe(schema.description);
        }
        return result;
    }

    return optionalField(schema as z.ZodType);
}
