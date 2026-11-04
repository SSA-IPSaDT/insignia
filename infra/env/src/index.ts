import { createLazyEnv } from './common.js';
import { type Env, envSchema } from './schema.js';

export const env: Env = createLazyEnv(envSchema);
export default env;
export type { Env };
