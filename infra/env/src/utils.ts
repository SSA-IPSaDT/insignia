import { z } from 'zod';

export const booleanEnv = (defaultValue = false) =>
    z.preprocess((val) => {
        if (typeof val === 'boolean') return val;
        if (typeof val === 'string') {
            const normalized = val.trim().toLowerCase();
            if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
            if (['false', '0', 'no', 'off', ''].includes(normalized))
                return false;
        }
        return val;
    }, z.boolean().default(defaultValue));
