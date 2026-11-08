import { createLazyEnv } from './common.js';
import { type Env, envSchema } from './schema.js';

export const env: Env = createLazyEnv(envSchema);
export { populateProcessEnv } from './common.js';
export default env;
export type { Env };
