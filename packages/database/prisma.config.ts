import env from '@insignia/env';
import { definePrismaConfig } from '@prisma/cli-engine';
import { defineConfig as ormConfig } from '@prisma/orm-postgres/config';

export default definePrismaConfig({
    skills: {
        agents: ['cursor', 'agents'],
    },
    orm: ormConfig({
        contract: './src/prisma/contract.prisma',
        db: {
            connection: env.DATABASE_URL,
        },
    }),
});
