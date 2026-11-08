import './polyfills';
import env from '@insignia/env';

import { app } from './app';

app.listen({
    port: env.API_PORT,
    hostname: env.API_HOST,
});
