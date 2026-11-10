import { createLazyEnv } from './common';
import { type Env, envSchema } from './schema';

export const env: Env = createLazyEnv(envSchema);
export { populateProcessEnv } from './common';
export { getLocalIp } from './utils';
export default env;
export type { Env };
