import { describe, expect, test } from 'bun:test';

import { getStartPayload } from '../src/utils';

describe('getStartPayload', () => {
    test('returns null when there is no payload', () => {
        expect(getStartPayload('/start')).toBeNull();
    });

    test('returns payload after the command', () => {
        expect(getStartPayload('/start promo')).toBe('promo');
    });

    test('ignores extra spaces', () => {
        expect(getStartPayload('/start   promo   ')).toBe('promo');
    });

    test('returns null for an empty message', () => {
        expect(getStartPayload('')).toBeNull();
    });
});
