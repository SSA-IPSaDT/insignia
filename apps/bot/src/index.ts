import { env } from '@insignia/env';
import { createLogger } from '@insignia/logger';

const logger = createLogger('bot');

logger.info(`Telegram Bot service initialized in ${env.NODE_ENV} mode.`);
