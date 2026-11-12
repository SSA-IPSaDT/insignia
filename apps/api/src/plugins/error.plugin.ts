import {
    COMMON_ERROR_MESSAGES,
    createErrorResponse,
    createValidationErrorResponse,
    DEFAULT_INVALID_FIELD_MESSAGE,
    DEFAULT_VALIDATION_ERROR_MESSAGE,
} from '@insignia/contracts/response';
import env from '@insignia/env';
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

const isProblemDetails = (val: unknown): val is Record<string, unknown> =>
    typeof val === 'object' &&
    val !== null &&
    !(val instanceof Response) &&
    'type' in val &&
    'status' in val &&
    typeof (val as { status: unknown }).status === 'number' &&
    (val as { status: number }).status >= 400;

const formatProblemType = (type: unknown): string => {
    if (typeof type !== 'string') {
        return `${env.PUBLIC_API_URL.replace(/\/+$/, '')}/problems/not-found`;
    }
    if (type.startsWith('http://') || type.startsWith('https://')) {
        return type;
    }
    const cleanSlug = type.replace(/^\/?(problems\/)?/, '');
    const baseUrl = env.PUBLIC_API_URL.replace(/\/+$/, '');
    return `${baseUrl}/problems/${cleanSlug}`;
};

export const errorPlugin = new Elysia({ name: 'error-handler' })
    .onAfterHandle(({ response, set, path }) => {
        if (isProblemDetails(response)) {
            set.status = response.status as number;
            set.headers['content-type'] =
                'application/problem+json; charset=utf-8';
            if (!response.instance || response.instance === '/') {
                response.instance = path;
            }
            response.type = formatProblemType(response.type);
            return;
        }

        if (
            typeof response === 'object' &&
            response !== null &&
            'response' in response &&
            isProblemDetails((response as { response: unknown }).response)
        ) {
            const inner = (response as { response: Record<string, unknown> })
                .response;
            set.headers['content-type'] =
                'application/problem+json; charset=utf-8';
            if (!inner.instance || inner.instance === '/') {
                inner.instance = path;
            }
            inner.type = formatProblemType(inner.type);
        }
    })
    .onError(({ code, error, set, path, request }) => {
        set.headers['content-type'] = 'application/problem+json; charset=utf-8';
        const instance =
            path || (request ? new URL(request.url).pathname : '/');

        const finalizeError = <T extends { type: string }>(problem: T): T => {
            problem.type = formatProblemType(problem.type);
            return problem;
        };

        if (code === 'VALIDATION') {
            set.status = 422;
            const fields = extractValidationFields(error);
            return finalizeError(
                createValidationErrorResponse(
                    fields,
                    DEFAULT_VALIDATION_ERROR_MESSAGE,
                    { instance },
                ),
            );
        }

        if (code === 'NOT_FOUND') {
            set.status = 404;
            return finalizeError(
                createErrorResponse(
                    'NOT_FOUND',
                    COMMON_ERROR_MESSAGES.NOT_FOUND,
                    undefined,
                    { instance, status: 404 },
                ),
            );
        }

        if (code === 'PARSE') {
            set.status = 400;
            return finalizeError(
                createErrorResponse(
                    'BAD_REQUEST',
                    COMMON_ERROR_MESSAGES.BAD_REQUEST,
                    undefined,
                    { instance, status: 400 },
                ),
            );
        }

        const errorObj =
            typeof error === 'object' && error !== null
                ? (error as Record<string, unknown>)
                : {};

        const isDatabaseError =
            errorObj.kind === 'sql_query' ||
            (typeof errorObj.code === 'string' &&
                (errorObj.code.startsWith('CONTRACT.') ||
                    errorObj.code === '28P01' ||
                    errorObj.code === 'ECONNREFUSED')) ||
            errorObj.name === 'SqlQueryError' ||
            errorObj.name === 'SqlConnectionError' ||
            errorObj.name === 'CliStructuredError';

        if (isDatabaseError) {
            set.status = 503;
            return finalizeError(
                createErrorResponse(
                    'SERVICE_UNAVAILABLE',
                    COMMON_ERROR_MESSAGES.SERVICE_UNAVAILABLE,
                    undefined,
                    { instance, status: 503 },
                ),
            );
        }

        if (set.status === 501) {
            return finalizeError(
                createErrorResponse(
                    'NOT_IMPLEMENTED',
                    COMMON_ERROR_MESSAGES.NOT_IMPLEMENTED,
                    undefined,
                    { instance, status: 501 },
                ),
            );
        }

        // Общий fallback для необработанных внутренних серверных ошибок (500)
        set.status =
            typeof set.status === 'number' && set.status >= 400
                ? set.status
                : 500;
        return finalizeError(
            createErrorResponse(
                'INTERNAL_SERVER_ERROR',
                COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
                undefined,
                { instance, status: set.status },
            ),
        );
    })
    .as('global');
