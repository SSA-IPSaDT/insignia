import { db } from '@insignia/database';

import { apiLogger } from '#plugins/logger.plugin';

const logger = apiLogger.child('health');

const DB_TIMEOUT_MS = 2500;

export const checkDatabase = async (): Promise<boolean> => {
    const start = performance.now();

    try {
        const plan = db.raw.sql`
                SELECT
                    1 as ping,
                    current_database() as db_name
            `
            .returnsRow({
                ping: 'pg/int4@1',
                db_name: 'pg/text@1',
            })
            .build();

        const timeoutPromise = new Promise<never>((_, reject) => {
            const timer = setTimeout(() => {
                reject(
                    new Error(
                        `Database health check timed out after ${DB_TIMEOUT_MS}ms`,
                    ),
                );
            }, DB_TIMEOUT_MS);
            timer.unref?.();
        });

        const rows = await Promise.race([db.query(plan), timeoutPromise]);

        const duration = Math.round(performance.now() - start);

        if (!Array.isArray(rows) || rows.length === 0 || rows[0]?.ping !== 1) {
            logger.warn('Database responded with unexpected payload', {
                rows,
                duration,
            });
            return false;
        }
        if (duration > 500) {
            logger.warn(`Database latency is high: ${duration}ms`);
        } else {
            logger.debug(`Database health check passed in ${duration}ms`);
        }
        return true;
    } catch (error) {
        const duration = Math.round(performance.now() - start);
        logger.error('Database health check failed', {
            duration,
            error: error instanceof Error ? error.message : String(error),
        });
        return false;
    }
};
export const checkRedis = async (): Promise<boolean> => {
    return true;
};
