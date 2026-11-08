import { PUBLIC_API_URL } from '$app/env/public';
import { createInsigniaClient } from '@insignia/sdk';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
    const api = createInsigniaClient({ baseUrl: PUBLIC_API_URL, fetch });

    const result = await api.health.check();

    return {
        result,
    };
};
