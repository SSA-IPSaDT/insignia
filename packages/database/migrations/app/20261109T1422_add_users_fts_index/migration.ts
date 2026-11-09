#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/6391772caa136310008d9a18551ec0a6b29805a3e242fc0a814abaf643c59520/contract';
import startContract from '../../snapshots/6391772caa136310008d9a18551ec0a6b29805a3e242fc0a814abaf643c59520/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/c05561db47bb004c7c8bc79539f89636a8e71dc424d97659472ed9b1395070c6/contract';
import endContract from '../../snapshots/c05561db47bb004c7c8bc79539f89636a8e71dc424d97659472ed9b1395070c6/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropCheckConstraint({
        schema: 'public',
        table: 'telegram_accounts',
        constraint: 'telegram_accounts_first_name_not_empty_82c94c32',
      }),
      this.dropCheckConstraint({
        schema: 'public',
        table: 'telegram_accounts',
        constraint: 'telegram_accounts_user_name_valid_fbee6763',
      }),
      this.dropCheckConstraint({
        schema: 'public',
        table: 'users',
        constraint: 'users_max_org_non_negative_3715d9df',
      }),
      this.alterColumnType({
        schema: 'Admin',
        table: 'admins',
        column: 'created_at',
        type: 'timestamptz',
        operationClass: 'widening',
      }),
      this.alterColumnType({
        schema: 'Admin',
        table: 'admins',
        column: 'updated_at',
        type: 'timestamptz',
        operationClass: 'widening',
      }),
      this.alterColumnType({
        schema: 'Forms',
        table: 'forms',
        column: 'created_at',
        type: 'timestamptz',
        operationClass: 'widening',
      }),
      this.alterColumnType({
        schema: 'Forms',
        table: 'forms',
        column: 'updated_at',
        type: 'timestamptz',
        operationClass: 'widening',
      }),
      this.alterColumnType({
        schema: 'Forms',
        table: 'screens',
        column: 'created_at',
        type: 'timestamptz',
        operationClass: 'widening',
      }),
      this.alterColumnType({
        schema: 'Forms',
        table: 'screens',
        column: 'updated_at',
        type: 'timestamptz',
        operationClass: 'widening',
      }),
      this.alterColumnType({
        schema: 'Organization',
        table: 'events',
        column: 'created_at',
        type: 'timestamptz',
        operationClass: 'widening',
      }),
      this.alterColumnType({
        schema: 'Organization',
        table: 'events',
        column: 'updated_at',
        type: 'timestamptz',
        operationClass: 'widening',
      }),
      this.alterColumnType({
        schema: 'Organization',
        table: 'organization_members',
        column: 'created_at',
        type: 'timestamptz',
        operationClass: 'widening',
      }),
      this.alterColumnType({
        schema: 'Organization',
        table: 'organization_members',
        column: 'updated_at',
        type: 'timestamptz',
        operationClass: 'widening',
      }),
      this.alterColumnType({
        schema: 'Organization',
        table: 'organizations',
        column: 'created_at',
        type: 'timestamptz',
        operationClass: 'widening',
      }),
      this.alterColumnType({
        schema: 'Organization',
        table: 'organizations',
        column: 'updated_at',
        type: 'timestamptz',
        operationClass: 'widening',
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'telegram_accounts',
        column: 'created_at',
        type: 'timestamptz',
        operationClass: 'widening',
      }),
      this.setNotNull({ schema: 'public', table: 'telegram_accounts', column: 'language_code' }),
      this.alterColumnType({
        schema: 'public',
        table: 'telegram_accounts',
        column: 'updated_at',
        type: 'timestamptz',
        operationClass: 'widening',
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'users',
        column: 'created_at',
        type: 'timestamptz',
        operationClass: 'widening',
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'users',
        column: 'updated_at',
        type: 'timestamptz',
        operationClass: 'widening',
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'telegram_accounts',
        constraint: 'telegram_accounts_first_name_length_62e5301a',
        expression: sql`length(trim(first_name)) > 0 AND length(first_name) <= 64`,
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'telegram_accounts',
        constraint: 'telegram_accounts_last_name_length_2e491ea3',
        expression: sql`last_name IS NULL OR (length(trim(last_name)) > 0 AND length(last_name) <= 64)`,
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'telegram_accounts',
        constraint: 'telegram_accounts_user_name_valid_3e9dd5e9',
        expression: sql`user_name IS NULL OR (length(user_name) >= 4 AND length(user_name) <= 32 AND user_name ~ '^[A-Za-z0-9_]+$')`,
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'users',
        constraint: 'users_email_length_8c6ae839',
        expression: sql`email IS NULL OR length(email) <= 255`,
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'users',
        constraint: 'users_first_name_length_62e5301a',
        expression: sql`length(trim(first_name)) > 0 AND length(first_name) <= 64`,
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'users',
        constraint: 'users_last_name_length_2e491ea3',
        expression: sql`last_name IS NULL OR (length(trim(last_name)) > 0 AND length(last_name) <= 64)`,
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'users',
        constraint: 'users_max_org_range_2ff3ebe0',
        expression: sql`max_organization_can_create >= 0 AND max_organization_can_create <= 8`,
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'users',
        constraint: 'users_patronymic_length_a29f815b',
        expression: sql`patronymic IS NULL OR (length(trim(patronymic)) > 0 AND length(patronymic) <= 64)`,
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'users',
        constraint: 'users_phone_e164_format_0e87e514',
        expression: sql`phone IS NULL OR phone ~ '^\\+[1-9][0-9]{9,14}$'`,
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'users',
        constraint: 'users_user_name_valid_241b4161',
        expression: sql`user_name IS NULL OR (length(user_name) >= 3 AND length(user_name) <= 32 AND user_name ~ '^[a-zA-Z0-9_-]+$')`,
      }),
      this.createIndex({
        schema: 'public',
        table: 'users',
        index: 'users_search_1bbce416',
        expression: sql`(setweight(to_tsvector('russian', coalesce("last_name", '')), 'A') || setweight(to_tsvector('russian', coalesce("first_name", '')), 'A') || setweight(to_tsvector('russian', coalesce("patronymic", '')), 'B') || setweight(to_tsvector('russian', coalesce("email", '')), 'C'))`,
        extras: { type: 'gin', where: sql`deleted_at IS NULL` },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
