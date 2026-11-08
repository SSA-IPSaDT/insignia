import './polyfills';
import { logger } from '#utils/logger';

import { BotService } from './service.js';

const service = new BotService();

const shutdown = async (): Promise<void> => {
    logger.info('Stopping bot service...');
    await service.stop();
    process.exit(0);
};

process.once('SIGINT', () => void shutdown());
process.once('SIGTERM', () => void shutdown());

service.start().catch((error: unknown) => {
    logger.error('Failed to start bot service', error);
    process.exit(1);
});
