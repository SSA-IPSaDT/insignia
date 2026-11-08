import type { InsigniaClientOptions } from '#types';

import { createHttpTransport, HealthModule } from './http';

export class InsigniaClient {
    public readonly health: HealthModule;

    constructor(options?: InsigniaClientOptions) {
        const http = createHttpTransport(options);

        this.health = new HealthModule(http);
    }
}

export const createInsigniaClient = (
    options?: InsigniaClientOptions,
): InsigniaClient => new InsigniaClient(options);
