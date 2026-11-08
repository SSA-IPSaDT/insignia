import { Temporal } from 'temporal-polyfill';
import { z } from 'zod';

/**
 * Валидатор и трансформер входящей даты (для Create / Update / Query).
 * Принимает ISO-строку 'YYYY-MM-DD' или уже готовый объект Temporal.PlainDate
 * и гарантированно возвращает валидный Temporal.PlainDate.
 */
export const inputTemporalSchema = z
    .union([
        z.instanceof(Temporal.PlainDate),
        z.string().transform((value, __context__) => {
            try {
                return Temporal.PlainDate.from(value);
            } catch {
                __context__.addIssue({
                    code: 'custom',
                    message: 'Некорректная календарная дата',
                });
                return z.NEVER;
            }
        }),
    ])
    .describe(
        'Входящая календарная дата (строка YYYY-MM-DD или Temporal.PlainDate)',
    );

/**
 * Строгая схема для DTO/ответов API.
 * В типизации выводит `Temporal.PlainDate`.
 */
export const plainTemporalDtoSchema = z
    .union([
        z.instanceof(Temporal.PlainDate),
        z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/)
            .transform((val) => Temporal.PlainDate.from(val)),
    ])
    .describe(
        'Календарная дата в формате ISO-8601 (YYYY-MM-DD), объект Temporal.PlainDate',
    );

/** Для меток времени со временем и таймзоной (ISO-8601 -> Temporal.Instant) */
export const instantTemporalDtoSchema = z
    .union([
        z.instanceof(Temporal.Instant),
        z.iso.datetime().transform((val) => Temporal.Instant.from(val)),
    ])
    .describe(
        'Метка точного времени в формате ISO-8601 UTC, объект Temporal.Instant',
    );
