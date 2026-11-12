import { COMMON_PROBLEMS } from './common';
import { HEALTH_PROBLEMS } from './health';
import { ORGANIZATION_PROBLEMS } from './organizations';
import { TELEGRAM_PROBLEMS } from './telegram';
import type { ProblemCategory, ProblemDocument } from './types';
import { USER_PROBLEMS } from './users';

/**
 * Исчерпывающий реестр всех задокументированных проблем и ошибок платформы Insignia.
 */
export const PROBLEM_DOCUMENTS: readonly ProblemDocument[] = [
    ...COMMON_PROBLEMS,
    ...USER_PROBLEMS,
    ...TELEGRAM_PROBLEMS,
    ...ORGANIZATION_PROBLEMS,
    ...HEALTH_PROBLEMS,
];

/** Быстрая индексная карта проблем по уникальному URL-slug */
const PROBLEMS_BY_SLUG: ReadonlyMap<string, ProblemDocument> = new Map(
    PROBLEM_DOCUMENTS.map((doc) => [doc.slug.toLowerCase(), doc]),
);

/** Быстрая индексная карта проблем по машиночитаемому коду (code) */
const PROBLEMS_BY_CODE: ReadonlyMap<string, ProblemDocument> = new Map(
    PROBLEM_DOCUMENTS.map((doc) => [doc.code.toUpperCase(), doc]),
);

/**
 * Находит спецификацию проблемы по её URL-slug (регистронезависимо).
 *
 * @param slug Каноничный URL-идентификатор (например, 'user-not-found').
 * @returns Документ проблемы или undefined, если ошибка не найдена.
 */
export const findProblemBySlug = (
    slug: string,
): ProblemDocument | undefined => {
    return PROBLEMS_BY_SLUG.get(slug.trim().toLowerCase());
};

/**
 * Находит спецификацию проблемы по её машинному коду ошибки.
 *
 * @param code Машиночитаемый код (например, 'USER_NOT_FOUND').
 * @returns Документ проблемы или undefined, если ошибка не найдена.
 */
export const findProblemByCode = (
    code: string,
): ProblemDocument | undefined => {
    return PROBLEMS_BY_CODE.get(code.trim().toUpperCase());
};

/**
 * Возвращает список всех проблем, относящихся к указанной категории.
 *
 * @param category Доменная категория проблемы.
 * @returns Массив спецификаций проблем указанной категории.
 */
export const getProblemsByCategory = (
    category: ProblemCategory,
): readonly ProblemDocument[] => {
    return PROBLEM_DOCUMENTS.filter((doc) => doc.category === category);
};

/**
 * Возвращает массив всех зарегистрированных URL-slug проблем.
 */
export const getAllProblemSlugs = (): readonly string[] => {
    return PROBLEM_DOCUMENTS.map((doc) => doc.slug);
};

/**
 * Возвращает массив всех зарегистрированных машинных кодов ошибок.
 */
export const getAllProblemCodes = (): readonly string[] => {
    return PROBLEM_DOCUMENTS.map((doc) => doc.code);
};
