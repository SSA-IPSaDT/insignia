#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/6391772caa136310008d9a18551ec0a6b29805a3e242fc0a814abaf643c59520/contract';
import endContract from '../../snapshots/6391772caa136310008d9a18551ec0a6b29805a3e242fc0a814abaf643c59520/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/6a4bc7dda6e25fd6f66b04a72256322a1057c6af5888ad26b2af898db89284ad/contract';
import startContract from '../../snapshots/6a4bc7dda6e25fd6f66b04a72256322a1057c6af5888ad26b2af898db89284ad/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  lit,
  primaryKey,
  sql,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'Admin' }),
      this.createSchema({ schema: 'Forms' }),
      this.createSchema({ schema: 'Organization' }),
      this.dropTable({ schema: 'public', table: 'Post' }),
      this.dropTable({ schema: 'public', table: 'User' }),
      this.createTable({
        schema: 'Admin',
        table: 'admins',
        columns: [
          col('created_at', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('deleted_at', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('role', 'text', {
            notNull: true,
            default: lit('admin'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updated_at', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('user_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression('admins_role_check_40654b6c', sql`"role" IN ('super_admin', 'admin')`),
        ],
      }),
      this.createTable({
        schema: 'Forms',
        table: 'forms',
        columns: [
          col('author_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('cover_url', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('created_at', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('deleted_at', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('event_id', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'character(21)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 21 } },
          }),
          col('is_published', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('organization_id', 'uuid', { codecRef: { codecId: 'pg/uuid@1' } }),
          col('slug', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updated_at', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'forms_event_requires_org_7010c256',
            sql`event_id IS NULL OR organization_id IS NOT NULL`,
          ),
          checkExpression(
            'forms_slug_format_cec54b45',
            sql`slug IS NULL OR (length(slug) >= 3 AND slug ~ '^[a-z0-9_-]+$')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'Forms',
        table: 'screens',
        columns: [
          col('created_at', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('form_id', 'character(21)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 21 } },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('order', 'numeric(2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 2 } },
          }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updated_at', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'Organization',
        table: 'events',
        columns: [
          col('created_at', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('deleted_at', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('ends_at', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('location', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('organization_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('slug', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('starts_at', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('draft'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updated_at', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'events_date_order_valid_f243873a',
            sql`starts_at IS NULL OR ends_at IS NULL OR ends_at >= starts_at`,
          ),
          checkExpression(
            'events_slug_format_cec54b45',
            sql`slug IS NULL OR (length(slug) >= 3 AND slug ~ '^[a-z0-9_-]+$')`,
          ),
          checkExpression(
            'events_status_check_78a8b61c',
            sql`"status" IN ('active', 'archived', 'draft', 'moderation')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'Organization',
        table: 'organization_members',
        columns: [
          col('created_at', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('organization_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('role', 'text', {
            notNull: true,
            default: lit('member'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('title', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('updated_at', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('user_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'organization_members_role_check_6fe38eb6',
            sql`"role" IN ('admin', 'moderator', 'member')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'Organization',
        table: 'organizations',
        columns: [
          col('created_at', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('deleted_at', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('is_verified', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('logo_url', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('owner_id', 'uuid', { codecRef: { codecId: 'pg/uuid@1' } }),
          col('slug', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('active'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updated_at', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'organizations_slug_format_cec54b45',
            sql`slug IS NULL OR (length(slug) >= 3 AND slug ~ '^[a-z0-9_-]+$')`,
          ),
          checkExpression(
            'organizations_status_check_28420b15',
            sql`"status" IN ('active', 'archived')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'telegram_accounts',
        columns: [
          col('allows_write_to_pm', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('created_at', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('first_name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('is_bot', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('is_premium', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('language_code', 'character varying(10)', {
            default: lit('ru'),
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 10 } },
          }),
          col('last_name', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('photo_url', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('telegram_id', 'int8', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('updated_at', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('user_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('user_name', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'telegram_accounts_first_name_not_empty_82c94c32',
            sql`length(trim(first_name)) > 0`,
          ),
          checkExpression('telegram_accounts_telegram_id_positive_f7aaf7e7', sql`telegram_id > 0`),
          checkExpression(
            'telegram_accounts_user_name_valid_fbee6763',
            sql`user_name IS NULL OR (length(user_name) >= 4 AND user_name ~ '^[A-Za-z0-9_]+$')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'users',
        columns: [
          col('avatar_url', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('birth_date', 'date', { codecRef: { codecId: 'pg/date-temporal@1' } }),
          col('created_at', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('deleted_at', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('email', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('first_name', 'text', {
            notNull: true,
            default: lit('Anonymous'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('last_name', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('max_organization_can_create', 'int2', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int2@1' },
          }),
          col('patronymic', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('phone', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('updated_at', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('user_name', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression('users_birth_date_after_1940_010e7251', sql`birth_date >= '1940-01-01'`),
          checkExpression(
            'users_max_org_non_negative_3715d9df',
            sql`max_organization_can_create >= 0`,
          ),
        ],
      }),
      this.addUnique({
        schema: 'public',
        table: 'telegram_accounts',
        constraint: 'telegram_accounts_telegram_id_key',
        columns: ['telegram_id'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'telegram_accounts',
        constraint: 'telegram_accounts_user_id_key',
        columns: ['user_id'],
      }),
      this.createIndex({
        schema: 'Admin',
        table: 'admins',
        index: 'admins_created_at_idx_225d8c0f',
        columns: ['created_at'],
      }),
      this.createIndex({
        schema: 'Admin',
        table: 'admins',
        index: 'admins_user_id_active_unique_783d27f3',
        columns: ['user_id'],
        extras: { where: sql`deleted_at IS NULL`, unique: true },
      }),
      this.createIndex({
        schema: 'Admin',
        table: 'admins',
        index: 'admins_user_id_idx_6c952402',
        columns: ['user_id'],
      }),
      this.createIndex({
        schema: 'Forms',
        table: 'forms',
        index: 'forms_author_id_idx_f3862461',
        columns: ['author_id'],
      }),
      this.createIndex({
        schema: 'Forms',
        table: 'forms',
        index: 'forms_created_at_idx_225d8c0f',
        columns: ['created_at'],
      }),
      this.createIndex({
        schema: 'Forms',
        table: 'forms',
        index: 'forms_event_id_idx_a0568112',
        columns: ['event_id'],
      }),
      this.createIndex({
        schema: 'Forms',
        table: 'forms',
        index: 'forms_organization_id_idx_1a5cd3f5',
        columns: ['organization_id'],
      }),
      this.createIndex({
        schema: 'Forms',
        table: 'forms',
        index: 'forms_slug_active_unique_5ec954d3',
        columns: ['slug'],
        extras: { where: sql`deleted_at IS NULL`, unique: true },
      }),
      this.createIndex({
        schema: 'Forms',
        table: 'screens',
        index: 'screens_created_at_idx_225d8c0f',
        columns: ['created_at'],
      }),
      this.createIndex({
        schema: 'Forms',
        table: 'screens',
        index: 'screens_form_id_idx_fd1b617b',
        columns: ['form_id'],
      }),
      this.createIndex({
        schema: 'Forms',
        table: 'screens',
        index: 'screens_form_id_order_idx_b3948cd6',
        columns: ['form_id', 'order'],
      }),
      this.createIndex({
        schema: 'Organization',
        table: 'events',
        index: 'events_created_at_idx_225d8c0f',
        columns: ['created_at'],
      }),
      this.createIndex({
        schema: 'Organization',
        table: 'events',
        index: 'events_organization_id_idx_1a5cd3f5',
        columns: ['organization_id'],
      }),
      this.createIndex({
        schema: 'Organization',
        table: 'events',
        index: 'events_slug_active_unique_5ec954d3',
        columns: ['slug'],
        extras: { where: sql`deleted_at IS NULL`, unique: true },
      }),
      this.createIndex({
        schema: 'Organization',
        table: 'organization_members',
        index: 'org_members_org_user_unique_13349e03',
        columns: ['organization_id', 'user_id'],
        extras: { unique: true },
      }),
      this.createIndex({
        schema: 'Organization',
        table: 'organization_members',
        index: 'organization_members_created_at_idx_225d8c0f',
        columns: ['created_at'],
      }),
      this.createIndex({
        schema: 'Organization',
        table: 'organization_members',
        index: 'organization_members_organization_id_idx_1a5cd3f5',
        columns: ['organization_id'],
      }),
      this.createIndex({
        schema: 'Organization',
        table: 'organization_members',
        index: 'organization_members_user_id_idx_6c952402',
        columns: ['user_id'],
      }),
      this.createIndex({
        schema: 'Organization',
        table: 'organizations',
        index: 'organizations_created_at_idx_225d8c0f',
        columns: ['created_at'],
      }),
      this.createIndex({
        schema: 'Organization',
        table: 'organizations',
        index: 'organizations_owner_id_idx_ade9f347',
        columns: ['owner_id'],
      }),
      this.createIndex({
        schema: 'Organization',
        table: 'organizations',
        index: 'organizations_slug_active_unique_5ec954d3',
        columns: ['slug'],
        extras: { where: sql`deleted_at IS NULL`, unique: true },
      }),
      this.createIndex({
        schema: 'public',
        table: 'telegram_accounts',
        index: 'telegram_accounts_created_at_idx_225d8c0f',
        columns: ['created_at'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'telegram_accounts',
        index: 'telegram_accounts_user_name_lower_unique_2b5feb63',
        expression: sql`lower(user_name)`,
        extras: { where: sql`user_name IS NOT NULL`, unique: true },
      }),
      this.createIndex({
        schema: 'public',
        table: 'users',
        index: 'users_created_at_idx_225d8c0f',
        columns: ['created_at'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'users',
        index: 'users_email_active_unique_12591477',
        columns: ['email'],
        extras: { where: sql`deleted_at IS NULL`, unique: true },
      }),
      this.createIndex({
        schema: 'public',
        table: 'users',
        index: 'users_phone_active_unique_943ab5d2',
        columns: ['phone'],
        extras: { where: sql`deleted_at IS NULL`, unique: true },
      }),
      this.createIndex({
        schema: 'public',
        table: 'users',
        index: 'users_user_name_active_unique_6e7d04a7',
        columns: ['user_name'],
        extras: { where: sql`deleted_at IS NULL`, unique: true },
      }),
      this.addForeignKey({
        schema: 'Admin',
        table: 'admins',
        foreignKey: {
          name: 'admins_user_id_fkey',
          columns: ['user_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'Forms',
        table: 'forms',
        foreignKey: {
          name: 'forms_author_id_fkey',
          columns: ['author_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'Forms',
        table: 'forms',
        foreignKey: {
          name: 'forms_event_id_fkey',
          columns: ['event_id'],
          references: { schema: 'Organization', table: 'events', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
      this.addForeignKey({
        schema: 'Forms',
        table: 'forms',
        foreignKey: {
          name: 'forms_organization_id_fkey',
          columns: ['organization_id'],
          references: { schema: 'Organization', table: 'organizations', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
      this.addForeignKey({
        schema: 'Forms',
        table: 'screens',
        foreignKey: {
          name: 'screens_form_id_fkey',
          columns: ['form_id'],
          references: { schema: 'Forms', table: 'forms', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'Organization',
        table: 'events',
        foreignKey: {
          name: 'events_organization_id_fkey',
          columns: ['organization_id'],
          references: { schema: 'Organization', table: 'organizations', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'Organization',
        table: 'organization_members',
        foreignKey: {
          name: 'organization_members_organization_id_fkey',
          columns: ['organization_id'],
          references: { schema: 'Organization', table: 'organizations', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'Organization',
        table: 'organization_members',
        foreignKey: {
          name: 'organization_members_user_id_fkey',
          columns: ['user_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'Organization',
        table: 'organizations',
        foreignKey: {
          name: 'organizations_owner_id_fkey',
          columns: ['owner_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'telegram_accounts',
        foreignKey: {
          name: 'telegram_accounts_user_id_fkey',
          columns: ['user_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
