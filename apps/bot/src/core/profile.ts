import { userBaseSchema } from '@insignia/contracts/users';
import type { ZodType } from 'zod';

import type { ProfileDraft, StudentProfile } from '#types/models';

/**
 * Callback-данные кнопок диалога заполнения профиля.
 * Живут в доменном слое, чтобы их одинаково использовали вью и conversation.
 */
export const PROFILE_SKIP_CALLBACK = 'profile:skip';
export const PROFILE_CANCEL_CALLBACK = 'profile:cancel';

export type ProfileStepId = keyof ProfileDraft;

/** Один шаг диалога: что спрашиваем, как подсказываем и как проверяем ответ. */
export interface ProfileStep {
    id: ProfileStepId;
    title: string;
    prompt: string;
    hint: string;
    validate: (value: string) => string | null;
}

/**
 * Проверка значения схемой контракта.
 *
 * Возвращает `null`, если значение валидно, иначе — первое человекочитаемое
 * сообщение из схемы (они уже сформулированы по-русски в `@insignia/contracts`).
 */
const validateWith = (schema: ZodType, value: string): string | null => {
    const result = schema.safeParse(value);

    if (result.success) {
        return null;
    }

    return (
        result.error.issues[0]?.message ??
        'Некорректное значение. Проверьте ввод и попробуйте снова.'
    );
};

/**
 * ФИО валидируется схемами контрактов, а не локальными регулярками:
 * правила (1–64 символа, trim) и тексты ошибок живут в одном месте.
 */
export const validateLastName = (value: string): string | null =>
    validateWith(userBaseSchema.shape.lastName, value);

export const validateFirstName = (value: string): string | null =>
    validateWith(userBaseSchema.shape.firstName, value);

export const validatePatronymic = (value: string): string | null =>
    validateWith(userBaseSchema.shape.patronymic, value);

const AGE_MIN = 14;
const AGE_MAX = 100;

/** Возраст: целое число в диапазоне 14–100. */
export const validateAge = (value: string): string | null => {
    const trimmed = value.trim();

    if (!/^\d{1,3}$/.test(trimmed)) {
        return 'Возраст — это число. Например: 19.';
    }

    const age = Number(trimmed);

    if (age < AGE_MIN || age > AGE_MAX) {
        return `Возраст должен быть от ${AGE_MIN} до ${AGE_MAX} лет.`;
    }

    return null;
};

const CONTACTS_MIN_LENGTH = 3;
const CONTACTS_MAX_LENGTH = 64;
// Телефон, @username, e-mail или ник — без экзотики, но с кириллицей.
const CONTACTS_PATTERN =
    /^[A-Za-zА-Яа-яЁё0-9@+][A-Za-zА-Яа-яЁё0-9@+()._\-\s]{2,63}$/;

/**
 * Контакты на этапе MVP — одно свободное поле. Когда бот перейдёт на реальный
 * API, шаг разложится на `phone` и `email` из контракта пользователя.
 */
export const validateContacts = (value: string): string | null => {
    const trimmed = value.trim();

    if (trimmed.length < CONTACTS_MIN_LENGTH) {
        return 'Слишком коротко: укажи телефон, @username или e-mail.';
    }

    if (trimmed.length > CONTACTS_MAX_LENGTH) {
        return `Слишком длинно: максимум ${CONTACTS_MAX_LENGTH} символов.`;
    }

    if (!CONTACTS_PATTERN.test(trimmed)) {
        return 'Не похоже на контакт. Примеры: +7 999 123-45-67, @ivanov, ivanov@example.com.';
    }

    return null;
};

/**
 * Порядок шагов зафиксирован issue #37:
 * Фамилия → Имя → Отчество → Возраст → Контакты.
 */
export const PROFILE_STEPS: readonly ProfileStep[] = [
    {
        id: 'lastName',
        title: 'Фамилия',
        prompt: 'Напиши свою <b>фамилию</b> одним сообщением.',
        hint: 'Например: Иванов',
        validate: validateLastName,
    },
    {
        id: 'firstName',
        title: 'Имя',
        prompt: 'Теперь <b>имя</b>.',
        hint: 'Например: Иван',
        validate: validateFirstName,
    },
    {
        id: 'patronymic',
        title: 'Отчество',
        prompt: 'И <b>отчество</b>.',
        hint: 'Например: Иванович. Если отчества нет — пропусти шаг.',
        validate: validatePatronymic,
    },
    {
        id: 'age',
        title: 'Возраст',
        prompt: 'Сколько тебе <b>полных лет</b>?',
        hint: 'Только число. Доступны значения от 14 до 100.',
        validate: validateAge,
    },
    {
        id: 'contacts',
        title: 'Контакты',
        prompt: 'Оставь <b>контакты</b> для связи.',
        hint: 'Телефон (+7 999 123-45-67), @username или e-mail.',
        validate: validateContacts,
    },
];

const normalizeValue = (value: string | undefined): string | undefined => {
    const trimmed = value?.trim();

    if (trimmed === undefined || trimmed === '') {
        return undefined;
    }

    return trimmed;
};

/**
 * Превращает сырые ответы диалога в профиль: обрезает пробелы,
 * пустые строки (в том числе после «Пропустить») превращает в отсутствующие поля.
 */
export const buildProfileFromDraft = (draft: ProfileDraft): StudentProfile => {
    const profile: StudentProfile = {};

    const lastName = normalizeValue(draft.lastName);
    if (lastName !== undefined) {
        profile.lastName = lastName;
    }

    const firstName = normalizeValue(draft.firstName);
    if (firstName !== undefined) {
        profile.firstName = firstName;
    }

    const patronymic = normalizeValue(draft.patronymic);
    if (patronymic !== undefined) {
        profile.patronymic = patronymic;
    }

    const age = normalizeValue(draft.age);
    if (age !== undefined) {
        profile.age = Number(age);
    }

    const contacts = normalizeValue(draft.contacts);
    if (contacts !== undefined) {
        profile.contacts = contacts;
    }

    return profile;
};
