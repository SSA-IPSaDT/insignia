import { findProblemBySlug } from '@insignia/contracts/problems';
import env from '@insignia/env';
import Elysia from 'elysia';
import { z } from 'zod';

import {
    catalogHtml,
    notFoundHtml,
    problemPages,
} from '../../../problems/generated/pages';

export const problemsController = new Elysia({
    name: 'problems',
    prefix: '/problems',
    detail: {
        tags: ['System: Problems'],
        description:
            'Каталог и каноничные страницы спецификаций проблем и ошибок платформы Insignia (RFC 9457)',
    },
})
    .get(
        '',
        ({ headers }) => {
            const accept = headers['accept'] || '';

            if (
                accept.includes('application/json') ||
                accept.includes('application/problem+json')
            ) {
                return Object.keys(problemPages).map((slug) =>
                    findProblemBySlug(slug),
                );
            }

            return new Response(catalogHtml, {
                status: 200,
                headers: {
                    'content-type': 'text/html; charset=utf-8',
                },
            });
        },
        {
            detail: {
                summary: 'Каталог проблем и ошибок API (HTML / JSON)',
                description:
                    'Возвращает статический HTML-каталог спецификаций проблем RFC 9457 либо JSON-коллекцию при соответствующем Accept-заголовке',
            },
        },
    )
    .get(
        '/:slug',
        ({ params: { slug }, headers }) => {
            const accept = headers['accept'] || '';
            const doc = findProblemBySlug(slug);

            if (
                accept.includes('application/json') ||
                accept.includes('application/problem+json')
            ) {
                if (!doc) {
                    return new Response(
                        JSON.stringify({
                            type: `${env.PUBLIC_API_URL.replace(/\/+$/, '')}/problems/problem-not-found`,
                            title: 'Тип проблемы не найден',
                            status: 404,
                            detail: `Спецификация типа проблемы '${slug}' отсутствует в реестре.`,
                            instance: `/problems/${slug}`,
                            code: 'PROBLEM_NOT_FOUND',
                        }),
                        {
                            status: 404,
                            headers: {
                                'content-type':
                                    'application/problem+json; charset=utf-8',
                            },
                        },
                    );
                }
                return doc;
            }

            const html = problemPages[slug];

            if (!html) {
                return new Response(notFoundHtml, {
                    status: 404,
                    headers: {
                        'content-type': 'text/html; charset=utf-8',
                    },
                });
            }

            return new Response(html, {
                status: 200,
                headers: {
                    'content-type': 'text/html; charset=utf-8',
                },
            });
        },
        {
            params: z.object({
                slug: z
                    .string()
                    .describe('Каноничный идентификатор проблемы (slug)'),
            }),
            detail: {
                summary: 'Документация конкретной проблемы API (HTML / JSON)',
                description:
                    'Возвращает предварительно скомпилированную Svelte 5 HTML-страницу со спецификацией проблемы, либо структурированный JSON-документ',
            },
        },
    );
