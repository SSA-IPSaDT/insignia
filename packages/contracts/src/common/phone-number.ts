import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { z } from 'zod';

/**
 * Валидатор и нормализатор телефона.
 * По умолчанию принимает любые номера с префиксом (+7, +992, +375, и т.д.).
 */
export const inputPhoneSchema = z
    .string()
    .transform((value, __context__) => {
        const phoneNumber = parsePhoneNumberFromString(value);

        if (!phoneNumber || !phoneNumber.isValid()) {
            __context__.addIssue({
                code: 'custom',
                message:
                    'Некорректный номер телефона. Укажите номер в формате +7 (9XX) XXX-XX-XX, или в других стандартных форматах',
            });

            return z.NEVER;
        }

        return phoneNumber.format('E.164');
    })
    .describe(
        'Входящий номер телефона в международном или национальном формате',
    );

/** Строгая схема для DTO/ответов из БД (уже сохраненный валидный E.164) */
export const phoneDtoSchema = z
    .string()
    .regex(/^\+[1-9]\d{9,14}$/)
    .describe(
        'Нормализованный номер телефона в международном формате E.164 (начиная с +)',
    );
