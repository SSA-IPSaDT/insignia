import { afterAll, describe, expect, test } from 'bun:test';

import { contract, db } from '../src/index';

describe('Database Connection & Contract', () => {
    afterAll(async () => {
        await db.close();
    });

    test('contract is loaded and contains models', () => {
        expect(contract).toBeDefined();
        expect(contract.target).toBe('postgres');
        expect(contract.roots.users).toBeDefined();
        expect(contract.roots.forms).toBeDefined();
    });

    test('executes raw SQL ping against PostgreSQL', async () => {
        const plan = db.raw.sql`SELECT 1 as ping`
            .returnsRow({ ping: 'pg/int4@1' })
            .build();
        const result = await db.query(plan);

        expect(result).toBeDefined();
        expect(result.length).toBe(1);
        expect(result[0]?.ping).toBe(1);
    });

    test('can read from User model using Prisma 8 ORM', async () => {
        const users = await db.orm.public.User.select('id', 'email').all();

        expect(Array.isArray(users)).toBe(true);
    });
});
