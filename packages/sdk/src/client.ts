import type { InsigniaClientOptions } from '#types';

import { createHttpTransport, HealthModule, UsersModule } from './http';

export class InsigniaClient {
    public readonly health: HealthModule;
    public readonly users: UsersModule;

    constructor(options?: InsigniaClientOptions) {
        const http = createHttpTransport(options);

        this.health = new HealthModule(http);
        this.users = new UsersModule(http);
    }
}

export const createInsigniaClient = (
    options?: InsigniaClientOptions,
): InsigniaClient => new InsigniaClient(options);
