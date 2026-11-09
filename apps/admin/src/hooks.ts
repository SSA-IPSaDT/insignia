import type { Reroute, Transport } from '@sveltejs/kit/hooks';
import { Temporal } from 'temporal-polyfill';

/**
 * Universal reroute hook.
 * Translates incoming URLs before route matching on both server and client.
 */
export const reroute: Reroute = ({ url }) => {
    return url.pathname;
};

/**
 * Universal transport hook.
 * Defines custom devalue serializers/deserializers for data passed across the network boundary.
 */
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
