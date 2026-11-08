import { PUBLIC_API_URL } from '$app/env/public';
import { createInsigniaClient } from '@insignia/sdk';

export const api = createInsigniaClient({
    baseUrl: PUBLIC_API_URL,
});

export default api;
