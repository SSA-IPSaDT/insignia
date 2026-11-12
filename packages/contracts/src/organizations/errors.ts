import type { z } from 'zod';

import { createDomainErrors } from '../response';

export const organizationErrors = createDomainErrors({
    domain: 'организации',
    notFoundCode: 'ORGANIZATION_NOT_FOUND',
    notFoundDescription: 'Ответ с ошибкой: организация не найдена',
    messages: {
        ORGANIZATION_NOT_FOUND: 'Организация не найдена.',
        ORGANIZATION_ALREADY_EXISTS:
            'Организация с таким именем уже существует.',
        ORGANIZATION_SLUG_TAKEN:
            'Указанный slug уже занят другой организацией.',
        ORGANIZATION_LIMIT_REACHED:
            'Превышен лимит на количество создаваемых организаций.',
        ORGANIZATION_SUSPENDED: 'Деятельность организации приостановлена.',
        ORGANIZATION_FORBIDDEN:
            'Недостаточно прав для управления этой организацией.',
    } as const,
    statuses: {
        ORGANIZATION_NOT_FOUND: 404,
        ORGANIZATION_ALREADY_EXISTS: 409,
        ORGANIZATION_SLUG_TAKEN: 409,
        ORGANIZATION_LIMIT_REACHED: 400,
        ORGANIZATION_SUSPENDED: 403,
        ORGANIZATION_FORBIDDEN: 403,
    },
});

export type OrganizationErrorCode = z.infer<
    typeof organizationErrors.codeSchema
>;
export type OrganizationErrorResponse = z.infer<
    typeof organizationErrors.errorResponseSchema
>;
export type OrganizationNotFoundErrorResponse = z.infer<
    typeof organizationErrors.notFoundSchema
>;

export const organizationErrorCodeSchema = organizationErrors.codeSchema;
export const ORGANIZATION_ERROR_MESSAGES = organizationErrors.messages;
export const organizationErrorResponseSchema =
    organizationErrors.errorResponseSchema;
export const organizationNotFoundErrorResponseSchema =
    organizationErrors.notFoundSchema!;
export const createOrganizationErrorResponse = organizationErrors.createError;
export const createOrganizationNotFoundErrorResponse =
    organizationErrors.createNotFound!;
export const organizationAlreadyExistsErrorSchema =
    organizationErrors.createSpecificErrorSchema(
        'ORGANIZATION_ALREADY_EXISTS',
        'Ответ с ошибкой: организация с таким именем уже существует',
        409,
    );
