import type { HealthResponse } from '@insignia/contracts';
import { env } from '@insignia/env';
import { createLogger } from '@insignia/logger';

const logger = createLogger('api');

export const getHealth = (): HealthResponse => {
    return {
        status: 'ok',
        timestamp: new Date().toISOString(),
    };
};

logger.info(`API initialized in ${env.NODE_ENV} mode.`);
