import { apiEnv } from '@insignia/env';

import { app } from './app';

app.listen({
    port: apiEnv.API_PORT,
    hostname: apiEnv.API_HOST,
});
