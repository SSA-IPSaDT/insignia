import { describe, expect, test } from 'bun:test';

import { takePayload } from '#utils/take-payload';

describe('takePayload', () => {
    test('returns null when there is no payload', () => {
        expect(takePayload('/start')).toBeNull();
    });

    test('returns payload after the command', () => {
        expect(takePayload('/start promo')).toBe('promo');
    });

    test('ignores extra spaces', () => {
        expect(takePayload('/start   promo   ')).toBe('promo');
    });

    test('returns null for an empty message', () => {
        expect(takePayload('')).toBeNull();
    });
});
