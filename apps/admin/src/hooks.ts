import type { Reroute, Transport } from '@sveltejs/kit/hooks';

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
export const transport: Transport = {};
