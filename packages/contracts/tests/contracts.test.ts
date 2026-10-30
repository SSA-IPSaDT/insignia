import { describe, expect, test } from 'bun:test';

import { healthResponseSchema } from '../src/index';

describe('Contracts Schema Validation', () => {
    test('healthResponseSchema parses valid health payload', () => {
        const payload = {
            status: 'ok',
            timestamp: new Date().toISOString(),
        };

        const result = healthResponseSchema.safeParse(payload);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.status).toBe('ok');
        }
    });

    test('healthResponseSchema rejects invalid status', () => {
        const invalidPayload = {
            status: 'unknown_status',
            timestamp: new Date().toISOString(),
        };

        const result = healthResponseSchema.safeParse(invalidPayload);
        expect(result.success).toBe(false);
    });

    test('healthResponseSchema rejects missing timestamp', () => {
        const invalidPayload = {
            status: 'ok',
        };

        const result = healthResponseSchema.safeParse(invalidPayload);
        expect(result.success).toBe(false);
    });
});
