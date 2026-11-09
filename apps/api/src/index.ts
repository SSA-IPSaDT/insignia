import './polyfills';

import env from '@insignia/env';

import { app } from './app';

const shutdown = async (): Promise<void> => {
    await app.stop();
    process.exit(0);
};

process.once('SIGINT', () => void shutdown());
process.once('SIGTERM', () => void shutdown());

try {
    app.listen({
        port: env.API_PORT,
        hostname: env.API_HOST,
    });
} catch {
    process.exit(1);
}
