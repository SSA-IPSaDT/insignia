import type { Transport } from '@sveltejs/kit/hooks';
import { Temporal } from 'temporal-polyfill';

export const transport: Transport = {
    PlainDate: {
        encode: (value) =>
            value instanceof Temporal.PlainDate && value.toString(),
        decode: (value) => Temporal.PlainDate.from(value),
    },
    BigInt: {
        encode: (value) => typeof value === 'bigint' && value.toString(),
        decode: (value) => BigInt(value),
    },
};
