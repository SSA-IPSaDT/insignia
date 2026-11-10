import { publicEnvSchema } from '@insignia/env/public';
import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
    PUBLIC_API_URL: {
        public: true,
        static: true,
        description: publicEnvSchema.shape.PUBLIC_API_URL.description,
        schema: publicEnvSchema.shape.PUBLIC_API_URL,
    },
});
