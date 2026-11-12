/**
 * Категории проблем и ошибок платформы Insignia.
 */
export type ProblemCategory =
    'common' | 'users' | 'telegram' | 'organizations' | 'health';

/**
 * Роль или сторона, к которой адресовано действие по устранению ошибки.
 */
export type RemediationActor = 'client' | 'developer' | 'admin' | 'devops';

/**
 * Шаг или рекомендация по устранению ошибки для конкретной роли.
 */
export interface ProblemRemediationStep {
    /** Роль исполнителя (клиент, разработчик, администратор, devops) */
    readonly actor: RemediationActor;
    /** Краткое название рекомендации */
    readonly title: string;
    /** Пошаговая инструкция по устранению проблемы */
    readonly description: string;
}

/**
 * Исчерпывающая машиночитаемая и человекочитаемая спецификация проблемы/ошибки
 * в соответствии со стандартом RFC 9457 (Problem Details for HTTP APIs).
 */
export interface ProblemDocument {
    /** Уникальный машиночитаемый строковый код ошибки (например, USER_NOT_FOUND) */
    readonly code: string;
    /** URL-slug для каноничного URI документации (/problems/:slug) */
    readonly slug: string;
    /** Короткий человекочитаемый заголовок проблемы (RFC 9457 "title") */
    readonly title: string;
    /** Рекомендуемый HTTP-статус код ответа (RFC 9457 "status") */
    readonly status: number;
    /** Доменная категория проблемы */
    readonly category: ProblemCategory;
    /** Название категории на русском языке для каталога */
    readonly categoryLabel: string;
    /** Краткое резюме проблемы (1-2 предложения) */
    readonly summary: string;
    /** Подробное описание природы и контекста возникновения ошибки */
    readonly description: string;
    /** Перечень типичных причин и сценариев возникновения */
    readonly causes: readonly string[];
    /** Инструкции по устранению проблемы для клиентов, разработчиков и администраторов */
    readonly remediation: readonly ProblemRemediationStep[];
    /** Особенности архитектуры Insignia (soft-delete, UUIDv7, @@check, Zod-контракты, транзакции) */
    readonly architectureNotes: readonly string[];
    /** Пример wire-ответа API в формате JSON */
    readonly examplePayload: Record<string, unknown>;
    /** Список эндпоинтов, где может возникать данная ошибка */
    readonly relatedEndpoints: readonly string[];
}
