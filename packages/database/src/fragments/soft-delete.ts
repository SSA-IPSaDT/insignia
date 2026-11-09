import { field, type } from '@prisma/orm-postgres/contract-builder';

import { db } from '../db';

/**
 * Универсальный скоуп мягкого удаления.
 * Применим к любой модели со схемным миксином +SoftDelete.
 */
export const activeOnly = db.orm.fragment(
    { deletedAt: field.column(type.TimestamptzTemporal()).optional() },
    (rows) => rows.where((r) => r.deletedAt.isNull()),
);
