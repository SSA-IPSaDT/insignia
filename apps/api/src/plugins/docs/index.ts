import { openapi } from '@elysia/openapi';
import Elysia from 'elysia';

import { documentation } from './documentation';
import { jsonSchemaMapper } from './mapper';
import { docsModels } from './models';
import { scalarConfig } from './scalar';

export const docsPlugin = new Elysia({ name: 'docs' })
    .model(docsModels)
    .use(
        openapi({
            provider: 'scalar',
            path: '/docs',
            specPath: '/docs/json',
            mapJsonSchema: jsonSchemaMapper,
            documentation,
            scalar: scalarConfig,
        }),
    )
    .as('global');

export * from './documentation';
export * from './mapper';
export * from './models';
export * from './scalar';
