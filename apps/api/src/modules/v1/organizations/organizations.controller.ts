import {
    createOrganizationEndpoint,
    deleteOrganizationEndpoint,
    takeOrganizationByIdEndpoint,
    takeOrganizationsEndpoint,
    updateOrganizationEndpoint,
} from '@insignia/contracts/organizations';
import { createErrorResponse } from '@insignia/contracts/response';
import Elysia from 'elysia';

export const organizations = new Elysia({
    name: 'v1.organizations',
    prefix: '/organizations',
    detail: {
        tags: ['Organizations'],
        description:
            'Управление организациями, поиск, создание и администрирование',
    },
})
    .get(
        '',
        () => createErrorResponse('NOT_IMPLEMENTED'),
        takeOrganizationsEndpoint,
    )
    .post(
        '',
        () => createErrorResponse('NOT_IMPLEMENTED'),
        createOrganizationEndpoint,
    )
    .get(
        '/:id',
        () => createErrorResponse('NOT_IMPLEMENTED'),
        takeOrganizationByIdEndpoint,
    )
    .patch(
        '/:id',
        () => createErrorResponse('NOT_IMPLEMENTED'),
        updateOrganizationEndpoint,
    )
    .delete(
        '/:id',
        () => createErrorResponse('NOT_IMPLEMENTED'),
        deleteOrganizationEndpoint,
    );
