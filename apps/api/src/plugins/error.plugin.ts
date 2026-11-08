import {
    COMMON_ERROR_MESSAGES,
    createErrorResponse,
    createValidationErrorResponse,
    DEFAULT_INVALID_FIELD_MESSAGE,
    DEFAULT_VALIDATION_ERROR_MESSAGE,
} from '@insignia/contracts/response';
import Elysia from 'elysia';

interface ValidationErrorLike {
    all?: unknown;
    message?: string;
}

const extractValidationFields = (
    error: ValidationErrorLike,
): Record<string, string> => {
    const fields: Record<string, string> = {};

    let issues: unknown[] = [];
    try {
        if (Array.isArray(error.all) && error.all.length > 0) {
            issues = error.all;
        }
    } catch {
        // Fallback если обращение к геттеру error.all завершилось исключением
        if (error.message) {
            fields.general = error.message;
            return fields;
        }
    }

    if (issues.length === 0) {
        fields.general = error.message || DEFAULT_VALIDATION_ERROR_MESSAGE;
        return fields;
    }

    for (const issue of issues) {
        if (typeof issue !== 'object' || issue === null) {
            continue;
        }

        let rawPath = '';

        if ('path' in issue && issue.path != null) {
            rawPath = Array.isArray(issue.path)
                ? issue.path.join('.')
                : String(issue.path);
        } else if ('property' in issue && typeof issue.property === 'string') {
            rawPath = issue.property;
        }

        const fieldName =
            rawPath
                .replace(/^\//, '')
                .replaceAll('/', '.')
                .replace(/^(body|query|params|headers)\./, '')
                .replace(/^root$/, 'general') || 'general';

        if (!fields[fieldName]) {
            const message =
                'message' in issue &&
                typeof issue.message === 'string' &&
                issue.message.trim().length > 0
                    ? issue.message
                    : DEFAULT_INVALID_FIELD_MESSAGE;
            fields[fieldName] = message;
        }
    }

    return fields;
};

export const errorPlugin = new Elysia({ name: 'error-handler' })
    .onError(({ code, error, set }) => {
        if (code === 'VALIDATION') {
            set.status = 422;
            const fields = extractValidationFields(error);
            return createValidationErrorResponse(fields);
        }

        if (code === 'NOT_FOUND') {
            set.status = 404;
            return createErrorResponse(
                'NOT_FOUND',
                COMMON_ERROR_MESSAGES.NOT_FOUND,
            );
        }

        if (code === 'PARSE') {
            set.status = 400;
            return createErrorResponse(
                'BAD_REQUEST',
                COMMON_ERROR_MESSAGES.BAD_REQUEST,
            );
        }

        // Общий fallback для необработанных внутренних серверных ошибок (500)
        set.status =
            typeof set.status === 'number' && set.status >= 400
                ? set.status
                : 500;
        return createErrorResponse(
            'INTERNAL_SERVER_ERROR',
            COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        );
    })
    .as('global');
