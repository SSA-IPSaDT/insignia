import { z } from 'zod';

import { plainTemporalDtoSchema } from './temporal';

export const softDeleteSchema = z
    .object({
        deletedAt: plainTemporalDtoSchema
            .nullable()
            .describe(
                'Дата мягкого удаления сущности (null, если запись активна)',
            ),
    })
    .describe('Метка мягкого удаления сущности');
