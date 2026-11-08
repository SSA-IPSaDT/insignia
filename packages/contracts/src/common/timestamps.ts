import { z } from 'zod';

import { instantTemporalDtoSchema } from './temporal';

export const timestampsSchema = z
    .object({
        createdAt: instantTemporalDtoSchema.describe(
            'Временная метка создания записи (ISO-8601 UTC)',
        ),
        updatedAt: instantTemporalDtoSchema.describe(
            'Временная метка последнего обновления записи (ISO-8601 UTC)',
        ),
    })
    .describe('Временные метки создания и обновления записи');
