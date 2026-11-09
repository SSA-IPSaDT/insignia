import { z } from 'zod';

import { instantTemporalDtoSchema } from './temporal';

export const timestampsSchema = z
    .object({
        createdAt: instantTemporalDtoSchema.describe(
            'Временная метка создания записи',
        ),
        updatedAt: instantTemporalDtoSchema.describe(
            'Временная метка обновления записи',
        ),
    })
    .describe('Временные метки записи');
