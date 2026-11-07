import env from '@insignia/env';
import postgres from '@prisma/orm-postgres/runtime';
import { contractFromJson } from '@prisma/orm-postgres/static';

import type { Contract } from './schemas/contract';
import contractJson from './schemas/contract.json' with { type: 'json' };

export const contract = contractFromJson<Contract>(contractJson);

export const db = postgres({
    contract,
    url: env.DATABASE_URL,
});
