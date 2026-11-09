import { z } from 'zod';

import { plainTemporalDtoSchema } from './temporal';

export const softDeleteSchema = z
    .object({
        deletedAt: plainTemporalDtoSchema
            .nullable()
            .describe('Дата мягкого удаления сущности'),
    })
    .describe('Метка мягкого удаления сущности');
